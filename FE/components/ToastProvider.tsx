"use client"
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

type Toast = { id: string; message: string; type?: 'success'|'error'|'info' }

type ToastContextValue = {
  push: (message: string, type?: Toast['type']) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

function uid(){ return Math.random().toString(36).slice(2)+Date.now().toString(36) }

export function ToastProvider({ children }: { children: React.ReactNode }){
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id:string)=> setToasts(prev => prev.filter(t => t.id !== id)), [])

  const push = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = uid()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => remove(id), 2200)
  }, [remove])

  const api = useMemo<ToastContextValue>(() => ({
    push,
    success: (m) => push(m, 'success'),
    error: (m) => push(m, 'error'),
    info: (m) => push(m, 'info')
  }), [push])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {toasts.map(t => (
          <div key={t.id} className={`pointer-events-auto select-none rounded-xl shadow-soft border px-4 py-3 text-sm bg-[rgb(var(--card))] ${
              t.type==='success' ? 'border-emerald-500/30 text-emerald-700 dark:text-emerald-200' :
              t.type==='error' ? 'border-rose-500/30 text-rose-700 dark:text-rose-200' :
              'border-[rgb(var(--border))] text-[rgb(var(--text))]'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(){
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

