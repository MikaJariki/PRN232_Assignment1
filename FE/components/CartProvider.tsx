'use client'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { addCartItem, checkoutCart, clearCart, fetchCart, removeCartItem, startStripeCheckout, updateCartItem, HttpError } from '../lib/api'
import { CartItem, CartResponse, OrderDetails } from '../lib/types'
import { useAuth } from './AuthProvider'
import { useToast } from './ToastProvider'

type CartContextValue = {
  items: CartItem[]
  total: number
  count: number
  loading: boolean
  refresh: () => Promise<void>
  add: (productId: string, quantity?: number) => Promise<void>
  update: (id: string, quantity: number) => Promise<void>
  remove: (id: string) => Promise<void>
  clear: () => Promise<void>
  checkout: (markAsPaid?: boolean) => Promise<OrderDetails>
  checkoutWithStripe: () => Promise<{ orderId: string; checkoutUrl: string; sessionId: string }>
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token, user, initializing, logout } = useAuth()
  const toast = useToast()

  const [items, setItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  function apply(response: CartResponse) {
    setItems(response.items)
    setTotal(response.total)
  }

  const handleError = React.useCallback((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    toast.error(message)
  }, [toast])

  const refresh = React.useCallback(async () => {
    if (!token) {
      setItems([])
      setTotal(0)
      return
    }
    setLoading(true)
    try {
      const data = await fetchCart()
      apply(data)
    } catch (err) {
      if (err instanceof HttpError && err.status === 401) {
        toast.error('Session expired. Please login again.')
        logout()
      } else {
        handleError(err)
      }
    } finally {
      setLoading(false)
    }
  }, [handleError, logout, toast, token])

  const ensureAuth = React.useCallback(() => {
    if (!token) {
      toast.error('Please login to manage your cart.')
      return false
    }
    return true
  }, [toast, token])

  const add = React.useCallback(async (productId: string, quantity = 1) => {
    if (!ensureAuth()) throw new Error('Authentication required')
    try {
      const data = await addCartItem(productId, quantity)
      apply(data)
      toast.success('Added to cart')
    } catch (err) {
      handleError(err)
      throw err
    }
  }, [ensureAuth, handleError, toast])

  const update = React.useCallback(async (id: string, quantity: number) => {
    if (!ensureAuth()) throw new Error('Authentication required')
    try {
      const data = await updateCartItem(id, quantity)
      apply(data)
    } catch (err) {
      handleError(err)
      throw err
    }
  }, [ensureAuth, handleError])

  const remove = React.useCallback(async (id: string) => {
    if (!ensureAuth()) throw new Error('Authentication required')
    try {
      const data = await removeCartItem(id)
      apply(data)
      toast.info('Item removed')
    } catch (err) {
      handleError(err)
      throw err
    }
  }, [ensureAuth, handleError, toast])

  const clear = React.useCallback(async () => {
    if (!ensureAuth()) throw new Error('Authentication required')
    try {
      const data = await clearCart()
      apply(data)
      toast.info('Cart cleared')
    } catch (err) {
      handleError(err)
      throw err
    }
  }, [ensureAuth, handleError, toast])

  const checkout = React.useCallback(async (markAsPaid = true) => {
    if (!ensureAuth()) throw new Error('Authentication required')
    try {
      const order = await checkoutCart(markAsPaid)
      setItems([])
      setTotal(0)
      toast.success('Order placed successfully')
      return order
    } catch (err) {
      handleError(err)
      throw err
    }
  }, [ensureAuth, handleError, toast])

  const checkoutWithStripe = React.useCallback(async () => {
    if (!ensureAuth()) throw new Error('Authentication required')
    try {
      const result = await startStripeCheckout()
      return result
    } catch (err) {
      handleError(err)
      throw err
    }
  }, [ensureAuth, handleError, toast])

  useEffect(() => {
    if (initializing) return
    if (user) {
      refresh()
    } else {
      setItems([])
      setTotal(0)
    }
  }, [initializing, refresh, user])

  const value = useMemo<CartContextValue>(() => ({
    items,
    total,
    count: items.reduce((acc, item) => acc + item.quantity, 0),
    loading,
    refresh,
    add,
    update,
    remove,
    clear,
    checkout,
    checkoutWithStripe
  }), [add, checkout, checkoutWithStripe, clear, items, loading, refresh, remove, total, update])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
