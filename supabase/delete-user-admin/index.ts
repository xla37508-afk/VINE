// VINE/supabase/functions/delete-user-admin/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

// Định nghĩa CORS Headers cơ bản
const corsHeaders = {
    'Access-Control-Allow-Origin': '*', 
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, Content-Type',
}

// Fixed: Explicitly typed 'req' as Request and used Deno types
serve(async (req: Request) => { 
    // 1. Xử lý yêu cầu OPTIONS (Preflight)
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204, // No Content
            headers: corsHeaders,
        })
    }

    // 2. Xử lý yêu cầu chính (POST)
    try {
        const { userId } = await req.json();

        // Khởi tạo Supabase Client bằng SERVICE_ROLE_KEY
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '', 
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        );

        // Xóa người dùng
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (error) {
            console.error("Supabase Admin Error:", error);
            return new Response(JSON.stringify({ error: error.message }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json', ...corsHeaders } 
            });
        }

        // Phản hồi thành công
        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });

    } catch (e) {
        // Fixed: Safely handle unknown error type
        const errorMessage = e instanceof Error ? e.message : String(e);
        return new Response(JSON.stringify({ error: errorMessage }), {
             status: 400,
             headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    }
});