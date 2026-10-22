import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { MatrixRain } from '@/components/MatrixRain'

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
    <html lang="en">
      <body className={`${inter.className} bg-black`}>
        <MatrixRain />
        {children}
      </body>
    </html>
  )
}
