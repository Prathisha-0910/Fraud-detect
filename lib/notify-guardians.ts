import { prisma } from '@/lib/db'
import { Resend } from 'resend'

export interface GuardianNotificationPayload {
  id: string
  amount: number
  payee: string
  riskScore: number
}

/**
 * Notify all active guardians for a user when a critical fraud event occurs.
 * If RESEND_API_KEY is configured in .env, sends live emails.
 * Otherwise logs the alert cleanly for demo resilience.
 */
export async function notifyGuardians(
  userId: string,
  transaction: GuardianNotificationPayload
) {
  try {
    const guardians = await prisma.guardian.findMany({
      where: { userId, active: true },
    })

    if (!guardians || guardians.length === 0) {
      console.log(`[notifyGuardians] No active guardians found for user ${userId}`)
      return
    }

    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey || apiKey.trim() === '') {
      console.log(
        `[notifyGuardians] (Demo/Dev Mode) Triggered guardian notifications for ${guardians.length} guardian(s):`
      )
      for (const g of guardians) {
        console.log(
          `  -> To: ${g.name} <${g.contact}> | Subject: SENTRA CRITICAL ALERT — ${transaction.payee} | Risk: ${transaction.riskScore}/100 | Amount: ₹${transaction.amount}`
        )
      }
      return
    }

    const resend = new Resend(apiKey)

    await Promise.all(
      guardians.map(async g => {
        if (g.contact.includes('@')) {
          try {
            await resend.emails.send({
              from: 'SENTRA Alerts <onboarding@resend.dev>',
              to: g.contact,
              subject: `SENTRA CRITICAL ALERT — ${transaction.payee}`,
              text: `URGENT: A payment of ₹${transaction.amount} to ${transaction.payee} was blocked by SENTRA. Risk score: ${transaction.riskScore}/100. Please check in with your family member.`,
            })
            console.log(`[notifyGuardians] Alert email dispatched to ${g.contact}`)
          } catch (emailErr) {
            console.error(`[notifyGuardians] Failed to send email to ${g.contact}:`, emailErr)
          }
        }
      })
    )
  } catch (error) {
    console.error('[notifyGuardians] Error in notifyGuardians:', error)
  }
}
