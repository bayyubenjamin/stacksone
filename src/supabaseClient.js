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
// update 120 at Sab 04 Apr 2026 23:57:25 WIB
// update 130 at Min 05 Apr 2026 01:07:07 WIB
// update 131 at Min 05 Apr 2026 01:13:54 WIB
// update 36 at Min 05 Apr 2026 17:35:11 WIB
// update 39 at Min 05 Apr 2026 17:58:16 WIB
// update 46 at Min 05 Apr 2026 18:49:24 WIB
// update 100 at Sen 06 Apr 2026 01:22:58 WIB
// update 142 at Sen 06 Apr 2026 06:41:55 WIB
// update 23 at Sen 06 Apr 2026 20:52:15 WIB
// update 39 at Sen 06 Apr 2026 22:55:04 WIB
// update 18 at Rab 08 Apr 2026 12:57:33 WIB
// update 116 at Kam 09 Apr 2026 01:00:01 WIB
