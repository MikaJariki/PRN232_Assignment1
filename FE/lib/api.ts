import { AuthResponse, CartResponse, OrderDetails, OrderSummary, Paged, Product, UserSummary } from './types'

export class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5057'

let bearerToken: string | null = null

export function setAuthToken(token: string | null) {
  bearerToken = token
}

function qs(params: Record<string, unknown>) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    search.set(key, String(value))
  })
  const query = search.toString()
  return query ? `?${query}` : ''
}

type SendOptions = {
  token?: string | null
  auth?: boolean
}

async function send<T>(path: string, init?: RequestInit, opts?: SendOptions): Promise<T> {
  const url = `${API_BASE}${path}`
  const headers = new Headers(init?.headers as HeadersInit | undefined)

  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const token = opts?.token ?? bearerToken
  if (opts?.auth) {
    if (!token) throw new Error('Authentication required')
    headers.set('Authorization', `Bearer ${token}`)
  } else if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(url, { cache: 'no-store', ...init, headers })
  const text = await response.text()
  if (!response.ok) {
    let message = text
    try {
      const payload = text ? JSON.parse(text) : null
      message = payload?.title || payload?.message || payload?.error || message
    } catch {
      // ignore json parse errors
    }
    throw new HttpError(response.status, message || `Request failed (${response.status})`)
  }

  if (!text) return undefined as T
  return JSON.parse(text) as T
}

export async function registerUser(input: { email: string; password: string }): Promise<AuthResponse> {
  return send<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(input)
  })
}

export async function loginUser(input: { email: string; password: string }): Promise<AuthResponse> {
  return send<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(input)
  })
}

export async function getCurrentUser(token?: string | null): Promise<UserSummary> {
  return send<UserSummary>('/api/auth/me', undefined, { auth: true, token })
}

export async function listProducts(params?: {
  search?: string
  minPrice?: number
  maxPrice?: number
  page?: number
  pageSize?: number
}): Promise<Paged<Product>> {
  return send<Paged<Product>>(`/api/products${qs(params || {})}`)
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    return await send<Product>(`/api/products/${id}`)
  } catch (err) {
    if (err instanceof HttpError && err.status === 404) return null
    throw err
  }
}

export async function createProduct(input: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  return send<Product>('/api/products', {
    method: 'POST',
    body: JSON.stringify(input)
  }, { auth: true })
}

export async function updateProduct(id: string, patch: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Product> {
  return send<Product>(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(patch)
  }, { auth: true })
}

export async function deleteProduct(id: string): Promise<void> {
  await send<void>(`/api/products/${id}`, { method: 'DELETE' }, { auth: true })
}

export async function fetchCart(): Promise<CartResponse> {
  return send<CartResponse>('/api/cart', undefined, { auth: true })
}

export async function addCartItem(productId: string, quantity = 1): Promise<CartResponse> {
  return send<CartResponse>('/api/cart', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity })
  }, { auth: true })
}

export async function updateCartItem(id: string, quantity: number): Promise<CartResponse> {
  return send<CartResponse>(`/api/cart/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity })
  }, { auth: true })
}

export async function removeCartItem(id: string): Promise<CartResponse> {
  return send<CartResponse>(`/api/cart/${id}`, { method: 'DELETE' }, { auth: true })
}

export async function clearCart(): Promise<CartResponse> {
  return send<CartResponse>('/api/cart', { method: 'DELETE' }, { auth: true })
}

export async function checkoutCart(markAsPaid = true): Promise<OrderDetails> {
  return send<OrderDetails>('/api/orders', {
    method: 'POST',
    body: JSON.stringify({ markAsPaid })
  }, { auth: true })
}

export async function startStripeCheckout(): Promise<{ orderId: string; checkoutUrl: string; sessionId: string }> {
  return send<{ orderId: string; checkoutUrl: string; sessionId: string }>('/api/payments/stripe/checkout', {
    method: 'POST'
  }, { auth: true })
}

export async function listOrders(): Promise<OrderSummary[]> {
  return send<OrderSummary[]>('/api/orders', undefined, { auth: true })
}

export async function getOrder(id: string): Promise<OrderDetails> {
  return send<OrderDetails>(`/api/orders/${id}`, undefined, { auth: true })
}

export async function markOrderPaid(id: string): Promise<OrderDetails> {
  return send<OrderDetails>(`/api/orders/${id}/pay`, { method: 'POST' }, { auth: true })
}

export async function resetMock(): Promise<void> {
  try {
    await send<void>('/api/dev/reset', { method: 'POST' })
  } catch {
    // ignore errors in dev helper
  }
}
