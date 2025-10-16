'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import ProductForm, { ProductFormValues } from '../../../components/ProductForm'
import { createProduct } from '../../../lib/api'
import { useToast } from '../../../components/ToastProvider'
import { useAuth } from '../../../components/AuthProvider'

export default function NewProductPage(){
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const toast = useToast()
  const { user, initializing } = useAuth()

  async function handleSubmit(values: ProductFormValues){
    if (!user) {
      toast.error('Please login to create products')
      router.push('/login')
      return
    }
    try {
      setSubmitting(true)
      await createProduct({
        name: values.name.trim(),
        description: values.description.trim(),
        price: Number(values.price),
        image: values.image?.trim() || undefined
      })
      toast.success('Product created')
      router.push('/')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create product')
    } finally {
      setSubmitting(false)
    }
  }

  if (initializing) return <p className="text-[rgb(var(--muted))]">Loading...</p>
  if (!user) return (
    <div className="card space-y-3">
      <h2 className="text-xl font-semibold">Login required</h2>
      <p className="text-[rgb(var(--muted))]">You need to be signed in to create products.</p>
      <Link className="btn btn-primary w-full sm:w-auto" href="/login?next=/products/new">Go to Login</Link>
    </div>
  )

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Create Product</h1>
      <ProductForm onSubmit={handleSubmit} submitting={submitting}/>
    </div>
  )
}
