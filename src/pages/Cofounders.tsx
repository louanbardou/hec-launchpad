import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import type { CofounderPost } from '../lib/types'
import { SKILLS } from '../lib/types'
import { timeAgo } from '../lib/format'
import { TopBar } from '../components/TopBar'
import { Avatar } from '../components/Avatar'
import { Chips } from '../components/Chips'
import { Empty, Spinner } from '../components/Empty'

export function Cofounders() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<CofounderPost[] | null>(null)
  const [skill, setSkill] = useState<string | null>(null)
  const [showClosed, setShowClosed] = useState(false)

  useEffect(() => { api.listCofounderPosts().then(setPosts).catch(() => setPosts([])) }, [])

  const shown = useMemo(() => (posts ?? []).filter((p) => (showClosed || p.status === 'open') && (!skill || p.skills_wanted.includes(skill) || p.skills_offered.includes(skill))), [posts, skill, showClosed])

  const toggle = async (p: CofounderPost) => {
    const status = p.status === 'open' ? 'closed' : 'open'
    await api.setCofounderStatus(p.id, status)
    setPosts((prev) => prev && prev.map((x) => x.id === p.id ? { ...x, status } : x))
  }

  return (
    <>
      <TopBar title="Cofounders" right={<button className="text-xs muted min-h-[44px]" onClick={() => setShowClosed((v) => !v)}>{showClosed ? 'Masquer les clos' : 'Voir les clos'}</button>} />
      <div className="mx-auto max-w-xl px-4 pt-3 pb-28 space-y-3">
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1" style={{ scrollbarWidth: 'none' }}>
          <button onClick={() => setSkill(null)} className={`chip shrink-0 min-h-[36px] ${!skill ? 'chip-on' : ''}`}>Tous</button>
          {SKILLS.map((s) => <button key={s} onClick={() => setSkill(skill === s ? null : s)} className={`chip shrink-0 min-h-[36px] ${skill === s ? 'chip-on' : ''}`}>{s}</button>)}
        </div>
        {posts === null ? <Spinner /> : shown.length === 0 ? (
          <Empty icon="🤝" title="Aucune annonce">Publie la tienne avec le bouton +.</Empty>
        ) : shown.map((p) => (
          <article key={p.id} className={`card p-4 ${p.status === 'closed' ? 'opacity-60' : ''}`}>
            <Link to={`/u/${p.author_id}`} className="flex items-center gap-2 text-xs muted mb-2">
              <Avatar name={p.author_name} size={22} /><span>{p.author_name}</span><span>·</span><span>{timeAgo(p.created_at)}</span>
              {p.status === 'closed' && <span className="chip !min-h-[20px] !text-[10px] ml-auto">Clos</span>}
            </Link>
            <h2 className="font-bold text-[17px] leading-snug">{p.headline}</h2>
            {p.body && <p className="text-sm mt-1 muted whitespace-pre-wrap">{p.body}</p>}
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div><div className="muted mb-1">Apporte</div><Chips items={p.skills_offered} /></div>
              <div><div className="muted mb-1">Cherche</div><Chips items={p.skills_wanted} /></div>
            </div>
            <div className="mt-3 flex gap-2">
              {user?.id === p.author_id
                ? <button onClick={() => toggle(p)} className="btn-ghost flex-1 text-sm">{p.status === 'open' ? 'Marquer comme trouvé' : 'Rouvrir'}</button>
                : <Link to={`/u/${p.author_id}`} className="btn flex-1 text-sm">Contacter</Link>}
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
