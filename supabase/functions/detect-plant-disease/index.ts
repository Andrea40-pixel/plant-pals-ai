
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { fileData, fileName, fileType } = await req.json()

    if (!fileData || !fileName) {
      throw new Error('No file data provided')
    }

    const apiKey = Deno.env.get('PLANT_API_KEY')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Convert base64 to Blob
    const byteString = atob(fileData);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    
    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    
    const blob = new Blob([uint8Array], { type: fileType });

    // Upload to Supabase Storage
    const fileExt = fileName.split('.').pop()
    const filePath = `${crypto.randomUUID()}.${fileExt}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('plant_images')
      .upload(filePath, blob)

    if (uploadError) {
      throw new Error('Failed to upload image')
    }

    // Get public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('plant_images')
      .getPublicUrl(filePath)

    // Call Plant.id API
    const plantIdResponse = await fetch('https://api.plant.id/v2/health_assessment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey!
      },
      body: JSON.stringify({
        images: [publicUrl],
        modifiers: ["similar_images"],
        disease_details: ["cause", "common_names", "classification", "treatment", "url"],
      })
    })

    const plantData = await plantIdResponse.json()
    
    // Store results in database
    const { error: dbError } = await supabase
      .from('plant_disease_results')
      .insert({
        image_path: filePath,
        disease_name: plantData.health_assessment.diseases[0]?.name || null,
        confidence: plantData.health_assessment.diseases[0]?.probability || null
      })

    if (dbError) {
      throw new Error('Failed to save results')
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        result: plantData.health_assessment,
        imagePath: filePath
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
