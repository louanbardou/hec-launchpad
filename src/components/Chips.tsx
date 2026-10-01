export function Chips({ items }: { items: string[] }) {
  if (!items.length) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t) => <span key={t} className="chip">{t}</span>)}
    </div>
  )
}

export function ChipSelect({ options, value, onChange, max }: { options: readonly string[]; value: string[]; onChange: (v: string[]) => void; max?: number }) {
  const toggle = (o: string) => {
    if (value.includes(o)) onChange(value.filter((v) => v !== o))
    else if (!max || value.length < max) onChange([...value, o])
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o} type="button" onClick={() => toggle(o)} className={`chip min-h-[40px] px-3.5 ${value.includes(o) ? 'chip-on' : ''}`} aria-pressed={value.includes(o)}>
          {o}
        </button>
      ))}
    </div>
  )
}
