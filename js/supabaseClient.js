// Supabase client — shared across every page that needs auth or profile data.
// The anon key is safe to expose client-side; Row Level Security (see supabase/schema.sql)
// is what actually restricts access to each user's own row.
//
// Requires the Supabase UMD script to be loaded first, e.g.:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
// <script src="/js/supabaseClient.js"></script>

const SUPABASE_URL = "https://akhgbqwpknxfnqhhpfdb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_WtTY8M2RwLlM8gQQGG61-g_LnRfaKRh";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
