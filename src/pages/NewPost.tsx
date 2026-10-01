import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { SKILLS, STAGE_LABEL, type Stage } from '../lib/types'
import { TopBar } from '../components/TopBar'
import { ChipSelect } from '../components/Chips'

type Kind = 'idea' | 'cofounder'

export function NewPost() {
  const nav = useNavigate()
  const { id } = useParams() // présent en mode édition d'idée
  const editing = !!id
  const [kind, setKind] = useState<Kind>('idea')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  // idée
  const [title, setTitle] = useState('')
  const [pitch, setPitch] = useState('')
  const [description, setDescription] = useState('')
  const [stage, setStage] = useState<Stage>('idee')
  const [needs, setNeeds] = useState<string[]>([])
  const [tags, setTags] = useState('')

  // cofondateur
  const [headline, setHeadline] = useState('')
  const [body, setBody] = useState('')
  const [offered, setOffered] = useState<string[]>([])
  const [wanted, setWanted] = useState<string[]>([])

  useEffect(() => {
    if (!id) return
    api.getIdea(id).then((i) => {
      if (!i) return
      setTitle(i.title); setPitch(i.pitch); setDescription(i.description); setStage(i.stage); setNeeds(i.needs); setTags(i.tags.join(', '))
    })
  }, [id])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true); setErr(null)
    try {
      if (kind === 'idea') {
        const input = { title: title.trim(), pitch: pitch.trim(), description: description.trim(), stage, needs, tags: tags.split(',').map((t) => t.trim().replace(/^#/, '').toLowerCase()).filter(Boolean).slice(0, 5) }
        if (editing) { await api.updateIdea(id, input); nav(`/idea/${id}`, { replace: true }) }
        else { const i = await api.createIdea(input); nav(`/idea/${i.id}`, { replace: true }) }
      } else {
        await api.createCofounderPost({ headline: headline.trim(), body: body.trim(), skills_offered: offered, skills_wanted: wanted })
        nav('/cofounders', { replace: true })
      }
    } catch (ex) { setErr((ex as Error).message) }
    finally { setBusy(false) }
  }

  return (
    <>
      <TopBar title={editing ? 'Modifier l\'idée' : 'Publier'} back />
      <form onSubmit={submit} className="mx-auto max-w-xl px-4 pt-4 pb-10 safe-bottom space-y-5">
        {!editing && (
          <div className="grid grid-cols-2 gap-2" role="tablist">
            <button type="button" role="tab" aria-selected={kind === 'idea'} onClick={() => setKind('idea')} className={`chip justify-center min-h-[44px] ${kind === 'idea' ? 'chip-on' : ''}`}>💡 Une idée</button>
            <button type="button" role="tab" aria-selected={kind === 'cofounder'} onClick={() => setKind('cofounder')} className={`chip justify-center min-h-[44px] ${kind === 'cofounder' ? 'chip-on' : ''}`}>🤝 Cherche cofondateur</button>
          </div>
        )}

        {kind === 'idea' ? (
          <>
            <Field label="Titre" hint={`${title.length}/80`}>
              <input className="input" required minLength={3} maxLength={80} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Trésorerie prédictive pour PME" />
            </Field>
            <Field label="Pitch en une phrase" hint={`${pitch.length}/280`}>
              <textarea className="input !min-h-[90px]" required minLength={10} maxLength={280} value={pitch} onChange={(e) => setPitch(e.target.value)} placeholder="Le problème, pour qui, et ce que tu proposes." />
            </Field>
            <Field label="Stade" group>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(STAGE_LABEL) as Stage[]).map((s) => (
                  <button key={s} type="button" onClick={() => setStage(s)} className={`chip justify-center min-h-[44px] ${stage === s ? 'chip-on' : ''}`} aria-pressed={stage === s}>{STAGE_LABEL[s]}</button>
                ))}
              </div>
            </Field>
            <Field label="Compétences recherchées" hint="optionnel" group>
              <ChipSelect options={SKILLS} value={needs} onChange={setNeeds} max={4} />
            </Field>
            <Field label="Détails" hint="optionnel">
              <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Marché, avancement, ce dont tu as besoin…" />
            </Field>
            <Field label="Tags" hint="séparés par des virgules, 5 max">
              <input className="input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="fintech, B2B, IA" />
            </Field>
          </>
        ) : (
          <>
            <Field label="Titre de l'annonce" hint={`${headline.length}/100`}>
              <input className="input" required minLength={3} maxLength={100} value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Ex. Cherche CTO pour fintech B2B" />
            </Field>
            <Field label="Ce que j'apporte" group>
              <ChipSelect options={SKILLS} value={offered} onChange={setOffered} max={4} />
            </Field>
            <Field label="Ce que je cherche" group>
              <ChipSelect options={SKILLS} value={wanted} onChange={setWanted} max={4} />
            </Field>
            <Field label="Message" hint="optionnel">
              <textarea className="input" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Où tu en es, ce que tu attends d'un cofondateur…" />
            </Field>
          </>
        )}

        {err && <p role="alert" className="text-sm text-red-500">{err}</p>}
        <button className="btn w-full" disabled={busy}>{busy ? 'Publication…' : editing ? 'Enregistrer' : 'Publier'}</button>
      </form>
    </>
  )
}

function Field({ label, hint, group, children }: { label: string; hint?: string; group?: boolean; children: React.ReactNode }) {
  // group = contenu fait de boutons (chips) : pas de <label>, sinon un clic sur le titre active le premier bouton.
  const Tag = group ? 'div' : 'label'
  return (
    <Tag className="block">
      <div className="flex justify-between text-sm font-semibold mb-1.5"><span>{label}</span>{hint && <span className="muted font-normal">{hint}</span>}</div>
      {children}
    </Tag>
  )
}
