'use client'
export default function Pagination({ page, total, pageSize, onPage }:{ page:number; total:number; pageSize:number; onPage:(p:number)=>void }){
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (pages <= 1) return null
  const prev = () => onPage(Math.max(1, page-1))
  const next = () => onPage(Math.min(pages, page+1))
  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button className="btn btn-neutral" onClick={prev} disabled={page===1}>Prev</button>
      <span className="chip">Page {page} / {pages}</span>
      <button className="btn btn-neutral" onClick={next} disabled={page===pages}>Next</button>
    </div>
  )
}
