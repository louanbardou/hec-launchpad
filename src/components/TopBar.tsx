import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'

export function TopBar({ title, back, right }: { title: string; back?: boolean; right?: ReactNode }) {
  const nav = useNavigate()
  return (
    <header className="safe-top sticky top-0 z-20 backdrop-blur" style={{ background: 'color-mix(in srgb, var(--bg) 85%, transparent)', borderBottom: '1px solid var(--border)' }}>
      <div className="mx-auto max-w-xl px-4 h-14 flex items-center gap-2">
        {back && (
          <button type="button" onClick={() => (window.history.length > 1 ? nav(-1) : nav('/'))} className="-ml-2 w-11 h-11 flex items-center justify-center rounded-full text-xl" aria-label="Retour">
            ←
          </button>
        )}
        <h1 className="text-lg font-bold flex-1 truncate">{title}</h1>
        {right}
      </div>
    </header>
  )
}
