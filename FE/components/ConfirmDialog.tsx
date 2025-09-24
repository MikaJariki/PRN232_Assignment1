'use client'
export default function ConfirmDialog({ open, title, description, onConfirm, onCancel }:{ open:boolean; title:string; description?:string; onConfirm:()=>void; onCancel:()=>void }){
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))]/95 p-5 backdrop-blur">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && <p className="mt-1 text-sm text-[rgb(var(--muted))]">{description}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn btn-neutral" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  )
}
