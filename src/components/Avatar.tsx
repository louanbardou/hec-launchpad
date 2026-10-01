import { initials } from '../lib/format'

export function Avatar({ name, src, size = 36 }: { name: string; src?: string | null; size?: number }) {
  const style = { width: size, height: size, fontSize: size * 0.38 }
  if (src) return <img src={src} alt="" className="rounded-full object-cover shrink-0" style={style} />
  return (
    <div className="rounded-full shrink-0 flex items-center justify-center font-bold bg-navy text-gold-soft" style={style} aria-hidden>
      {initials(name)}
    </div>
  )
}
