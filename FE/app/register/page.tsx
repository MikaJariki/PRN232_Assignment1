'use client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { useToast } from '../../components/ToastProvider'

export default function RegisterPage(){
  const router = useRouter()
  const params = useSearchParams()
  const { user, register, initializing } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ email: '', password: '', confirm: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
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
    if (form.password !== form.confirm) {
      const msg = 'Passwords do not match'
      setError(msg)
      return
    }
    try {
      setSubmitting(true)
      await register(form.email.trim().toLowerCase(), form.password)
      toast.success('Account created!')
      router.replace(next)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Join Uma Store</h1>
        <p className="text-[rgb(var(--muted))]">Create an account to manage your orders.</p>
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
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="input pr-12"
              value={form.password}
              onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
              placeholder="••••••••"
              required
              minLength={6}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-2 flex items-center px-2 text-[rgb(var(--muted))] hover:text-[rgb(var(--text))]"
              onClick={() => setShowPassword(prev => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M9.88 9.88a3 3 0 104.24 4.24M6.11 6.11C3.67 7.83 2 10 2 10s3.64 6 10 6c1.37 0 2.65-.26 3.81-.74M12 6c2.21 0 4.21.9 5.89 2.11.68.49 1.29 1 1.82 1.53M16.88 16.88C20.33 15.17 22 13 22 13s-3.64-6-10-6" />
                </svg>
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.64-6 10-6 10 6 10 6-3.64 6-10 6-10-6-10-6z" />
                  <circle cx="12" cy="12" r="3.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="confirm">Confirm Password</label>
          <div className="relative">
            <input
              id="confirm"
              type={showConfirm ? 'text' : 'password'}
              className="input pr-12"
              value={form.confirm}
              onChange={e => setForm(prev => ({ ...prev, confirm: e.target.value }))}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-2 flex items-center px-2 text-[rgb(var(--muted))] hover:text-[rgb(var(--text))]"
              onClick={() => setShowConfirm(prev => !prev)}
              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirm ? (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M9.88 9.88a3 3 0 104.24 4.24M6.11 6.11C3.67 7.83 2 10 2 10s3.64 6 10 6c1.37 0 2.65-.26 3.81-.74M12 6c2.21 0 4.21.9 5.89 2.11.68.49 1.29 1 1.82 1.53M16.88 16.88C20.33 15.17 22 13 22 13s-3.64-6-10-6" />
                </svg>
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.64-6 10-6 10 6 10 6-3.64 6-10 6-10-6-10-6z" />
                  <circle cx="12" cy="12" r="3.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
        <button className="btn btn-primary w-full" type="submit" disabled={submitting || initializing}>
          {submitting ? 'Signing up...' : 'Register'}
        </button>
      </form>
      <p className="text-center text-sm text-[rgb(var(--muted))]">
        Already have an account? <Link className="text-brand-600 hover:underline" href="/login">Sign in</Link>
      </p>
    </div>
  )
}

