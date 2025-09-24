'use client'
export function CardSkeleton(){
  return (
    <div className="animate-pulse">
      <div className="aspect-square w-full rounded-xl bg-black/10 dark:bg-white/10" />
      <div className="mt-3 h-4 w-2/3 rounded bg-black/10 dark:bg-white/10"/>
      <div className="mt-2 h-3 w-full rounded bg-black/10 dark:bg-white/10"/>
      <div className="mt-2 h-3 w-5/6 rounded bg-black/10 dark:bg-white/10"/>
      <div className="mt-4 h-9 w-full rounded-xl bg-black/10 dark:bg-white/10"/>
    </div>
  )
}
