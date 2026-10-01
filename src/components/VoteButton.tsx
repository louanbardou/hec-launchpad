export function VoteButton({ count, active, onClick, large }: { count: number; active: boolean; onClick: () => void; large?: boolean }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick() }}
      aria-pressed={active}
      aria-label={active ? 'Retirer mon vote' : 'Voter pour cette idée'}
      className={`shrink-0 flex flex-col items-center justify-center rounded-xl font-bold transition-transform active:scale-90 ${large ? 'w-16 h-20 text-2xl' : 'w-12 h-16 text-base'}`}
      style={{
        background: active ? 'var(--vote)' : 'color-mix(in srgb, var(--accent) 8%, transparent)',
        color: active ? '#0B1F4B' : 'var(--text)',
        border: active ? 'none' : '1px solid var(--border)',
      }}
    >
      <span className={large ? 'text-2xl' : 'text-lg'} aria-hidden>▲</span>
      <span className={large ? 'text-lg' : 'text-sm'}>{count}</span>
    </button>
  )
}
