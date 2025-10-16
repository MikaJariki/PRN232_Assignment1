'use client'
import Link from 'next/link'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function PaymentCancelContent(){
  const params = useSearchParams()
  const orderId = params?.get('orderId') ?? ''
  const resumeUrl = orderId ? `/checkout?resume=${encodeURIComponent(orderId)}` : '/checkout'

  return (
    <div className="max-w-lg mx-auto card space-y-4">
      <h1 className="text-3xl font-bold">Payment Cancelled</h1>
      <p className="text-[rgb(var(--muted))]">
        Your payment was cancelled. Head back to checkout and choose how you would like to pay, or review your cart.
      </p>
      {orderId && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-200">
          Pending order ID: <span className="font-mono">{orderId.slice(0, 8).toUpperCase()}</span>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Link className="btn btn-primary" href={resumeUrl}>
          Return to checkout
        </Link>
        {orderId && (
          <Link className="btn btn-neutral" href={`/orders/${orderId}`}>
            View order
          </Link>
        )}
        <Link className="btn btn-neutral" href="/cart">
          Back to cart
        </Link>
      </div>
    </div>
  )
}

export default function PaymentCancelPage(){
  return (
    <Suspense fallback={<div className="text-center text-[rgb(var(--muted))]">Loading...</div>}>
      <PaymentCancelContent />
    </Suspense>
  )
}
