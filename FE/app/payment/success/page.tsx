'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function PaymentSuccessPage(){
  const params = useSearchParams()
  const orderId = params?.get('orderId')

  return (
    <div className="relative mx-auto max-w-lg overflow-hidden rounded-3xl border border-[rgb(var(--border))] bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent p-8 text-center shadow-xl backdrop-blur lg:p-10">
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-emerald-500/15 via-transparent to-transparent blur-3xl" aria-hidden="true"></div>
      <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-200">
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Payment Successful</h1>
        <p className="text-[rgb(var(--muted))]">
          Thank you for your purchase. Your payment has been confirmed and we’ve started preparing your order.
        </p>
      </div>
      <div className="mx-auto mt-4 grid gap-4 text-sm text-left text-[rgb(var(--muted))] sm:max-w-md">
        {orderId && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-500/40 bg-white/70 px-4 py-3 dark:bg-white/5">
            <span className="font-medium text-[rgb(var(--text))]">Order number</span>
            <span className="font-mono text-sm text-[rgb(var(--muted))] break-all">{orderId?.slice(0, 8)?.toUpperCase()}</span>
          </div>
        )}
      </div>
      <div className="relative mt-6 flex flex-wrap justify-center gap-3">
        {orderId && <Link className="btn btn-primary" href={`/orders/${orderId}`}>View order</Link>}
        <Link className="btn btn-neutral" href="/orders">Order history</Link>
        <Link className="btn btn-neutral" href="/">Continue shopping</Link>
      </div>
    </div>
  )
}


