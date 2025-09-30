'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from './ThemeToggle'

const NavBar = () => {
  const pathname = usePathname()
  const Item = ({href, label}:{href:string; label:string}) => (
    <Link href={href} className={`px-3 py-2 rounded-xl hover:bg-[rgb(var(--border))]/60 ${pathname===href ? 'bg-[rgb(var(--border))]/80 text-[rgb(var(--text))]' : 'text-[rgb(var(--muted))]'}`}>
      {label}
    </Link>
  )
  return (
    <div className="sticky top-0 z-40 border-b border-[rgb(var(--border))] backdrop-blur bg-[rgb(var(--bg))]/70">
      <div className="container-page">
        <div className="flex items-center h-16 gap-3">
          <Link href="/" className="font-extrabold text-lg">
            <span className="text-brand-600 dark:text-brand-300">Uma</span> Store
          </Link>
          <div className="hidden sm:flex items-center gap-1 ml-4">
            <Item href="/" label="Home"/>
            <Item href="/products/new" label="Add Product"/>
          </div>
          <div className="flex-1" />
          <ThemeToggle/>
        </div>
      </div>
    </div>
  )
}
export default NavBar
