import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import type { Idea } from '../lib/types'
import { hotScore } from '../lib/format'
import { IdeaCard } from '../components/IdeaCard'
import { TopBar } from '../components/TopBar'
import { Empty, Spinner } from '../components/Empty'

type Sort = 'hot' | 'new' | 'top'

export function Feed() {
  const [ideas, setIdeas] = useState<Idea[] | null>(null)
  const [sort, setSort] = useState<Sort>(() => (localStorage.getItem('feed-sort') as Sort) || 'hot')
  const [q, setQ] = useState('')

  useEffect(() => { api.listIdeas().then(setIdeas).catch(() => setIdeas([])) }, [])
  useEffect(() => { try { localStorage.setItem('feed-sort', sort) } catch { /* ignore */ } }, [sort])

  const vote = async (id: string) => {
    setIdeas((prev) => prev && prev.map((i) => i.id === id ? { ...i, voted_by_me: !i.voted_by_me, vote_count: i.vote_count + (i.voted_by_me ? -1 : 1) } : i))
    try { await api.toggleVote(id) } catch { setIdeas(await api.listIdeas()) }
  }

  const shown = useMemo(() => {
    if (!ideas) return []
    const needle = q.trim().toLowerCase()
    const list = needle ? ideas.filter((i) => [i.title, i.pitch, ...i.tags, ...i.needs].join(' ').toLowerCase().includes(needle)) : [...ideas]
    if (sort === 'new') list.sort((a, b) => b.created_at.localeCompare(a.created_at))
    else if (sort === 'top') list.sort((a, b) => b.vote_count - a.vote_count || b.created_at.localeCompare(a.created_at))
    else list.sort((a, b) => hotScore(b.vote_count, b.created_at) - hotScore(a.vote_count, a.created_at))
    return list
  }, [ideas, sort, q])

  return (
    <>
      <TopBar title="Idées" />
      <div className="mx-auto max-w-xl px-4 pt-3 pb-28 space-y-3">
        <input className="input" type="search" placeholder="Rechercher une idée, un tag…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="flex gap-2" role="tablist" aria-label="Tri">
          {([['hot', '🔥 Tendance'], ['new', '🆕 Récent'], ['top', '🏆 Top']] as const).map(([k, label]) => (
            <button key={k} role="tab" aria-selected={sort === k} onClick={() => setSort(k)} className={`chip flex-1 justify-center min-h-[40px] ${sort === k ? 'chip-on' : ''}`}>{label}</button>
          ))}
        </div>
        {ideas === null ? <Spinner /> : shown.length === 0 ? (
          <Empty icon="💡" title={q ? 'Rien pour cette recherche' : 'Aucune idée pour l\'instant'}>{!q && 'Sois la première personne à poster.'}</Empty>
        ) : shown.map((i) => <IdeaCard key={i.id} idea={i} onVote={vote} />)}
      </div>
    </>
  )
}
