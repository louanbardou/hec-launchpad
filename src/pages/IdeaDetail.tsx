import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import type { Comment, Idea } from '../lib/types'
import { STAGE_LABEL } from '../lib/types'
import { timeAgo } from '../lib/format'
import { TopBar } from '../components/TopBar'
import { Avatar } from '../components/Avatar'
import { Chips } from '../components/Chips'
import { VoteButton } from '../components/VoteButton'
import { Empty, Spinner } from '../components/Empty'

export function IdeaDetail() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const { user, profile } = useAuth()
  const [idea, setIdea] = useState<Idea | null | undefined>(undefined)
  const [comments, setComments] = useState<Comment[]>([])
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.getIdea(id).then(setIdea).catch(() => setIdea(null))
    api.listComments(id).then(setComments).catch(() => {})
  }, [id])

  const vote = async () => {
    if (!idea) return
    setIdea({ ...idea, voted_by_me: !idea.voted_by_me, vote_count: idea.vote_count + (idea.voted_by_me ? -1 : 1) })
    try { await api.toggleVote(idea.id) } catch { setIdea(await api.getIdea(id)) }
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const text = body.trim()
    if (!text) return
    setBusy(true)
    try {
      const c = await api.addComment(id, text)
      setComments((prev) => [...prev, c])
      setBody('')
      setIdea((i) => i && { ...i, comment_count: i.comment_count + 1 })
    } finally { setBusy(false) }
  }

  const removeComment = async (cid: string) => {
    if (!confirm('Supprimer ce commentaire ?')) return
    await api.deleteComment(cid)
    setComments((prev) => prev.filter((c) => c.id !== cid))
    setIdea((i) => i && { ...i, comment_count: Math.max(0, i.comment_count - 1) })
  }

  const removeIdea = async () => {
    if (!idea || !confirm('Supprimer cette idée et ses commentaires ?')) return
    await api.deleteIdea(idea.id)
    nav('/')
  }

  if (idea === undefined) return <><TopBar title="Idée" back /><Spinner /></>
  if (idea === null) return <><TopBar title="Idée" back /><Empty icon="🫥" title="Idée introuvable" /></>

  const canEdit = user && (user.id === idea.author_id || profile?.is_admin)

  return (
    <>
      <TopBar title="Idée" back right={canEdit && (
        <div className="flex gap-1">
          <Link to={`/idea/${idea.id}/edit`} className="btn-ghost !min-h-[36px] !px-3 text-sm">Modifier</Link>
          <button onClick={removeIdea} className="btn-ghost !min-h-[36px] !px-3 text-sm text-red-500">Suppr.</button>
        </div>
      )} />
      <div className="mx-auto max-w-xl px-4 pt-4 pb-44 space-y-4">
        <div className="flex gap-4">
          <VoteButton large count={idea.vote_count} active={idea.voted_by_me} onClick={vote} />
          <div className="flex-1 min-w-0">
            <span className="chip !min-h-[22px] !text-[10px]">{STAGE_LABEL[idea.stage]}</span>
            <h1 className="text-2xl font-extrabold leading-tight mt-1">{idea.title}</h1>
            <Link to={`/u/${idea.author_id}`} className="flex items-center gap-2 mt-2 text-sm muted">
              <Avatar name={idea.author_name} src={idea.author_avatar} size={24} />
              <span>{idea.author_name}</span><span>·</span><span>{timeAgo(idea.created_at)}</span>
            </Link>
          </div>
        </div>

        <p className="text-[17px] leading-relaxed">{idea.pitch}</p>
        {idea.description && <p className="whitespace-pre-wrap leading-relaxed muted">{idea.description}</p>}

        {idea.needs.length > 0 && (
          <section className="card p-4">
            <h2 className="text-sm font-bold mb-2">Cherche</h2>
            <Chips items={idea.needs} />
            {user?.id !== idea.author_id && (
              <Link to={`/u/${idea.author_id}`} className="btn w-full mt-3">Je veux rejoindre 🚀</Link>
            )}
          </section>
        )}
        {idea.tags.length > 0 && <Chips items={idea.tags.map((t) => `#${t}`)} />}

        <section>
          <h2 className="font-bold mb-2">Commentaires ({comments.length})</h2>
          <div className="space-y-2">
            {comments.length === 0 && <p className="muted text-sm">Pas encore de commentaire. Lance la discussion.</p>}
            {comments.map((c) => (
              <div key={c.id} className="card p-3">
                <div className="flex items-center gap-2 text-xs muted">
                  <Avatar name={c.author_name} size={20} />
                  <Link to={`/u/${c.author_id}`} className="font-semibold" style={{ color: 'var(--text)' }}>{c.author_name}</Link>
                  <span>·</span><span>{timeAgo(c.created_at)}</span>
                  {user && (user.id === c.author_id || profile?.is_admin) && (
                    <button onClick={() => removeComment(c.id)} className="ml-auto text-red-500 min-h-[32px] px-2">Suppr.</button>
                  )}
                </div>
                <p className="mt-1 whitespace-pre-wrap text-[15px]">{c.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <form onSubmit={submit} className="fixed inset-x-0 z-20" style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom))', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div className="mx-auto max-w-xl p-3 flex gap-2 items-end">
          <textarea className="input !min-h-[44px] max-h-32" rows={1} placeholder="Écrire un commentaire…" value={body} onChange={(e) => setBody(e.target.value)} onInput={(e) => { const t = e.currentTarget; t.style.height = 'auto'; t.style.height = Math.min(128, t.scrollHeight) + 'px' }} />
          <button className="btn shrink-0" disabled={busy || !body.trim()}>Envoyer</button>
        </div>
      </form>
    </>
  )
}
