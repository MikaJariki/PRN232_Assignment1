import { Product, Paged } from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5057'

function qs(params: Record<string, any>) {
  const sp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    sp.set(k, String(v))
  })
  const s = sp.toString()
  return s ? `?${s}` : ''
}

export async function listProducts(params?:{search?:string; minPrice?:number; maxPrice?:number; page?:number; pageSize?:number}): Promise<Paged<Product>> {
  const url = `${API_BASE}/api/products${qs(params||{})}`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to list products (${res.status})`)
  return res.json()
}

export async function getProduct(id:string): Promise<Product|null> {
  const res = await fetch(`${API_BASE}/api/products/${id}`, { cache: 'no-store' })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Failed to get product (${res.status})`)
  return res.json()
}

export async function createProduct(input: Omit<Product,'id'|'createdAt'|'updatedAt'>): Promise<Product> {
  const res = await fetch(`${API_BASE}/api/products`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) })
  if (!res.ok) throw new Error(`Failed to create product (${res.status})`)
  return res.json()
}

export async function updateProduct(id:string, patch: Partial<Omit<Product,'id'|'createdAt'|'updatedAt'>>): Promise<Product> {
  const res = await fetch(`${API_BASE}/api/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) })
  if (!res.ok) throw new Error(`Failed to update product (${res.status})`)
  return res.json()
}

export async function deleteProduct(id:string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/products/${id}`, { method: 'DELETE' })
  if (!res.ok && res.status !== 404) throw new Error(`Failed to delete product (${res.status})`)
}

// Development-only: ask the API to reset & reseed the DB
export async function resetMock(): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/dev/reset`, { method: 'POST' })
  } catch {/* ignore */}
}

