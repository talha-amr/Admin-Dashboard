import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { email, organizationId } = await req.json()

    if (!email || !organizationId) {
      return new Response(JSON.stringify({ message: 'Missing parameters' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { data: { user } } = await supabaseClient.auth.getUser()
    const { data: org } = await supabaseClient
      .from('organizations')
      .select('created_by')
      .eq('id', organizationId)
      .single()

    if (!org || org.created_by !== user?.id) {
      return new Response(JSON.stringify({ message: 'Unauthorized: Only the organization administrator can dispatch invites.' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { data, error } = await supabaseClient
      .from('organization_members')
      .insert({
        organization_id: organizationId,
        email: email,
        status: 'invited'
      })

    if (error) {
      if (error.code === '23505') {
        return new Response(JSON.stringify({ message: 'This email address has already been invited or is an active member.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      throw error
    }

    return new Response(JSON.stringify({ success: true, data }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })

  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})