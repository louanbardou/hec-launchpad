// Mode démo : tout est stocké dans localStorage. Sert à tester l'interface sans Supabase.
import type { Api, CofounderPost, Comment, Idea, Profile, User } from './types'

const KEY = 'launchpad-demo-v1'
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2))
const ago = (h: number) => new Date(Date.now() - h * 3600_000).toISOString()

interface Store {
  user: User | null
  profiles: Profile[]
  ideas: Array<Omit<Idea, 'author_name' | 'author_avatar' | 'vote_count' | 'comment_count' | 'voted_by_me'>>
  votes: Array<{ user_id: string; idea_id: string }>
  comments: Array<Omit<Comment, 'author_name'>>
  cofounder_posts: Array<Omit<CofounderPost, 'author_name' | 'author_skills'>>
}

function seed(): Store {
  const p = (id: string, name: string, skills: string[], looking: string[], bio: string): Profile => ({
    id, display_name: name, bio, skills, looking_for: looking, linkedin_url: null, avatar_url: null, is_admin: false, created_at: ago(400),
  })
  const profiles = [
    p('u-camille', 'Camille Roux', ['Business', 'Finance'], ['Cofondateur'], 'Ex-M&A, je cherche un profil tech pour une fintech B2B.'),
    p('u-mehdi', 'Mehdi Benali', ['Tech', 'Data / IA'], ['Une idée'], 'Dev full-stack, 2 ans chez une scale-up. Ouvert à tout sujet avec de la data.'),
    p('u-lea', 'Léa Fontaine', ['Design', 'Produit'], ['Une équipe'], 'Product designer, j\'aime les sujets santé et impact.'),
    p('u-tom', 'Tom Girard', ['Marketing', 'Ventes'], ['Cofondateur'], 'Growth et contenu. J\'ai déjà lancé une newsletter à 10k abonnés.'),
  ]
  const ideas: Store['ideas'] = [
    { id: 'i1', author_id: 'u-camille', title: 'Trésorerie prédictive pour PME', pitch: 'Un tableau de bord qui prévoit la trésorerie à 90 jours à partir des factures et du compte bancaire.', description: 'Connexion bancaire via API, lecture des factures, modèle simple de prévision. Cible : PME de 10 à 50 salariés sans DAF.', stage: 'idee', needs: ['Tech', 'Data / IA'], tags: ['fintech', 'B2B'], created_at: ago(30), updated_at: ago(30) },
    { id: 'i2', author_id: 'u-lea', title: 'Carnet de santé partagé pour aidants', pitch: 'Une app pour que les proches d\'une personne âgée partagent rendez-vous, traitements et notes au même endroit.', description: 'Le besoin vient de ma propre famille. Le produit doit être utilisable par des personnes de 70 ans.', stage: 'proto', needs: ['Tech', 'Santé'], tags: ['santé', 'B2C'], created_at: ago(80), updated_at: ago(80) },
    { id: 'i3', author_id: 'u-tom', title: 'Marketplace de stages courts pour étudiants', pitch: 'Des missions de 2 à 4 semaines en startup, payées, matchées sur compétences plutôt que sur CV.', description: '', stage: 'idee', needs: ['Tech', 'Produit'], tags: ['edtech', 'marketplace'], created_at: ago(5), updated_at: ago(5) },
    { id: 'i4', author_id: 'u-mehdi', title: 'Assistant IA pour réponse aux appels d\'offres', pitch: 'Génère un premier jet de réponse à un appel d\'offres public à partir des documents de l\'entreprise.', description: 'Marché : PME du BTP et des services qui perdent des jours sur chaque dossier.', stage: 'proto', needs: ['Ventes', 'Business'], tags: ['IA', 'B2B'], created_at: ago(150), updated_at: ago(150) },
  ]
  const votes = [
    { user_id: 'u-mehdi', idea_id: 'i1' }, { user_id: 'u-lea', idea_id: 'i1' }, { user_id: 'u-tom', idea_id: 'i1' },
    { user_id: 'u-camille', idea_id: 'i2' }, { user_id: 'u-mehdi', idea_id: 'i2' },
    { user_id: 'u-lea', idea_id: 'i3' },
    { user_id: 'u-camille', idea_id: 'i4' }, { user_id: 'u-tom', idea_id: 'i4' }, { user_id: 'u-lea', idea_id: 'i4' }, { user_id: 'u-mehdi', idea_id: 'i4' },
  ]
  const comments: Store['comments'] = [
    { id: 'c1', idea_id: 'i1', author_id: 'u-mehdi', body: 'Intéressé côté tech, tu as déjà regardé les API d\'agrégation bancaire ?', created_at: ago(20) },
    { id: 'c2', idea_id: 'i1', author_id: 'u-camille', body: 'Oui, deux options en vue. On en parle jeudi ?', created_at: ago(18) },
    { id: 'c3', idea_id: 'i4', author_id: 'u-tom', body: 'J\'ai un contact dans une PME du BTP pour un premier test.', created_at: ago(100) },
  ]
  const cofounder_posts: Store['cofounder_posts'] = [
    { id: 'cf1', author_id: 'u-camille', headline: 'Cherche CTO pour fintech B2B', body: 'Idée validée auprès de 12 PME, je cherche quelqu\'un pour construire le MVP avec moi.', skills_offered: ['Business', 'Finance'], skills_wanted: ['Tech'], status: 'open', created_at: ago(28) },
    { id: 'cf2', author_id: 'u-mehdi', headline: 'Dev dispo, cherche un sujet avec un business profile', body: 'Je code vite et proprement. Je veux un cofondateur qui connaît un marché.', skills_offered: ['Tech', 'Data / IA'], skills_wanted: ['Business', 'Ventes'], status: 'open', created_at: ago(60) },
  ]
  return { user: null, profiles, ideas, votes, comments, cofounder_posts }
}

function load(): Store {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Store
  } catch { /* ignore */ }
  const s = seed()
  save(s)
  return s
}
function save(s: Store) {
  try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* ignore */ }
}

export function createDemoApi(): Api {
  let store = load()
  const listeners = new Set<(u: User | null) => void>()
  const persist = () => save(store)
  const me = () => {
    if (!store.user) throw new Error('not authenticated')
    return store.user
  }
  const profileOf = (id: string) => store.profiles.find((p) => p.id === id)
  const hydrate = (i: Store['ideas'][number]): Idea => ({
    ...i,
    author_name: profileOf(i.author_id)?.display_name ?? '?',
    author_avatar: profileOf(i.author_id)?.avatar_url ?? null,
    vote_count: store.votes.filter((v) => v.idea_id === i.id).length,
    comment_count: store.comments.filter((c) => c.idea_id === i.id).length,
    voted_by_me: !!store.user && store.votes.some((v) => v.idea_id === i.id && v.user_id === store.user!.id),
  })
  const delay = <T,>(v: T) => new Promise<T>((r) => setTimeout(() => r(v), 120))

  return {
    mode: 'demo',
    async getUser() { return store.user },
    onAuthChange(cb) { listeners.add(cb); return () => listeners.delete(cb) },
    async sendOtp(email) {
      if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) throw new Error('Email invalide')
      sessionStorage.setItem('demo-pending-email', email)
    },
    async verifyOtp(email, token) {
      if (token.replace(/\D/g, '').length < 6) throw new Error('Code invalide (6 chiffres). En démo, n\'importe quel code à 6 chiffres fonctionne.')
      const id = 'u-' + email.toLowerCase()
      if (!profileOf(id)) {
        const name = email.split('@')[0].split('.').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
        store.profiles.push({ id, display_name: name, bio: '', skills: [], looking_for: [], linkedin_url: null, avatar_url: null, is_admin: true, created_at: new Date().toISOString() })
      }
      store.user = { id, email }
      persist()
      listeners.forEach((l) => l(store.user))
    },
    async signOut() {
      store.user = null
      persist()
      listeners.forEach((l) => l(null))
    },

    async getProfile(id) { return delay(profileOf(id) ?? null) },
    async updateProfile(patch) {
      const u = me()
      const p = profileOf(u.id)
      if (!p) throw new Error('profile missing')
      Object.assign(p, { ...patch, id: p.id, is_admin: p.is_admin, created_at: p.created_at })
      persist()
      return { ...p }
    },
    async listProfiles() { return delay([...store.profiles].sort((a, b) => a.display_name.localeCompare(b.display_name))) },

    async listIdeas() { return delay(store.ideas.map(hydrate).sort((a, b) => b.created_at.localeCompare(a.created_at))) },
    async getIdea(id) { const i = store.ideas.find((x) => x.id === id); return delay(i ? hydrate(i) : null) },
    async createIdea(input) {
      const u = me()
      const now = new Date().toISOString()
      const i = { id: uid(), author_id: u.id, created_at: now, updated_at: now, ...input }
      store.ideas.unshift(i)
      persist()
      return hydrate(i)
    },
    async updateIdea(id, input) {
      const i = store.ideas.find((x) => x.id === id)
      if (i) Object.assign(i, input, { updated_at: new Date().toISOString() })
      persist()
    },
    async deleteIdea(id) {
      store.ideas = store.ideas.filter((x) => x.id !== id)
      store.votes = store.votes.filter((v) => v.idea_id !== id)
      store.comments = store.comments.filter((c) => c.idea_id !== id)
      persist()
    },
    async toggleVote(ideaId) {
      const u = me()
      const idx = store.votes.findIndex((v) => v.idea_id === ideaId && v.user_id === u.id)
      if (idx >= 0) store.votes.splice(idx, 1)
      else store.votes.push({ user_id: u.id, idea_id: ideaId })
      persist()
      return idx < 0
    },

    async listComments(ideaId) {
      return delay(store.comments.filter((c) => c.idea_id === ideaId).map((c) => ({ ...c, author_name: profileOf(c.author_id)?.display_name ?? '?' })))
    },
    async addComment(ideaId, body) {
      const u = me()
      const c = { id: uid(), idea_id: ideaId, author_id: u.id, body, created_at: new Date().toISOString() }
      store.comments.push(c)
      persist()
      return { ...c, author_name: profileOf(u.id)?.display_name ?? 'Moi' }
    },
    async deleteComment(id) {
      store.comments = store.comments.filter((c) => c.id !== id)
      persist()
    },

    async listCofounderPosts() {
      return delay(store.cofounder_posts.map((p) => ({ ...p, author_name: profileOf(p.author_id)?.display_name ?? '?', author_skills: profileOf(p.author_id)?.skills ?? [] })).sort((a, b) => b.created_at.localeCompare(a.created_at)))
    },
    async createCofounderPost(input) {
      const u = me()
      const p = { id: uid(), author_id: u.id, status: 'open' as const, created_at: new Date().toISOString(), ...input }
      store.cofounder_posts.unshift(p)
      persist()
      return { ...p, author_name: profileOf(u.id)?.display_name ?? 'Moi', author_skills: profileOf(u.id)?.skills ?? [] }
    },
    async setCofounderStatus(id, status) {
      const p = store.cofounder_posts.find((x) => x.id === id)
      if (p) p.status = status
      persist()
    },
  }
}
