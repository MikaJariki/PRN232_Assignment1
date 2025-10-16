'use client'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import ProductForm, { ProductFormValues } from '../../../../components/ProductForm'
import { getProduct, updateProduct } from '../../../../lib/api'
import { useToast } from '../../../../components/ToastProvider'
import { Product } from '../../../../lib/types'
import { useAuth } from '../../../../components/AuthProvider'

export default function EditProductPage(){
  const router = useRouter()
  const params = useParams()
  const id = String(params?.id ?? '')
  const [initial, setInitial] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const toast = useToast()
  const { user, initializing } = useAuth()

  useEffect(() => {
    let mounted = true
    getProduct(id).then(v => { if(mounted){ setInitial(v); setLoading(false) }})
    return () => { mounted = false }
  }, [id])

  async function handleSubmit(values: ProductFormValues){
    if (!initial || !user) return
    try {
      setSubmitting(true)
      await updateProduct(initial.id, {
        name: values.name.trim(),
        description: values.description.trim(),
        price: Number(values.price),
        image: values.image?.trim() || undefined
      })
      toast.success('Product updated')
      router.push('/products/'+initial.id)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update product')
    } finally {
      setSubmitting(false)
    }
  }

  if (initializing || loading) return <p className="text-[rgb(var(--muted))]">Loading...</p>
  if (!initial) return <p className="text-[rgb(var(--muted))]">Not found</p>
  if (!user) return (
    <div className="card space-y-3">
      <h2 className="text-xl font-semibold">Login required</h2>
      <p className="text-[rgb(var(--muted))]">Please sign in to edit this product.</p>
      <Link className="btn btn-primary w-full sm:w-auto" href={`/login?next=/products/${initial.id}/edit`}>Go to Login</Link>
    </div>
  )

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Edit Product</h1>
      <ProductForm initial={initial} onSubmit={handleSubmit} submitting={submitting}/>
    </div>
  )
}
