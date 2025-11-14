// lib/supabaseServerClient.ts
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Optional: kasih error biar ketahuan kalau env belum di-set
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum di-set di .env"
  );
}

// Client khusus di server (API routes)
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false, // di API route tidak perlu session di local storage
  },
});
