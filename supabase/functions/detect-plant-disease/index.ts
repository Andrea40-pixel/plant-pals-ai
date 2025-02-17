
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { pipeline } from "https://esm.sh/@huggingface/transformers"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { fileData } = await req.json()

    if (!fileData) {
      throw new Error('No file data provided')
    }

    // Initialize the image classification pipeline
    const classifier = await pipeline(
      "image-classification",
      "merve/plant-disease-detection",
      { device: "cpu" }
    );

    // Convert base64 to image URL for the model
    const imageUrl = `data:image/jpeg;base64,${fileData}`;
    
    // Perform disease detection
    const predictions = await classifier(imageUrl);
    
    // Process the predictions
    const diseases = predictions.map((pred: any) => ({
      name: pred.label,
      probability: pred.score,
      treatment: {
        prevention: [
          "Ensure proper plant spacing for good air circulation",
          "Water at the base of plants to keep leaves dry",
          "Remove and destroy infected plant debris",
          "Use disease-resistant varieties when possible"
        ],
        chemical: [
          "Apply appropriate fungicides as recommended",
          "Use copper-based sprays for bacterial infections",
          "Follow local agricultural extension service recommendations"
        ],
        biological: [
          "Introduce beneficial microorganisms to the soil",
          "Use organic composts to boost plant immunity",
          "Practice crop rotation to prevent disease buildup"
        ]
      }
    }));

    // Sort by probability
    diseases.sort((a, b) => b.probability - a.probability);

    const result = {
      diseases: diseases.slice(0, 3) // Return top 3 predictions
    };

    console.log('Disease detection results:', result);

    return new Response(
      JSON.stringify({ 
        success: true,
        result
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});
