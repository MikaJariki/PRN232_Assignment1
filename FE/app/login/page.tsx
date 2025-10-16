'use client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { useToast } from '../../components/ToastProvider'

function LoginForm(){
  const router = useRouter()
  const params = useSearchParams()
  const { user, login, initializing } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const next = params?.get('next') || '/'

  useEffect(() => {
    if (user) {
      router.replace(next)
    }
  }, [next, router, user])

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    setError(null)
    if (!form.email.trim() || !form.password) {
      const msg = 'Email and password are required'
      setError(msg)
      return
    }
    try {
      setSubmitting(true)
      await login(form.email.trim().toLowerCase(), form.password)
      toast.success('Welcome back!')
      router.replace(next)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="text-[rgb(var(--muted))]">Sign in to continue shopping.</p>
      </div>
      <form onSubmit={handleSubmit} className="card space-y-4">
        {error && (
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-200">
            {error}
          </div>
        )}
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="input"
            value={form.email}
            onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="input"
            value={form.password}
            onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
            placeholder="••••••••"
            required
          />
        </div>
        <button className="btn btn-primary w-full" type="submit" disabled={submitting || initializing}>
          {submitting ? 'Signing in...' : 'Login'}
        </button>
      </form>
      <p className="text-center text-sm text-[rgb(var(--muted))]">
        No account yet? <Link className="text-brand-600 hover:underline" href="/register">Create one</Link>
      </p>
    </div>
  )
}

export default function LoginPage(){
  return (
    <Suspense fallback={<div className="text-center text-[rgb(var(--muted))]">Loading...</div>}>
      <LoginForm/>
    </Suspense>
  )
}
