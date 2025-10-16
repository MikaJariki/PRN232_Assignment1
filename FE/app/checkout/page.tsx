'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { useCart } from '../../components/CartProvider'
import { useToast } from '../../components/ToastProvider'

export default function CheckoutPage(){
  const { user, initializing } = useAuth()
  const cart = useCart()
  const toast = useToast()
  const router = useRouter()
  const [processing, setProcessing] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  if (initializing) return <p className="text-[rgb(var(--muted))]">Loading...</p>
  if (!user) return (
    <div className="card space-y-3 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold">Login required</h2>
      <p className="text-[rgb(var(--muted))]">Sign in to place an order.</p>
      <div className="flex gap-2">
        <Link className="btn btn-primary" href="/login?next=/checkout">Go to Login</Link>
        <Link className="btn btn-neutral" href="/register?next=/checkout">Create Account</Link>
      </div>
    </div>
  )

  if (cart.items.length === 0) return (
    <div className="card space-y-3 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold">No items to checkout</h2>
      <p className="text-[rgb(var(--muted))]">Add products to your cart before checking out.</p>
      <Link className="btn btn-primary w-fit" href="/">Browse products</Link>
    </div>
  )

  async function handleCheckout(){
    try {
      setProcessing(true)
      const order = await cart.checkout(true)
      router.push(`/orders/${order.id}`)
    } catch {
      // errors handled via cart provider toast
    } finally {
      setProcessing(false)
    }
  }

  async function handleStripe(){
    try {
      setRedirecting(true)
      const { checkoutUrl } = await cart.checkoutWithStripe()
      window.location.href = checkoutUrl
    } catch {
      // errors handled via provider
    } finally {
      setRedirecting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="text-[rgb(var(--muted))]">Confirm your order details below.</p>
      </div>

      <div className="card space-y-4 p-0">
        {cart.items.map(item => (
          <div key={item.id} className="flex flex-col gap-4 border-b border-[rgb(var(--border))] p-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-2xl border border-[rgb(var(--border))]">
                <img
                  src={item.image || `https://picsum.photos/seed/${item.productId}/300/300`}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold leading-tight">{item.name}</p>
                <p className="text-sm text-[rgb(var(--muted))]">{item.description}</p>
                <div className="flex items-center gap-2 text-sm text-[rgb(var(--muted))]">
                  <span>${item.price.toFixed(2)} each</span>
                  <span className="chip bg-slate-500/10 text-slate-600 dark:text-slate-200">×{item.quantity}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-[rgb(var(--muted))]">Line total</p>
              <p className="text-lg font-semibold">${item.lineTotal.toFixed(2)}</p>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between px-5 pb-5 pt-3">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-2xl font-bold">${cart.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="btn btn-neutral" onClick={() => router.push('/cart')} disabled={processing || redirecting || cart.loading}>
          Back to Cart
        </button>
        <button className="btn btn-primary" onClick={handleStripe} disabled={processing || redirecting || cart.loading}>
          {redirecting ? 'Redirecting...' : 'Pay with Stripe'}
        </button>
        <button className="btn btn-neutral" onClick={handleCheckout} disabled={processing || redirecting || cart.loading}>
          {processing ? 'Processing...' : 'Place Order (manual)'}
        </button>
      </div>
    </div>
  )
}
