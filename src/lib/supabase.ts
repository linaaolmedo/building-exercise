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

// Database interfaces based on schema
export interface Student {
  id: number
  ssid: string
  local_id?: string
  first_name: string
  last_name: string
  preferred_name?: string
  birthdate: string
  status: string
  gender?: string
  grade?: number
  district: string
  school?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  primary_contact_name?: string
  primary_contact_phone?: string
  practitioner_id?: number
  primary_disability?: string
  parental_consent_on_file: boolean
  parental_consent_in_bill: boolean
  parental_consent_given: boolean
  parental_consent_date?: string
  comments?: string
  insurance_type?: string
  insurance_carrier?: string
  insurance_group_number?: string
  insurance_policy_number?: string
  insurance_effective_date?: string
  medi_cal_eligible: boolean
  medi_cal_benefits_id?: string
  iep_date?: string
  next_review_date?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  created_at: string
  updated_at: string
  created_by?: number
  updated_by?: number
}

export interface Service {
  id?: number
  student_id?: number
  practitioner_id: number
  service_date: string
  service_time?: string
  end_time?: string
  duration_minutes?: number
  service_type?: string
  location?: string
  status: string
  case_notes?: string
  appointment_notes?: string
  is_group_service: boolean
  group_name?: string
  created_at?: string
  updated_at?: string
  created_by?: number
  updated_by?: number
}

export interface ServiceGroup {
  id: number
  name: string
  description?: string
  created_date: string
  created_by?: number
  practitioner_id?: number
  status: string
  service_type?: string
  meeting_frequency?: string
  duration?: string
  location?: string
  updated_at: string
  updated_by?: number
}

export interface GroupMembership {
  id: number
  group_id: number
  student_id: number
  join_date?: string
  status: string
  exit_date?: string
  exit_reason?: string
  created_at: string
  updated_at: string
  created_by?: number
  updated_by?: number
}

// Additional database interfaces
export interface BillingCode {
  id: number
  code: string
  type?: string
  description?: string
  unit?: string
  rate?: number
  eligible_practitioners?: string[]
  status: string
  effective_date?: string
  payer_specific: boolean
  created_at: string
  updated_at: string
  created_by?: number
  updated_by?: number
}

export interface FeeScheduleCode {
  id: number
  procedure_code: string
  service_description: string
  service_category: string
  time_increment_text?: string
  base_minutes?: number
  group_size_min?: number
  group_size_max?: number
  rate_amount: number
  rate_unit?: string
  dyadic_allowed: boolean
  telehealth_audio: boolean
  telehealth_av: boolean
  add_on_to_code?: string
  effective_year?: number
  source_version?: string
  notes?: string
  created_at: string
  updated_at: string
  created_by?: number
  updated_by?: number
}

// Service form data types
export interface ServiceFormData {
  student_id?: number
  group_id?: number
  service_date: string
  service_time: string
  end_time: string
  service_type: string
  location: string
  case_notes: string
  is_group_service: boolean
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