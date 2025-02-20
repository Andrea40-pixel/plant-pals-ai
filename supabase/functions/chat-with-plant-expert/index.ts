
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to generate responses based on keywords
function generateResponse(query: string, diseaseInfo: any) {
  query = query.toLowerCase();
  
  // If there's disease information available
  if (diseaseInfo?.diseases?.[0]) {
    const disease = diseaseInfo.diseases[0];

    if (query.includes("treatment") || query.includes("cure") || query.includes("fix")) {
      return `For ${disease.name}, here are some treatment options:\n\n` +
        `Chemical treatments: ${disease.treatment.chemical.join(", ")}\n\n` +
        `Biological treatments: ${disease.treatment.biological.join(", ")}`;
    }
    
    if (query.includes("prevent") || query.includes("stop") || query.includes("avoid")) {
      return `To prevent ${disease.name}, try these methods:\n${disease.treatment.prevention.join("\n")}`;
    }
    
    if (query.includes("symptoms") || query.includes("signs") || query.includes("look")) {
      return `${disease.name} has been detected with ${Math.round(disease.probability * 100)}% confidence. This condition typically affects plant health and growth. I recommend following the prevention and treatment methods provided in the analysis.`;
    }
  }

  // General responses when no specific disease info or query doesn't match
  if (query.includes("water") || query.includes("watering")) {
    return "General watering tips:\n- Water deeply but infrequently\n- Check soil moisture before watering\n- Water at the base of the plant\n- Avoid overwatering which can lead to root problems";
  }
  
  if (query.includes("fertilizer") || query.includes("feed")) {
    return "General fertilizing tips:\n- Use balanced fertilizer for most plants\n- Don't over-fertilize\n- Follow package instructions\n- Fertilize during growing season";
  }
  
  if (query.includes("sunlight") || query.includes("light")) {
    return "General lighting tips:\n- Most plants need 6-8 hours of sunlight\n- Protect from intense afternoon sun\n- Rotate plants regularly\n- Watch for signs of too much/too little light";
  }

  // Default response
  return "I can help you with:\n- Treatment options\n- Prevention methods\n- Watering advice\n- Fertilizing tips\n- Lighting requirements\n\nPlease ask specific questions about these topics!";
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { messages, diseaseInfo } = await req.json()
    const latestMessage = messages[messages.length - 1].content
    
    const response = generateResponse(latestMessage, diseaseInfo)

    return new Response(
      JSON.stringify({ response }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Chat function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
