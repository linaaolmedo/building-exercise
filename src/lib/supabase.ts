import { createBrowserClient } from '@supabase/ssr'
import { PostgrestError, AuthError } from '@supabase/supabase-js'

// These values would normally come from environment variables
const supabaseUrl = 'https://qmtoncuptliscobrkjsb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtdG9uY3VwdGxpc2NvYnJranNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MjMyODAsImV4cCI6MjA2OTI5OTI4MH0.9d2I_CNBrJt00b3tfga4uBY9aQXVqTFxpICtR4KvX0o'

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

export type UserRole = 'Administrator' | 'Billing Administrator' | 'Supervisor' | 'Practitioner'

export interface AppUser {
  id: number
  first_name: string
  last_name: string
  email: string
  role: UserRole
  status: string
  auth_user_id?: string
}

// Authentication utilities
export const authUtils = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  async getCurrentAppUser(): Promise<{ data: AppUser | null, error: AuthError | PostgrestError | null }> {
    const { user, error: authError } = await this.getCurrentUser()
    
    if (authError || !user) {
      return { data: null, error: authError }
    }

    // Try to find the app user by email since we can't link by auth_user_id yet
    const { data, error } = await supabase
      .from('app_user')
      .select('*')
      .eq('email', user.email)
      .single()

    return { data, error }
  },

  async createUser(email: string, password: string, userData: Partial<AppUser>) {
    // First create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      return { data: null, error: authError }
    }

    // Then create the app user record
    const { data: appUserData, error: appUserError } = await supabase
      .from('app_user')
      .insert([{
        email,
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        role: userData.role || 'Practitioner',
        status: 'Active',
      }])
      .select()
      .single()

    return { data: { auth: authData, appUser: appUserData }, error: appUserError }
  }
} 