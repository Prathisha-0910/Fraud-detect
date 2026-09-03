import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/sentra/Sidebar'
import { TopBar } from '@/components/sentra/TopBar'

export const metadata: Metadata = {
  title: 'SENTRA — Every Rupee Protected',
  description: 'Amount-Agnostic Fraud Intelligence Platform for vulnerable users',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen">
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar Navigation */}
          <Sidebar />
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <TopBar />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
