import type { ReactNode } from 'react'
export function Empty({ icon, title, children }: { icon: string; title: string; children?: ReactNode }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="text-5xl mb-3" aria-hidden>{icon}</div>
      <p className="font-bold">{title}</p>
      {children && <p className="muted text-sm mt-1">{children}</p>}
    </div>
  )
}
export function Spinner() {
  return <div className="py-16 text-center muted text-sm" role="status">Chargement…</div>
}
