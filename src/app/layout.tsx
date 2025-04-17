import { Inter } from 'next/font/google'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'
import 'primereact/resources/themes/lara-light-indigo/theme.css'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Frontend Test - Comment Dashboard',
  description: 'A NextJS application for managing comments',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  )
}