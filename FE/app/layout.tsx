import type { Metadata } from 'next'
import './globals.css'
import NavBar from '../components/NavBar'

export const metadata: Metadata = {
  title: 'FlexStore (Mock) – Pretty Fixed',
  description: 'Assignment-ready UI with polished styling and robust theme switcher',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <NavBar/>
        <main className="container-page py-6">{children}</main>
      </body>
    </html>
  )
}
