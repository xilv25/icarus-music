import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Icarus - Music Player',
  description: 'Enterprise music streaming experience',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
