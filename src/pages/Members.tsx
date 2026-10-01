import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import type { Profile } from '../lib/types'
import { SKILLS } from '../lib/types'
import { TopBar } from '../components/TopBar'
import { Avatar } from '../components/Avatar'
import { Chips } from '../components/Chips'
import { Empty, Spinner } from '../components/Empty'

export function Members() {
  const [profiles, setProfiles] = useState<Profile[] | null>(null)
  const [skill, setSkill] = useState<string | null>(null)
  const [q, setQ] = useState('')
  useEffect(() => { api.listProfiles().then(setProfiles).catch(() => setProfiles([])) }, [])

  const shown = useMemo(() => {
    const n = q.trim().toLowerCase()
    return (profiles ?? []).filter((p) => (!skill || p.skills.includes(skill)) && (!n || (p.display_name + ' ' + p.bio).toLowerCase().includes(n)))
  }, [profiles, skill, q])

  return (
    <>
      <TopBar title="Membres" />
      <div className="mx-auto max-w-xl px-4 pt-3 pb-28 space-y-3">
        <input className="input" type="search" placeholder="Nom, mot-clé…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1" style={{ scrollbarWidth: 'none' }}>
          <button onClick={() => setSkill(null)} className={`chip shrink-0 min-h-[36px] ${!skill ? 'chip-on' : ''}`}>Tous</button>
          {SKILLS.map((s) => <button key={s} onClick={() => setSkill(skill === s ? null : s)} className={`chip shrink-0 min-h-[36px] ${skill === s ? 'chip-on' : ''}`}>{s}</button>)}
        </div>
        {profiles === null ? <Spinner /> : shown.length === 0 ? <Empty icon="👥" title="Personne ici" /> : shown.map((p) => (
          <Link key={p.id} to={`/u/${p.id}`} className="card p-4 flex gap-3 items-start">
            <Avatar name={p.display_name} src={p.avatar_url} size={44} />
            <div className="min-w-0 flex-1">
              <div className="font-bold">{p.display_name}</div>
              {p.looking_for.length > 0 && <div className="text-xs muted">Cherche : {p.looking_for.join(', ')}</div>}
              {p.bio && <p className="text-sm mt-1 line-clamp-2">{p.bio}</p>}
              <div className="mt-2"><Chips items={p.skills} /></div>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
