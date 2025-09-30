'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { listProducts, deleteProduct } from '../lib/api'
import { Product } from '../lib/types'
import ProductCard from '../components/ProductCard'
import Pagination from '../components/Pagination'
import ConfirmDialog from '../components/ConfirmDialog'
import { CardSkeleton } from '../components/Skeleton'

export default function HomePage(){
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(9)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const [confirmId, setConfirmId] = useState<string | null>(null)

  async function load(pageNum = page){
    setLoading(true)
    const res = await listProducts({
      search,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      page: pageNum,
      pageSize,
    })
    setItems(res.items)
    setTotal(res.total)
    setPage(res.page)
    setLoading(false)
  }

  useEffect(() => { load(1) }, [])

  const statText = useMemo(() => {
    const maxP = maxPrice ? ` ≤ ${maxPrice}` : ''
    const minP = minPrice ? `${minPrice} ≤ ` : ''
    if (!search && !minPrice && !maxPrice) return `${total} items`
    return `Found ${total} items ${search ? `for "${search}"` : ''} ${minP || maxP ? `with price ${minP}price${maxP}`: ''}`
  }, [total, search, minPrice, maxPrice])

  return (
    <div className="space-y-6">
      <div className="rounded-3xl p-6 md:p-8 glass shadow-glass">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-extrabold">Beautiful Products</h1>
            <p className="text-[rgb(var(--muted))]">Search, filter and manage products.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/products/new" className="btn btn-primary">+ Add Product</Link>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-12">
          <input className="input md:col-span-6" placeholder="Search name or description..." value={search} onChange={e=>setSearch(e.target.value)}/>
          <input className="input md:col-span-2" placeholder="Min price" value={minPrice} onChange={e=>setMinPrice(e.target.value)}/>
          <input className="input md:col-span-2" placeholder="Max price" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)}/>
          <div className="md:col-span-2 flex gap-2">
            <button className="btn btn-neutral w-full" onClick={()=>load(1)}>Apply</button>
            <button className="btn btn-neutral w-full" onClick={()=>{ setSearch(''); setMinPrice(''); setMaxPrice(''); load(1) }}>Clear</button>
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
          {items.map(p => (<ProductCard key={p.id} p={p} onDelete={(id)=>setConfirmId(id)} />))}
        </div>
      )}

      <Pagination page={page} total={total} pageSize={pageSize} onPage={(p)=>{ setPage(p); load(p) }}/>

      <ConfirmDialog
        open={!!confirmId}
        title="Delete this product?"
        description="This action cannot be undone."
        onCancel={()=>setConfirmId(null)}
        onConfirm={async ()=>{ if(confirmId){ await deleteProduct(confirmId); setConfirmId(null); load() } }}
      />
    </div>
  )
}
