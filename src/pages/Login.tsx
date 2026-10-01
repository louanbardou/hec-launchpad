import { useState, type FormEvent } from 'react'
import { api } from '../lib/api'

export function Login() {
  const [email, setEmail] = useState(() => sessionStorage.getItem('demo-pending-email') ?? '')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const send = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true); setErr(null)
    try { await api.sendOtp(email.trim()); setStep('code') }
    catch (ex) { setErr((ex as Error).message) }
    finally { setBusy(false) }
  }
  const verify = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true); setErr(null)
    try { await api.verifyOtp(email.trim(), code.trim()) }
    catch (ex) { setErr((ex as Error).message) }
    finally { setBusy(false) }
  }

  return (
    <main className="min-h-dvh flex flex-col safe-top safe-bottom" style={{ background: 'var(--color-navy)', color: '#fff' }}>
      <div className="flex-1 flex flex-col justify-center px-6 mx-auto w-full max-w-md">
        <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" className="w-20 h-20 rounded-2xl mb-6" />
        <h1 className="text-3xl font-extrabold leading-tight">HEC Launchpad</h1>
        <p className="mt-2 opacity-80">Idées, cofondateurs et votes de la promo. Réservé aux adresses HEC.</p>

        {step === 'email' ? (
          <form onSubmit={send} className="mt-8 space-y-3">
            <label className="block text-sm font-semibold" htmlFor="email">Ton email HEC</label>
            <input id="email" className="input !bg-white !text-slate-900" type="email" inputMode="email" autoComplete="email" autoFocus required placeholder="prenom.nom@hec.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="btn w-full !bg-gold !text-navy" disabled={busy}>{busy ? 'Envoi…' : 'Recevoir mon code'}</button>
          </form>
        ) : (
          <form onSubmit={verify} className="mt-8 space-y-3">
            <p className="text-sm opacity-90">Un code à 6 chiffres a été envoyé à <b>{email}</b>. Tu peux aussi cliquer sur le lien dans l'email.</p>
            <input className="input !bg-white !text-slate-900 text-center tracking-[0.4em] text-xl" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]*" maxLength={6} autoFocus required placeholder="••••••" value={code} onChange={(e) => setCode(e.target.value)} />
            <button className="btn w-full !bg-gold !text-navy" disabled={busy}>{busy ? 'Vérification…' : 'Entrer'}</button>
            <button type="button" className="btn-ghost w-full !text-white !border-white/30" onClick={() => setStep('email')}>Changer d'email</button>
          </form>
        )}
        {err && <p role="alert" className="mt-4 text-sm bg-red-500/20 border border-red-300/40 rounded-lg p-3">{err}</p>}
        {api.mode === 'demo' && (
          <p className="mt-6 text-xs opacity-70">Mode démo : aucun email n'est envoyé, n'importe quel code à 6 chiffres fonctionne. Les données restent dans ce navigateur.</p>
        )}
      </div>
    </main>
  )
}
