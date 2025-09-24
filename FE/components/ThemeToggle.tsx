'use client'
import { useEffect, useState } from 'react'

export default function ThemeToggle(){
  const [dark, setDark] = useState<boolean>(true)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme')
      const isDark = saved ? saved === 'dark' : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
      setDark(isDark)
      document.documentElement.classList.toggle('dark', isDark)
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('theme', dark ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark', dark)
    } catch {}
  }, [dark])

  return (
    <button className="btn btn-neutral" onClick={()=>setDark(!dark)} aria-label="Toggle theme">
      {dark ? 'Dark' : 'Light'} mode
    </button>
  )
}
