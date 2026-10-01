import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import type { Idea, Profile as P } from '../lib/types'
import { LOOKING_FOR, SKILLS } from '../lib/types'
import { TopBar } from '../components/TopBar'
import { Avatar } from '../components/Avatar'
import { ChipSelect, Chips } from '../components/Chips'
import { IdeaCard } from '../components/IdeaCard'
import { Empty, Spinner } from '../components/Empty'

export function ProfilePage() {
  const { id } = useParams()
  const { user, profile: mine, refreshProfile, signOut } = useAuth()
  const isMe = !id || id === user?.id
  const [profile, setProfile] = useState<P | null | undefined>(isMe ? mine ?? undefined : undefined)
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [edit, setEdit] = useState(false)

  useEffect(() => {
    if (isMe) { setProfile(mine ?? undefined); return }
    api.getProfile(id!).then(setProfile).catch(() => setProfile(null))
  }, [id, isMe, mine])
  useEffect(() => {
    const target = isMe ? user?.id : id
    if (!target) return
    api.listIdeas().then((all) => setIdeas(all.filter((i) => i.author_id === target))).catch(() => {})
  }, [id, isMe, user?.id])

  const vote = async (ideaId: string) => {
    setIdeas((prev) => prev.map((i) => i.id === ideaId ? { ...i, voted_by_me: !i.voted_by_me, vote_count: i.vote_count + (i.voted_by_me ? -1 : 1) } : i))
    try { await api.toggleVote(ideaId) } catch { /* ignore */ }
  }

  if (isMe && mine && !profile?.display_name && !edit) setEdit(true)
  if (profile === undefined) return <><TopBar title="Profil" back={!isMe} /><Spinner /></>
  if (profile === null) return <><TopBar title="Profil" back /><Empty icon="🫥" title="Profil introuvable" /></>

  if (edit && isMe) return <EditProfile profile={profile} onDone={async () => { await refreshProfile(); setEdit(false) }} />

  return (
    <>
      <TopBar title={isMe ? 'Mon profil' : profile.display_name} back={!isMe} right={isMe && <button className="btn-ghost !min-h-[36px] !px-3 text-sm" onClick={() => setEdit(true)}>Modifier</button>} />
      <div className="mx-auto max-w-xl px-4 pt-4 pb-28 space-y-4">
        <div className="flex items-center gap-4">
          <Avatar name={profile.display_name} src={profile.avatar_url} size={64} />
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold">{profile.display_name || 'Sans nom'}</h1>
            {isMe && user && <div className="text-xs muted truncate">{user.email}</div>}
            {profile.looking_for.length > 0 && <div className="text-sm muted mt-0.5">Cherche : {profile.looking_for.join(', ')}</div>}
          </div>
        </div>
        {profile.bio && <p className="whitespace-pre-wrap leading-relaxed">{profile.bio}</p>}
        <Chips items={profile.skills} />
        {!isMe && (
          <div className="flex gap-2">
            {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="btn flex-1">LinkedIn</a>}
            {api.mode === 'demo' ? <span className="btn-ghost flex-1 opacity-60">Email (démo)</span> : <ContactButton id={profile.id} />}
          </div>
        )}

        <section>
          <h2 className="font-bold mb-2">{isMe ? 'Mes idées' : 'Ses idées'} ({ideas.length})</h2>
          <div className="space-y-3">
            {ideas.length === 0 && <p className="muted text-sm">Aucune idée publiée.</p>}
            {ideas.map((i) => <IdeaCard key={i.id} idea={i} onVote={vote} />)}
          </div>
        </section>

        {isMe && (
          <div className="pt-4 space-y-2">
            <button onClick={signOut} className="btn-ghost w-full">Se déconnecter</button>
            <p className="text-[11px] muted text-center">HEC Launchpad · {api.mode === 'demo' ? 'mode démo' : 'données hébergées sur Supabase'} · <Link to="/about">à propos</Link></p>
          </div>
        )}
      </div>
    </>
  )
}

function ContactButton({ id }: { id: string }) {
  // L'email n'est pas exposé publiquement : on passe par la page profil (LinkedIn) ou un commentaire.
  return <Link to={`/members?u=${id}`} className="btn-ghost flex-1" title="Commente une de ses idées ou passe par LinkedIn">Commenter ses idées</Link>
}

function EditProfile({ profile, onDone }: { profile: P; onDone: () => Promise<void> }) {
  const [name, setName] = useState(profile.display_name)
  const [bio, setBio] = useState(profile.bio)
  const [skills, setSkills] = useState<string[]>(profile.skills)
  const [looking, setLooking] = useState<string[]>(profile.looking_for)
  const [linkedin, setLinkedin] = useState(profile.linkedin_url ?? '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true); setErr(null)
    try {
      await api.updateProfile({ display_name: name.trim(), bio: bio.trim(), skills, looking_for: looking, linkedin_url: linkedin.trim() || null })
      await onDone()
    } catch (ex) { setErr((ex as Error).message) }
    finally { setBusy(false) }
  }

  return (
    <>
      <TopBar title="Mon profil" />
      <form onSubmit={submit} className="mx-auto max-w-xl px-4 pt-4 pb-28 space-y-5">
        <label className="block"><div className="text-sm font-semibold mb-1.5">Nom affiché</div>
          <input className="input" required minLength={2} maxLength={60} value={name} onChange={(e) => setName(e.target.value)} placeholder="Prénom Nom" /></label>
        <label className="block"><div className="text-sm font-semibold mb-1.5">En une ligne</div>
          <textarea className="input !min-h-[80px]" maxLength={400} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Ton parcours, ce qui t'anime, ce que tu cherches." /></label>
        <div><div className="text-sm font-semibold mb-1.5">Mes compétences</div><ChipSelect options={SKILLS} value={skills} onChange={setSkills} max={5} /></div>
        <div><div className="text-sm font-semibold mb-1.5">Je cherche</div><ChipSelect options={LOOKING_FOR} value={looking} onChange={setLooking} max={2} /></div>
        <label className="block"><div className="text-sm font-semibold mb-1.5">LinkedIn <span className="muted font-normal">optionnel</span></div>
          <input className="input" type="url" inputMode="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/…" /></label>
        {err && <p role="alert" className="text-sm text-red-500">{err}</p>}
        <button className="btn w-full" disabled={busy || !name.trim()}>{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
      </form>
    </>
  )
}
