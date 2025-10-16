'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { listProducts, deleteProduct } from '../lib/api'
import { Product } from '../lib/types'
import ProductCard from '../components/ProductCard'
import Pagination from '../components/Pagination'
import ConfirmDialog from '../components/ConfirmDialog'
import { CardSkeleton } from '../components/Skeleton'
import { useToast } from '../components/ToastProvider'
import { useAuth } from '../components/AuthProvider'
import { useCart } from '../components/CartProvider'

const initialFilters = { search: '', minPrice: '', maxPrice: '' }

export default function HomePage(){
  const toast = useToast()
  const { user } = useAuth()
  const cart = useCart()

  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(9)
  const [total, setTotal] = useState(0)
  const [inputs, setInputs] = useState(initialFilters)
  const [filters, setFilters] = useState(initialFilters)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  async function load(nextPage = page, activeFilters = filters){
    setLoading(true)
    try {
      const res = await listProducts({
        search: activeFilters.search || undefined,
        minPrice: activeFilters.minPrice ? Number(activeFilters.minPrice) : undefined,
        maxPrice: activeFilters.maxPrice ? Number(activeFilters.maxPrice) : undefined,
        page: nextPage,
        pageSize,
      })
      setItems(res.items)
      setTotal(res.total)
      setPage(res.page)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(1, filters) /* eslint-disable-line react-hooks/exhaustive-deps */ }, [])

  const statText = useMemo(() => {
    const { search, minPrice, maxPrice } = filters
    const maxP = maxPrice ? ` ≤ ${maxPrice}` : ''
    const minP = minPrice ? `${minPrice} ≤ ` : ''
    if (!search && !minPrice && !maxPrice) return `${total} items`
    return `Found ${total} items ${search ? `for "${search}"` : ''} ${minP || maxP ? `with price ${minP}price${maxP}`: ''}`
  }, [total, filters])

  async function handleDelete(id: string){
    try {
      await deleteProduct(id)
      toast.success('Product deleted')
      setConfirmId(null)
      load(page, filters)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete product')
    }
  }

  async function handleAdd(product: Product){
    try {
      await cart.add(product.id)
    } catch {
      // errors surfaced through cart provider toast
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl p-6 md:p-8 glass shadow-glass">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-extrabold">Beautiful Products</h1>
            <p className="text-[rgb(var(--muted))]">Search, filter and manage products.</p>
          </div>
          <div className="flex gap-2">
            {user && <Link href="/products/new" className="btn btn-primary">+ Add Product</Link>}
            {!user && <Link href="/login" className="btn btn-neutral">Login to manage</Link>}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-12">
          <input
            className="input md:col-span-6"
            placeholder="Search name or description..."
            value={inputs.search}
            onChange={e => setInputs(prev => ({ ...prev, search: e.target.value }))}
          />
          <input
            className="input md:col-span-2"
            placeholder="Min price"
            value={inputs.minPrice}
            onChange={e => setInputs(prev => ({ ...prev, minPrice: e.target.value }))}
          />
          <input
            className="input md:col-span-2"
            placeholder="Max price"
            value={inputs.maxPrice}
            onChange={e => setInputs(prev => ({ ...prev, maxPrice: e.target.value }))}
          />
          <div className="md:col-span-2 flex gap-2">
            <button
              className="btn btn-neutral w-full"
              onClick={() => {
                const next = { ...inputs }
                setFilters(next)
                load(1, next)
              }}
            >
              Apply
            </button>
            <button
              className="btn btn-neutral w-full"
              onClick={() => {
                setInputs(initialFilters)
                setFilters(initialFilters)
                load(1, initialFilters)
              }}
            >
              Clear
            </button>
          </div>
        </div>
        <div className="mt-3 text-sm text-[rgb(var(--muted))]">{statText}</div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({length: pageSize}).map((_,i) => <CardSkeleton key={i}/>)}
        </div>
      ) : items.length === 0 ? (
        <div className="card"><p className="text-[rgb(var(--muted))]">No products found. Try adjusting your filters or create a new one.</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map(p => (
            <ProductCard
              key={p.id}
              p={p}
              canManage={!!user}
              onAddToCart={handleAdd}
              onDelete={user ? () => setConfirmId(p.id) : undefined}
            />
          ))}
        </div>
      )}

      <Pagination page={page} total={total} pageSize={pageSize} onPage={(p)=>{ load(p, filters) }}/>

      <ConfirmDialog
        open={!!confirmId}
        title="Delete this product?"
        description="This action cannot be undone."
        onCancel={()=>setConfirmId(null)}
        onConfirm={() => { if (confirmId) handleDelete(confirmId) }}
      />
    </div>
  )
}
