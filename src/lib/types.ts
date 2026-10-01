export type Stage = 'idee' | 'proto' | 'lance'

export const STAGE_LABEL: Record<Stage, string> = {
  idee: 'Idée',
  proto: 'Prototype',
  lance: 'Lancé',
}

export const SKILLS = [
  'Tech', 'Produit', 'Design', 'Business', 'Finance', 'Marketing', 'Ventes',
  'Ops', 'Data / IA', 'Juridique', 'Hardware', 'Santé', 'Impact',
] as const

export const LOOKING_FOR = ['Cofondateur', 'Une idée', 'Une équipe', 'Rien pour l\'instant'] as const

export interface User {
  id: string
  email: string
}

export interface Profile {
  id: string
  display_name: string
  bio: string
  skills: string[]
  looking_for: string[]
  linkedin_url: string | null
  avatar_url: string | null
  is_admin: boolean
  created_at: string
}

export interface Idea {
  id: string
  author_id: string
  author_name: string
  author_avatar: string | null
  title: string
  pitch: string
  description: string
  stage: Stage
  needs: string[]
  tags: string[]
  created_at: string
  updated_at: string
  vote_count: number
  comment_count: number
  voted_by_me: boolean
}

export interface IdeaInput {
  title: string
  pitch: string
  description: string
  stage: Stage
  needs: string[]
  tags: string[]
}

export interface Comment {
  id: string
  idea_id: string
  author_id: string
  author_name: string
  body: string
  created_at: string
}

export interface CofounderPost {
  id: string
  author_id: string
  author_name: string
  author_skills: string[]
  headline: string
  body: string
  skills_offered: string[]
  skills_wanted: string[]
  status: 'open' | 'closed'
  created_at: string
}

export interface CofounderInput {
  headline: string
  body: string
  skills_offered: string[]
  skills_wanted: string[]
}

export interface Api {
  readonly mode: 'supabase' | 'demo'
  getUser(): Promise<User | null>
  onAuthChange(cb: (u: User | null) => void): () => void
  sendOtp(email: string): Promise<void>
  verifyOtp(email: string, token: string): Promise<void>
  signOut(): Promise<void>

  getProfile(id: string): Promise<Profile | null>
  updateProfile(patch: Partial<Profile>): Promise<Profile>
  listProfiles(): Promise<Profile[]>

  listIdeas(): Promise<Idea[]>
  getIdea(id: string): Promise<Idea | null>
  createIdea(input: IdeaInput): Promise<Idea>
  updateIdea(id: string, input: IdeaInput): Promise<void>
  deleteIdea(id: string): Promise<void>
  toggleVote(ideaId: string): Promise<boolean>

  listComments(ideaId: string): Promise<Comment[]>
  addComment(ideaId: string, body: string): Promise<Comment>
  deleteComment(id: string): Promise<void>

  listCofounderPosts(): Promise<CofounderPost[]>
  createCofounderPost(input: CofounderInput): Promise<CofounderPost>
  setCofounderStatus(id: string, status: 'open' | 'closed'): Promise<void>
}
