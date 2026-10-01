import type { SupabaseClient } from '@supabase/supabase-js'
import type { Api, CofounderInput, CofounderPost, Comment, Idea, Profile, User } from './types'

export function createSupabaseApi(sb: SupabaseClient): Api {
  const toUser = (u: { id: string; email?: string } | null | undefined): User | null =>
    u ? { id: u.id, email: u.email ?? '' } : null

  return {
    mode: 'supabase',

    async getUser() {
      const { data } = await sb.auth.getSession()
      return toUser(data.session?.user)
    },
    onAuthChange(cb) {
      const { data } = sb.auth.onAuthStateChange((_e, session) => cb(toUser(session?.user)))
      return () => data.subscription.unsubscribe()
    },
    async sendOtp(email) {
      const redirect = window.location.origin + import.meta.env.BASE_URL
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirect, shouldCreateUser: true },
      })
      if (error) throw error
    },
    async verifyOtp(email, token) {
      const { error } = await sb.auth.verifyOtp({ email, token, type: 'email' })
      if (error) throw error
    },
    async signOut() {
      await sb.auth.signOut()
    },

    async getProfile(id) {
      const { data } = await sb.from('profiles').select('*').eq('id', id).maybeSingle()
      return (data as Profile | null) ?? null
    },
    async updateProfile(patch) {
      const { data: s } = await sb.auth.getSession()
      const id = s.session?.user.id
      if (!id) throw new Error('not authenticated')
      const { is_admin: _a, created_at: _c, id: _i, ...safe } = patch; void _a; void _c; void _i
      const { data, error } = await sb.from('profiles').update(safe).eq('id', id).select().single()
      if (error) throw error
      return data as Profile
    },
    async listProfiles() {
      const { data, error } = await sb.from('profiles').select('*').order('display_name')
      if (error) throw error
      return data as Profile[]
    },

    async listIdeas() {
      const { data, error } = await sb.from('idea_feed').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data as Idea[]
    },
    async getIdea(id) {
      const { data, error } = await sb.from('idea_feed').select('*').eq('id', id).maybeSingle()
      if (error) throw error
      return (data as Idea | null) ?? null
    },
    async createIdea(input) {
      const { data, error } = await sb.from('ideas').insert(input).select('id').single()
      if (error) throw error
      const idea = await this.getIdea(data.id)
      if (!idea) throw new Error('idea not found after insert')
      return idea
    },
    async updateIdea(id, input) {
      const { error } = await sb.from('ideas').update({ ...input, updated_at: new Date().toISOString() }).eq('id', id)
      if (error) throw error
    },
    async deleteIdea(id) {
      const { error } = await sb.from('ideas').delete().eq('id', id)
      if (error) throw error
    },
    async toggleVote(ideaId) {
      const { data, error } = await sb.rpc('toggle_vote', { p_idea_id: ideaId })
      if (error) throw error
      return data as boolean
    },

    async listComments(ideaId) {
      const { data, error } = await sb
        .from('comments')
        .select('id, idea_id, author_id, body, created_at, profiles!comments_author_id_fkey(display_name)')
        .eq('idea_id', ideaId)
        .order('created_at')
      if (error) throw error
      return (data as unknown as Array<Omit<Comment, 'author_name'> & { profiles: { display_name: string } | null }>).map(
        ({ profiles, ...c }) => ({ ...c, author_name: profiles?.display_name ?? '?' }),
      )
    },
    async addComment(ideaId, body) {
      const { data, error } = await sb
        .from('comments')
        .insert({ idea_id: ideaId, body })
        .select('id, idea_id, author_id, body, created_at, profiles!comments_author_id_fkey(display_name)')
        .single()
      if (error) throw error
      const { profiles, ...c } = data as unknown as Omit<Comment, 'author_name'> & { profiles: { display_name: string } | null }
      return { ...c, author_name: profiles?.display_name ?? 'Moi' }
    },
    async deleteComment(id) {
      const { error } = await sb.from('comments').delete().eq('id', id)
      if (error) throw error
    },

    async listCofounderPosts() {
      const { data, error } = await sb
        .from('cofounder_posts')
        .select('*, profiles!cofounder_posts_author_id_fkey(display_name, skills)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data as unknown as Array<Omit<CofounderPost, 'author_name' | 'author_skills'> & { profiles: { display_name: string; skills: string[] } | null }>).map(
        ({ profiles, ...p }) => ({ ...p, author_name: profiles?.display_name ?? '?', author_skills: profiles?.skills ?? [] }),
      )
    },
    async createCofounderPost(input: CofounderInput) {
      const { data, error } = await sb
        .from('cofounder_posts')
        .insert(input)
        .select('*, profiles!cofounder_posts_author_id_fkey(display_name, skills)')
        .single()
      if (error) throw error
      const { profiles, ...p } = data as unknown as Omit<CofounderPost, 'author_name' | 'author_skills'> & { profiles: { display_name: string; skills: string[] } | null }
      return { ...p, author_name: profiles?.display_name ?? 'Moi', author_skills: profiles?.skills ?? [] }
    },
    async setCofounderStatus(id, status) {
      const { error } = await sb.from('cofounder_posts').update({ status }).eq('id', id)
      if (error) throw error
    },
  }
}
