import { createClient } from '@supabase/supabase-js';
import { AppConfig, UserSession } from '@stacks/connect';

// --- SUPABASE CONFIG ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- STACKS SESSION CONFIG (Baru Ditambahkan) ---
const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });
// update 17 at Sel 31 Mar 2026 16:29:32 WIB
// update 37 at Sel 31 Mar 2026 17:47:12 WIB
// update 135 at Rab 01 Apr 2026 00:32:40 WIB
// update 65 at Sab 04 Apr 2026 16:49:30 WIB
// update 85 at Sab 04 Apr 2026 19:21:57 WIB
