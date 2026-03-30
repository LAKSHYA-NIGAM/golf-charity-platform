const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const isConfigured = supabaseUrl
  && supabaseKey
  && !supabaseUrl.includes('your-project-ref')
  && supabaseKey !== 'your-service-role-key-here'

if (!isConfigured) {
  console.warn('\n⚠️  Supabase credentials not configured — running in DEMO mode')
  console.warn('   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env\n')
}

const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null

module.exports = { supabase, isConfigured }
