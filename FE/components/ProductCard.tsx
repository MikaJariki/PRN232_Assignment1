'use client'
import Link from 'next/link'
import { Product } from '../lib/types'

type Props = {
  p: Product
  canManage?: boolean
  onAddToCart?: (product: Product) => void
  onDelete?: (id: string) => void
}

export default function ProductCard({ p, canManage, onAddToCart, onDelete }: Props){
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-gradient-to-b from-black/5 to-transparent p-3 shadow-glass hover:shadow-2xl transition">
      <div className="aspect-square w-full overflow-hidden rounded-xl border border-[rgb(var(--border))]">
        <img src={p.image || `https://picsum.photos/seed/${p.id}/800/800`} alt={p.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"/>
      </div>
      <div className="mt-3 flex items-start gap-2">
        <div className="flex-1">
          <Link href={`/products/${p.id}`} className="block font-semibold leading-tight hover:underline">{p.name}</Link>
          <p className="text-sm text-[rgb(var(--muted))] line-clamp-2">{p.description}</p>
        </div>
        <div className="shrink-0">
          <div className="chip">${p.price.toFixed(2)}</div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          className="btn btn-primary"
          onClick={() => onAddToCart?.(p)}
          disabled={!onAddToCart}
        >
          Add to Cart
        </button>
        <Link className="btn btn-neutral" href={`/products/${p.id}`}>View</Link>
        {canManage && (
          <>
            <Link className="btn btn-neutral" href={`/products/${p.id}/edit`}>Edit</Link>
            {onDelete && <button className="btn btn-danger" onClick={()=>onDelete(p.id)}>Delete</button>}
          </>
        )}
      </div>
    </div>
  )
}
