'use client'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '../../../components/AuthProvider'
import { getOrder, getProduct } from '../../../lib/api'
import { OrderDetails } from '../../../lib/types'
import { useToast } from '../../../components/ToastProvider'

export default function OrderDetailPage(){
  const params = useParams()
  const router = useRouter()
  const id = String(params?.id ?? '')
  const { user, initializing } = useAuth()
  const toast = useToast()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [redirecting, setRedirecting] = useState(false)
  const [productImages, setProductImages] = useState<Record<string, string | undefined>>({})

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const data = await getOrder(id)
        if (!cancelled) setOrder(data)
      } catch (err) {
        if (!cancelled) toast.error(err instanceof Error ? err.message : 'Failed to load order')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id, toast, user])

  useEffect(() => {
    if (!order) return
    const pending = order.items.filter(item => !productImages[item.productId])
    if (pending.length === 0) return
    let cancelled = false
    ;(async () => {
      const entries = await Promise.all(
        pending.map(async item => {
          const product = await getProduct(item.productId)
          return [item.productId, product?.image] as const
        })
      )
      if (!cancelled) {
        setProductImages(prev => {
          const next = { ...prev }
          for (const [key, url] of entries) {
            if (url) next[key] = url
          }
          return next
        })
      }
    })()
    return () => { cancelled = true }
  }, [order, productImages])

  function handleRedirectToCheckout(){
    setRedirecting(true)
    const resumeQuery = `resume=${encodeURIComponent(id)}`
    router.push(`/checkout?${resumeQuery}`)
  }

  if (initializing) return <p className="text-[rgb(var(--muted))]">Loading...</p>
  if (!user) return (
    <div className="card space-y-3 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold">Login required</h2>
      <p className="text-[rgb(var(--muted))]">Sign in to view order details.</p>
      <div className="flex gap-2">
        <Link className="btn btn-primary" href={`/login?next=/orders/${id}`}>Go to Login</Link>
        <Link className="btn btn-neutral" href={`/register?next=/orders/${id}`}>Create Account</Link>
      </div>
    </div>
  )

  if (loading) return <p className="text-[rgb(var(--muted))]">Loading order...</p>
  if (!order) return (
    <div className="card space-y-3 max-w-xl mx-auto">
      <p className="text-[rgb(var(--muted))]">Order not found.</p>
      <Link className="btn btn-primary w-fit" href="/orders">Back to orders</Link>
    </div>
  )

  const paid = order.status === 'paid'

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-[rgb(var(--muted))]">Order number</p>
          <h1 className="text-3xl font-bold tracking-tight">{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-sm text-[rgb(var(--muted))]">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`chip text-sm ${paid ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-200' : 'bg-amber-500/10 text-amber-600 dark:text-amber-300'}`}
          >
            {paid ? 'Paid' : 'Awaiting payment'}
          </span>
          <span className="chip bg-brand-500/10 text-brand-600 dark:text-brand-300">
            Total ${order.totalAmount.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section className="card divide-y divide-[rgb(var(--border))] overflow-hidden p-0">
          {order.items.map(item => (
            <div key={item.productId} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 overflow-hidden rounded-2xl border border-[rgb(var(--border))]">
                  <img
                    src={productImages[item.productId] || `https://picsum.photos/seed/${item.productId}/300/300`}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold">{item.name}</p>
                  <p className="text-sm text-[rgb(var(--muted))]">{item.description}</p>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="chip">${item.price.toFixed(2)} each</span>
                    <span className="chip bg-slate-500/10 text-slate-600 dark:text-slate-200">×{item.quantity}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm uppercase tracking-wide text-[rgb(var(--muted))]">Line total</p>
                <p className="text-xl font-semibold">${item.lineTotal.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </section>

        <aside className="space-y-4">
          <div className="card space-y-4 p-6 shadow-lg">
            <div>
              <p className="text-sm uppercase tracking-wide text-[rgb(var(--muted))]">Payment summary</p>
              <p className="text-2xl font-bold">${order.totalAmount.toFixed(2)}</p>
            </div>
            <div className="space-y-2 text-sm text-[rgb(var(--muted))]">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-[rgb(var(--text))]">${order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span className="font-medium text-[rgb(var(--text))]">Free</span>
              </div>
            </div>
            {order.paidAt ? (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-200">
                Paid on {new Date(order.paidAt).toLocaleString()}
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-200">
                Payment pending. Complete payment to receive your items.
              </div>
            )}
            <div className="flex flex-col gap-2">
              <button type="button" className="btn btn-primary" onClick={() => router.push('/orders')}>
                Back to all orders
              </button>
              {!paid && (
                <button
                  type="button"
                  className="btn btn-neutral"
                  onClick={handleRedirectToCheckout}
                  disabled={redirecting}
                >
                  {redirecting ? 'Redirecting…' : 'Confirm payment'}
                </button>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
