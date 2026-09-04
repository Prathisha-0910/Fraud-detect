import { PrismaClient } from '@prisma/client'
import { DEMO_SAFE_TRANSACTIONS, DEMO_FRAUD_EVENTS } from '../lib/demo-data'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding SENTRA database...')

  // 1. Ensure demo user exists
  const user = await prisma.user.upsert({
    where: { email: 'priya@sentra.demo' },
    update: {},
    create: {
      id: 'demo-user',
      name: 'Priya Sharma',
      email: 'priya@sentra.demo',
      riskBaseline: 10,
      safetyPreferences: JSON.stringify({
        guardianNotifications: true,
        autoPauseOnCritical: true,
        highRiskSmsAlerts: true,
      }),
    },
  })
  console.log(`✓ User ready: ${user.name} (${user.id})`)

  // 2. Ensure demo guardian exists
  const guardian = await prisma.guardian.upsert({
    where: { id: 'guardian_demo_1' },
    update: {},
    create: {
      id: 'guardian_demo_1',
      userId: user.id,
      name: 'Suresh Sharma',
      relationship: 'son',
      contact: 'suresh.guardian@example.com',
      active: true,
    },
  })
  console.log(`✓ Guardian ready: ${guardian.name} (${guardian.contact})`)

  // 3. Seed baseline safe transactions if none exist
  const existingTxnCount = await prisma.transaction.count({
    where: { userId: user.id },
  })

  if (existingTxnCount === 0) {
    console.log('Seeding baseline safe transactions...')
    for (const t of DEMO_SAFE_TRANSACTIONS) {
      const createdTxn = await prisma.transaction.create({
        data: {
          id: t.id,
          userId: user.id,
          amount: t.amount,
          payee: t.payee,
          payeeIsNew: t.payeeIsNew,
          payeeType: t.payeeType,
          timestamp: t.timestamp,
          status: t.status,
          suspiciousCall: t.suspiciousCall,
          urgentMessage: t.urgentMessage,
          suspiciousUrl: t.suspiciousUrl,
          previousWarning: t.previousWarning,
          riskScore: t.riskScore,
          riskLevel: t.riskLevel,
          isSimulated: false,
        },
      })

      await prisma.riskAssessment.create({
        data: {
          userId: user.id,
          transactionId: createdTxn.id,
          finalScore: t.riskScore,
          riskLevel: t.riskLevel,
          confidence: 0.95,
          intervention: 'allow',
          explanation: t.explanation,
          contextScore: 0,
          behaviourScore: 5,
          velocityScore: 0,
          reputationScore: 0,
          documentScore: 0,
          cumulativeScore: 0,
          detectedSignals: JSON.stringify([]),
        },
      })
    }
    console.log(`✓ Seeded ${DEMO_SAFE_TRANSACTIONS.length} baseline safe transactions.`)

    // Seed baseline unacknowledged / initial events
    for (const evt of DEMO_FRAUD_EVENTS.slice(0, 2)) {
      await prisma.fraudEvent.create({
        data: {
          id: evt.id,
          userId: user.id,
          eventType: evt.eventType,
          description: evt.description,
          riskScore: evt.riskScore,
          severity: evt.severity,
          timestamp: evt.timestamp,
          acknowledged: evt.acknowledged,
          metadata: JSON.stringify({}),
        },
      })
    }
    console.log(`✓ Seeded initial fraud events.`)
  } else {
    console.log(`User already has ${existingTxnCount} transactions; skipping initial seed.`)
  }

  console.log('Seed completed successfully!')
}

main()
  .catch(e => {
    console.error('Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
