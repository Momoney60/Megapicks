import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export function createServerSupabaseClient(): SupabaseClient {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error('Supabase env not configured')
	}
	return createClient(supabaseUrl, supabaseAnonKey)
}

export function createServerSupabaseServiceRoleClient(): SupabaseClient {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
	const serviceKey = process.env.SUPABASE_SERVICE_ROLE || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
	if (!supabaseUrl || !serviceKey) {
		throw new Error('Supabase env not configured')
	}
	return createClient(supabaseUrl, serviceKey)
}

export function createBrowserSupabaseClient(): SupabaseClient {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error('Supabase env not configured')
	}
	return createClient(supabaseUrl, supabaseAnonKey)
}
