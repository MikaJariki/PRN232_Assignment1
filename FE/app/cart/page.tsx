'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../components/AuthProvider'
import { useCart } from '../../components/CartProvider'

export default function CartPage(){
  const { user, initializing } = useAuth()
  const cart = useCart()
  const router = useRouter()

  if (initializing) return <p className="text-[rgb(var(--muted))]">Loading...</p>
  if (!user) return (
    <div className="card space-y-3 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold">Login required</h2>
      <p className="text-[rgb(var(--muted))]">Sign in to manage your cart.</p>
      <div className="flex gap-2">
        <Link className="btn btn-primary" href="/login?next=/cart">Go to Login</Link>
        <Link className="btn btn-neutral" href="/register?next=/cart">Create Account</Link>
      </div>
    </div>
  )

  const isEmpty = cart.items.length === 0

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Your Cart</h1>
          <p className="text-[rgb(var(--muted))]">
            {isEmpty ? 'Add some products to get started.' : 'Review items, adjust quantities and choose how you want to pay.'}
          </p>
        </div>
        {!isEmpty && (
          <div className="flex items-center gap-3 text-sm text-[rgb(var(--muted))]">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-3 py-1 text-brand-600 dark:text-brand-300">
              <span className="inline-flex h-2 w-2 rounded-full bg-brand-500 dark:bg-brand-300"></span>
              <span>{cart.count} {cart.count === 1 ? 'item' : 'items'}</span>
            </span>
            <div className="chip bg-emerald-500/10 text-emerald-600 dark:text-emerald-200">
              ${cart.total.toFixed(2)} total
            </div>
          </div>
        )}
      </div>

      {cart.loading && cart.items.length === 0 ? (
        <div className="card animate-pulse space-y-3">
          <div className="h-4 w-24 rounded bg-[rgb(var(--border))]"></div>
          <div className="h-3 w-full rounded bg-[rgb(var(--border))]/60"></div>
          <div className="h-3 w-1/2 rounded bg-[rgb(var(--border))]/60"></div>
        </div>
      ) : isEmpty ? (
        <div className="card flex flex-col items-center gap-6 py-12 text-center">
          <div className="h-48 w-48 overflow-hidden rounded-2xl bg-white shadow-soft">
            <img
              src="https://iili.io/KkUVI0F.jpg"
              alt="Empty cart illustration"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Your cart is feeling lonely</h2>
            <p className="text-[rgb(var(--muted))]">Browse the catalogue and add products you love.</p>
          </div>
          <Link className="btn btn-primary" href="/">Browse products</Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <section className="space-y-4">
            {cart.items.map(item => (
              <div key={item.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 overflow-hidden rounded-2xl border border-[rgb(var(--border))]">
                    <img
                      src={item.image || `https://picsum.photos/seed/${item.productId}/300/300`}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold leading-tight">{item.name}</h2>
                    <p className="text-sm text-[rgb(var(--muted))] line-clamp-2">{item.description}</p>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="chip">${item.price.toFixed(2)} / item</span>
                      <span className="chip bg-emerald-500/10 text-emerald-600 dark:text-emerald-200">
                        Line total: ${item.lineTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
                  <div className="flex items-center gap-2 rounded-full border border-[rgb(var(--border))] px-3 py-1.5">
                    <button
                      className="text-lg font-semibold leading-none disabled:opacity-50"
                      onClick={() => cart.update(item.id, Math.max(1, item.quantity - 1))}
                      disabled={cart.loading}
                      aria-label={`Decrease ${item.name} quantity`}
                    >
                      –
                    </button>
                    <span className="w-10 text-center font-semibold">×{item.quantity}</span>
                    <button
                      className="text-lg font-semibold leading-none disabled:opacity-50"
                      onClick={() => cart.update(item.id, item.quantity + 1)}
                      disabled={cart.loading}
                      aria-label={`Increase ${item.name} quantity`}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="btn btn-danger"
                    onClick={() => cart.remove(item.id)}
                    disabled={cart.loading}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </section>

          <aside className="space-y-4">
            <div className="card space-y-4 p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Order Summary</h2>
                <span className="chip bg-brand-500/10 text-brand-600 dark:text-brand-300">
                  {cart.count} {cart.count === 1 ? 'item' : 'items'}
                </span>
              </div>
              <div className="space-y-2 text-sm text-[rgb(var(--muted))]">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-[rgb(var(--text))]">${cart.total.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span className="font-medium text-[rgb(var(--text))]">Free</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Taxes</span>
                  <span className="font-medium text-[rgb(var(--text))]">$0.00</span>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-[rgb(var(--border))] pt-4">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold">${cart.total.toFixed(2)}</span>
              </div>
              <div className="flex flex-col gap-2">
                <button className="btn btn-primary w-full" onClick={() => router.push('/checkout')} disabled={cart.loading}>
                  Proceed to Checkout
                </button>
                <button className="btn btn-ghost w-full" onClick={() => cart.clear()} disabled={cart.loading}>
                  Clear cart
                </button>
              </div>
            </div>
            <div className="card space-y-3 p-4 text-sm text-[rgb(var(--muted))]">
              <div className="font-semibold text-[rgb(var(--text))]">Need help?</div>
              <p>Payments are processed securely via Stripe. You can review your order history at any time.</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}


