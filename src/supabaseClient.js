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
// update 16 at Kam 09 Apr 2026 10:39:37 WIB
// update 36 at Kam 09 Apr 2026 13:10:30 WIB
// update 6 at Sab 11 Apr 2026 14:49:18 WIB
// update 124 at Min 12 Apr 2026 05:55:54 WIB
// update 147 at Min 12 Apr 2026 08:51:39 WIB
// update 19 at Min 12 Apr 2026 20:09:17 WIB
// update 90 at Sen 13 Apr 2026 17:55:26 WIB
// update 20 at Rab 15 Apr 2026 10:46:08 WIB
// update 29 at Rab 15 Apr 2026 11:44:37 WIB
// update 30 at Rab 15 Apr 2026 11:49:52 WIB
// update 69 at Kam 16 Apr 2026 05:54:24 WIB
// update 110 at Kam 16 Apr 2026 09:59:23 WIB
// update 29 at Kam 16 Apr 2026 17:30:55 WIB
// update 4 at Kam 16 Apr 2026 18:47:26 WIB
// update 23 at Kam 16 Apr 2026 20:37:46 WIB
// update 40 at Kam 16 Apr 2026 22:27:00 WIB
// update 68 at Jum 17 Apr 2026 01:15:22 WIB
// update 89 at Jum 17 Apr 2026 03:11:24 WIB
// update 10 at Jum 17 Apr 2026 12:20:13 WIB
// update 3 at Sab 18 Apr 2026 08:55:21 WIB
// update 7 at Sab 18 Apr 2026 09:22:29 WIB
// update 9 at Sab 18 Apr 2026 10:34:22 WIB
// update 39 at Sab 18 Apr 2026 13:45:10 WIB
// update 57 at Sab 18 Apr 2026 15:50:51 WIB
// update 101 at Sab 18 Apr 2026 20:31:18 WIB
// update 158 at Min 19 Apr 2026 02:41:44 WIB
// update 190 at Min 19 Apr 2026 06:04:52 WIB
// update 211 at Min 19 Apr 2026 08:21:04 WIB
// update 229 at Min 19 Apr 2026 10:10:44 WIB
// update 243 at Min 19 Apr 2026 11:39:09 WIB
// update 264 at Min 19 Apr 2026 13:50:07 WIB
// update 267 at Min 19 Apr 2026 14:09:31 WIB
