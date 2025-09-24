'use client'
import { useEffect, useState } from 'react'
import { Product } from '../lib/types'

export type ProductFormValues = { name:string; description:string; price:string; image?:string }

export default function ProductForm({ initial, onSubmit, submitting }:{ initial?: Product, onSubmit: (values: ProductFormValues)=>void, submitting?: boolean }){
  const [values, setValues] = useState<ProductFormValues>({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    price: initial ? String(initial.price) : '',
    image: initial?.image ?? ''
  })
  const [errors, setErrors] = useState<{[k:string]:string}>({})
  const [preview, setPreview] = useState<string>('')
  useEffect(()=>{ setPreview(values.image || '') }, [values.image])

  function validate(v: ProductFormValues){
    const e: {[k:string]:string} = {}
    if (!v.name.trim()) e.name = 'Name is required'
    if (!v.description.trim()) e.description = 'Description is required'
    if (!v.price.trim()) e.price = 'Price is required'
    const price = Number(v.price)
    if (!isFinite(price) || price < 0) e.price = 'Price must be a non-negative number'
    return e
  }
  function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    const map = validate(values)
    if (Object.keys(map).length) { setErrors(map); return }
    onSubmit(values)
  }
  function set<K extends keyof ProductFormValues>(k:K, val: ProductFormValues[K]){ setValues(prev => ({...prev, [k]:val})) }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
      <div className="card grid gap-3">
        <div>
          <div className="label">Name</div>
          <input className="input" value={values.name} onChange={e=>set('name', e.target.value)} placeholder="e.g. Classic Tee"/>
          {errors.name && <div className="text-xs text-red-600 dark:text-red-300 mt-1">{errors.name}</div>}
        </div>
        <div>
          <div className="label">Description</div>
          <textarea className="input min-h-28" value={values.description} onChange={e=>set('description', e.target.value)} placeholder="Short description..."/>
          {errors.description && <div className="text-xs text-red-600 dark:text-red-300 mt-1">{errors.description}</div>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="label">Price (USD)</div>
            <input className="input" value={values.price} onChange={e=>set('price', e.target.value)} placeholder="19.99"/>
            {errors.price && <div className="text-xs text-red-600 dark:text-red-300 mt-1">{errors.price}</div>}
          </div>
          <div>
            <div className="label">Image URL</div>
            <input className="input" value={values.image ?? ''} onChange={e=>set('image', e.target.value)} placeholder="https://picsum.photos/800"/>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
      <div className="card">
        <div className="label mb-2">Preview</div>
        <div className="overflow-hidden rounded-2xl border border-[rgb(var(--border))]">
          <img src={preview || 'https://picsum.photos/seed/form/800/800'} alt="preview" className="w-full h-80 object-cover"/>
        </div>
      </div>
    </form>
  )
}
