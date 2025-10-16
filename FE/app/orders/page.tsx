'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { listOrders } from '../../lib/api'
import { OrderSummary } from '../../lib/types'
import { useToast } from '../../components/ToastProvider'

export default function OrdersPage(){
  const { user, initializing } = useAuth()
  const toast = useToast()
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setOrders([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    listOrders()
      .then(res => { if (!cancelled) setOrders(res) })
      .catch(err => { if (!cancelled) toast.error(err instanceof Error ? err.message : 'Failed to load orders') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [toast, user])

  if (initializing) return <p className="text-[rgb(var(--muted))]">Loading...</p>
  if (!user) return (
    <div className="card space-y-3 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold">Login required</h2>
      <p className="text-[rgb(var(--muted))]">Sign in to view your orders.</p>
      <div className="flex gap-2">
        <Link className="btn btn-primary" href="/login?next=/orders">Go to Login</Link>
        <Link className="btn btn-neutral" href="/register?next=/orders">Create Account</Link>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Order History</h1>
          <p className="text-[rgb(var(--muted))]">Track your purchases and monitor payment status in one place.</p>
        </div>
        {!loading && orders.length > 0 && (
          <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-4 py-3 text-sm shadow-sm">
            <div className="font-semibold text-[rgb(var(--text))]">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</div>
            <div className="text-[rgb(var(--muted))]">Last updated {new Date().toLocaleTimeString()}</div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="card animate-pulse space-y-2 p-5">
              <div className="h-4 w-32 rounded bg-[rgb(var(--border))]/80"></div>
              <div className="h-3 w-48 rounded bg-[rgb(var(--border))]/60"></div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 py-10 text-center">
          <div className="text-5xl">📦</div>
          <div>
            <h2 className="text-xl font-semibold">You haven’t placed any orders yet</h2>
            <p className="text-[rgb(var(--muted))]">When you make a purchase it will appear here with payment status and details.</p>
          </div>
          <Link className="btn btn-primary" href="/">Discover products</Link>
        </div>
      ) : (
        <div className="relative space-y-6 border-l border-dashed border-[rgb(var(--border))] pl-6 lg:pl-10">
          {orders.map((order, index) => {
            const paid = order.status === 'paid'
            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="group relative block rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6 shadow-sm transition hover:border-brand-500/40 hover:shadow-lg"
              >
                <span className="absolute -left-[32px] flex h-6 w-6 items-center justify-center rounded-full border-2 border-[rgb(var(--border))] bg-[rgb(var(--bg))] text-xs font-semibold text-[rgb(var(--muted))] group-hover:border-brand-500/50 group-hover:text-brand-500 lg:-left-[44px]">
                  {orders.length - index}
                </span>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[rgb(var(--muted))]">Order</p>
                    <p className="text-lg font-semibold">{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-sm text-[rgb(var(--muted))]">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span
                      className={`chip ${paid ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-200' : 'bg-amber-500/10 text-amber-600 dark:text-amber-300'}`}
                    >
                      {paid ? 'Paid' : 'Pending'}
                    </span>
                    <span className="chip bg-brand-500/10 text-brand-600 dark:text-brand-300">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                    <span className="text-xs text-[rgb(var(--muted))]">Tap to view details</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}


