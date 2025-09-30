import type { Metadata } from 'next'
import './globals.css'
import NavBar from '../components/NavBar'
import { ToastProvider } from '../components/ToastProvider'

export const metadata: Metadata = {
  title: 'Uma Store – Pretty Fixed',
  description: 'Assignment-ready UI with polished styling and robust theme switcher',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ToastProvider>
          <NavBar/>
          <main className="container-page py-6">{children}</main>
        </ToastProvider>
      </body>
    </html>
  )
}
