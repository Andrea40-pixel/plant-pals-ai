
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, diseaseInfo } = await req.json();

    const systemMessage = `You are a plant disease expert assistant. Current plant analysis: ${JSON.stringify(diseaseInfo)}. 
    
    For any questions, provide detailed information about:
    1. Disease identification and symptoms
    2. Prevention methods
    3. Treatment options (both chemical and organic)
    4. Long-term care recommendations
    
    Be specific and practical in your advice. If you're not sure about something, say so.
    Focus on actionable steps that plant owners can take.`;

    console.log('Sending request to Deepseek API...');
    
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('DEEPSEEK_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemMessage },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    console.log('Deepseek API response received');

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to get chat response');
    }

    return new Response(
      JSON.stringify({ response: data.choices[0].message.content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Chat function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
