import { NavLink, useNavigate } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'Idées', icon: '💡' },
  { to: '/cofounders', label: 'Cofounders', icon: '🤝' },
  { to: '/new', label: '', icon: '+' },
  { to: '/members', label: 'Membres', icon: '👥' },
  { to: '/me', label: 'Profil', icon: '👤' },
]

export function BottomNav() {
  const nav = useNavigate()
  return (
    <nav className="fixed bottom-0 inset-x-0 z-20 safe-bottom" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }} aria-label="Navigation principale">
      <div className="mx-auto max-w-xl grid grid-cols-5 h-16">
        {tabs.map((t) =>
          t.to === '/new' ? (
            <button key={t.to} type="button" onClick={() => nav('/new')} className="flex items-center justify-center" aria-label="Publier">
              <span className="w-14 h-14 -mt-6 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg bg-gold text-navy">+</span>
            </button>
          ) : (
            <NavLink key={t.to} to={t.to} end={t.to === '/'} className={({ isActive }) => `flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${isActive ? '' : 'muted'}`}>
              {({ isActive }) => (
                <>
                  <span className={`text-xl leading-none ${isActive ? '' : 'grayscale opacity-70'}`} aria-hidden>{t.icon}</span>
                  {t.label}
                </>
              )}
            </NavLink>
          ),
        )}
      </div>
    </nav>
  )
}
