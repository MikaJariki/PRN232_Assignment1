'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import ThemeToggle from './ThemeToggle'
import { useAuth } from './AuthProvider'
import { useCart } from './CartProvider'

const NavBar = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { count } = useCart()

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname?.startsWith(href)
  }

  const navItems = [
    { href: '/', label: 'Home', visible: true },
    { href: '/products/new', label: 'Add Product', visible: !!user },
    { href: '/cart', label: 'Cart', visible: !!user, isCart: true },
    { href: '/orders', label: 'Orders', visible: !!user }
  ]

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="sticky top-0 z-40 border-b border-[rgb(var(--border))] backdrop-blur bg-[rgb(var(--bg))]/70">
      <div className="container-page">
        <div className="flex items-center h-16 gap-3">
          <Link href="/" className="font-extrabold text-lg">
            <span className="text-brand-600 dark:text-brand-300">Uma</span> Store
          </Link>
          <div className="hidden sm:flex items-center gap-1 ml-4">
            {navItems.filter(item => item.visible).map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-[rgb(var(--border))]/60 ${
                  isActive(item.href)
                    ? 'bg-[rgb(var(--border))]/80 text-[rgb(var(--text))]'
                    : 'text-[rgb(var(--muted))]'
                }`}
              >
                <span>{item.label}</span>
                {item.isCart && count > 0 && (
                  <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-brand-500 px-1 text-xs font-semibold text-white">
                    {count}
                  </span>
                )}
              </Link>
            ))}
          </div>
          <div className="sm:hidden flex items-center gap-2 ml-auto">
            {navItems.filter(item => item.visible).map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1 rounded-lg px-2 py-1 text-sm hover:bg-[rgb(var(--border))]/60 ${
                  isActive(item.href)
                    ? 'bg-[rgb(var(--border))]/80 text-[rgb(var(--text))]'
                    : 'text-[rgb(var(--muted))]'
                }`}
              >
                <span>{item.label}</span>
                {item.isCart && count > 0 && (
                  <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-brand-500 px-1 text-xs font-semibold text-white">
                    {count}
                  </span>
                )}
              </Link>
            ))}
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            {!user ? (
              <>
                <Link href="/login" className="btn btn-neutral hidden sm:inline-flex">Login</Link>
                <Link href="/register" className="btn btn-primary">Sign Up</Link>
              </>
            ) : (
              <>
                <span className="hidden md:block text-sm text-[rgb(var(--muted))]">{user.email}</span>
                <button className="btn btn-neutral" onClick={handleLogout}>Logout</button>
              </>
            )}
            <ThemeToggle/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NavBar
