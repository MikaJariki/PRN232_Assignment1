'use client'
import ProductForm, { ProductFormValues } from '../../../../components/ProductForm'
import { getProduct, updateProduct } from '../../../../lib/api'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Product } from '../../../../lib/types'

export default function EditProductPage(){
  const router = useRouter()
  const params = useParams()
  const id = String(params?.id ?? '')
  const [initial, setInitial] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let mounted = true
    getProduct(id).then(v => { if(mounted){ setInitial(v); setLoading(false) }})
    return () => { mounted = false }
  }, [id])

  async function handleSubmit(values: ProductFormValues){
    if (!initial) return
    setSubmitting(true)
    await updateProduct(initial.id, {
      name: values.name.trim(),
      description: values.description.trim(),
      price: Number(values.price),
      image: values.image?.trim() || undefined
    })
    setSubmitting(false)
    router.push('/products/'+initial.id)
  }

  if (loading) return <p className="text-[rgb(var(--muted))]">Loading...</p>
  if (!initial) return <p className="text-[rgb(var(--muted))]">Not found</p>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Edit Product</h1>
      <ProductForm initial={initial} onSubmit={handleSubmit} submitting={submitting}/>
    </div>
  )
}
