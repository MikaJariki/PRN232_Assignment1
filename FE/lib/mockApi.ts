'use client'
import { Product, Paged } from './types'
const STORAGE_KEY = 'mock_products_v3'
const seed: Omit<Product,'id'|'createdAt'|'updatedAt'>[] = [
  { name:'Classic White Tee', description:'100% cotton, comfy everyday wear.', price:12.99, image:'https://picsum.photos/id/100/800/800' },
  { name:'Denim Jacket', description:'Light wash, unisex fit.', price:49.50, image:'https://picsum.photos/id/1011/800/800' },
  { name:'Black Hoodie', description:'Fleece-lined with kangaroo pocket.', price:35.00, image:'https://picsum.photos/id/1012/800/800' },
  { name:'Running Shorts', description:'Breathable, quick-dry fabric.', price:19.99, image:'https://picsum.photos/id/1019/800/800' },
  { name:'Summer Dress', description:'Floral print A-line.', price:29.90, image:'https://picsum.photos/id/1027/800/800' },
  { name:'Leather Belt', description:'Genuine leather, adjustable.', price:15.00, image:'https://picsum.photos/id/1062/800/800' },
  { name:'Sport Sneakers', description:'Lightweight, everyday sneakers.', price:59.00, image:'https://picsum.photos/id/1084/800/800' },
  { name:'Beanie', description:'Warm knit beanie.', price:9.90, image:'https://picsum.photos/id/839/800/800' }
]
const now = () => new Date().toISOString()
const uid = () => Math.random().toString(36).slice(2)+Date.now().toString(36)
function read(): Product[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const seeded = seed.map(s => ({ id: uid(), ...s, createdAt: now(), updatedAt: now() }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
    return seeded
  }
  try { return JSON.parse(raw) as Product[] } catch { return [] }
}
function write(list: Product[]){ if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) }
export function resetMock(){ if (typeof window !== 'undefined'){ localStorage.removeItem(STORAGE_KEY); read() } }
export async function listProducts(params?:{search?:string; minPrice?:number; maxPrice?:number; page?:number; pageSize?:number}): Promise<Paged<Product>> {
  let items = read()
  const { search, minPrice, maxPrice } = params || {}
  if (search){ const q = search.toLowerCase(); items = items.filter(p => (p.name + ' ' + p.description).toLowerCase().includes(q)) }
  if (minPrice != null) items = items.filter(p => p.price >= minPrice)
  if (maxPrice != null) items = items.filter(p => p.price <= maxPrice)
  const pageSize = Math.max(1, params?.pageSize ?? 9)
  const page = Math.max(1, params?.page ?? 1)
  const total = items.length
  const start = (page-1)*pageSize
  const paged = items.slice(start, start+pageSize)
  await new Promise(r => setTimeout(r, 180))
  return { items: paged, total, page, pageSize }
}
export async function getProduct(id:string): Promise<Product|null> { const items = read(); await new Promise(r => setTimeout(r, 120)); return items.find(p=>p.id===id) ?? null }
export async function createProduct(input: Omit<Product,'id'|'createdAt'|'updatedAt'>): Promise<Product> { const items = read(); const doc:Product = { id:uid(), ...input, createdAt: now(), updatedAt: now() }; items.unshift(doc); write(items); await new Promise(r => setTimeout(r, 160)); return doc }
export async function updateProduct(id:string, patch: Partial<Omit<Product,'id'|'createdAt'|'updatedAt'>>): Promise<Product> { const items=read(); const i=items.findIndex(p=>p.id===id); if(i===-1) throw new Error('Not found'); const updated={...items[i], ...patch, updatedAt: now()}; items[i]=updated; write(items); await new Promise(r=>setTimeout(r,150)); return updated }
export async function deleteProduct(id:string): Promise<void> { const items = read().filter(p=>p.id!==id); write(items); await new Promise(r=>setTimeout(r,140)) }
