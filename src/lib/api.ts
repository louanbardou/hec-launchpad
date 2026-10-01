import { supabase } from './supabase'
import { createSupabaseApi } from './api.supabase'
import { createDemoApi } from './api.demo'
import type { Api } from './types'

export const api: Api = supabase ? createSupabaseApi(supabase) : createDemoApi()
