'use client'
import ProductForm, { ProductFormValues } from '../../../components/ProductForm'
import { createProduct } from '../../../lib/api'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewProductPage(){
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(values: ProductFormValues){
    setSubmitting(true)
    await createProduct({
      name: values.name.trim(),
      description: values.description.trim(),
      price: Number(values.price),
      image: values.image?.trim() || undefined,
      createdAt: '',
      updatedAt: ''
    } as any)
    setSubmitting(false)
    router.push('/')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Create Product</h1>
      <ProductForm onSubmit={handleSubmit} submitting={submitting}/>
    </div>
  )
}
