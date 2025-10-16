'use client'
import Link from 'next/link'

export default function PaymentCancelPage(){
  return (
    <div className="max-w-lg mx-auto card space-y-4">
      <h1 className="text-3xl font-bold">Payment Cancelled</h1>
      <p className="text-[rgb(var(--muted))]">Your payment was cancelled. You can retry the checkout or return to the cart to review items.</p>
      <div className="flex gap-2">
        <Link className="btn btn-primary" href="/checkout">Retry checkout</Link>
        <Link className="btn btn-neutral" href="/cart">Back to cart</Link>
      </div>
    </div>
  )
}
