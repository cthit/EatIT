import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { MatrixRainToggle } from '@/components/MatrixRainToggle'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EatIT',
  description: 'A simple app for ordering food together at Chalmers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-gray-100 text-gray-900">
      <body className={`${inter.className}`}>
        <MatrixRainToggle />
        {children}
      </body>
    </html>
  )
}
