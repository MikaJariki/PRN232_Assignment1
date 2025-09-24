'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getProduct, deleteProduct } from '../../../lib/mockApi'
import { Product } from '../../../lib/types'
import Link from 'next/link'
import ConfirmDialog from '../../../components/ConfirmDialog'

export default function ProductDetailPage(){
  const params = useParams()
  const router = useRouter()
  const id = String(params?.id ?? '')
  const [p, setP] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState(false)

  useEffect(() => {
    let mounted = true
    getProduct(id).then(v => { if(mounted){ setP(v); setLoading(false) } })
    return () => { mounted = false }
  }, [id])

  async function onDelete(){
    if(!p) return
    await deleteProduct(p.id)
    router.push('/')
  }

  if (loading) return <p className="text-[rgb(var(--muted))]">Loading...</p>
  if (!p) return <p className="text-[rgb(var(--muted))]">Not found</p>

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="overflow-hidden rounded-2xl border border-[rgb(var(--border))]">
        <img src={p.image || `https://picsum.photos/seed/${p.id}/1000/1000`} alt={p.name} className="w-full h-[420px] object-cover"/>
      </div>
      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{p.name}</h1>
          <div className="flex gap-2">
            <span className="chip">Price: ${p.price.toFixed(2)}</span>
            <span className="chip">Updated: {new Date(p.updatedAt).toLocaleString()}</span>
          </div>
          <p className="text-[rgb(var(--muted))]">{p.description}</p>
        </div>
        <div className="flex gap-2">
          <Link className="btn btn-neutral" href={`/products/${p.id}/edit`}>Edit</Link>
          <button className="btn btn-danger" onClick={()=>setConfirm(true)}>Delete</button>
          <div className="flex-1"/>
          <Link className="btn btn-neutral" href="/">Back</Link>
        </div>
      </div>
      <ConfirmDialog open={confirm} title="Delete this product?" description="This action cannot be undone." onCancel={()=>setConfirm(false)} onConfirm={onDelete}/>
    </div>
  )
}
