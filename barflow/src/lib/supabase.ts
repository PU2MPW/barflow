import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sb-project-4f5a7d7a-8b2c-4d3e-9f5a-1b2c3d4e5f6g.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_AKUKkyr37T76L5ZDodwgew_peLkMgpL';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);