
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { pipeline } from "https://esm.sh/@huggingface/transformers"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

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

    console.log('Initializing classification pipeline...');

    // Initialize the image classification pipeline with a public model
    const classifier = await pipeline(
      "image-classification",
      "onnx-community/mobilenetv4_conv_small.e2400_r224_in1k",
      { 
        quantized: false,
        progress_callback: (x: any) => console.log('Loading model:', x)
      }
    );

    console.log('Model loaded successfully');

    // Convert base64 to image URL for the model
    const imageUrl = `data:image/jpeg;base64,${fileData}`;
    
    // Perform classification
    console.log('Starting image classification...');
    const predictions = await classifier(imageUrl);
    console.log('Classification complete:', predictions);
    
    // Map the predictions to plant conditions
    const diseases = predictions
      .filter((pred: any) => pred.score > 0.1) // Filter out low confidence predictions
      .map((pred: any) => ({
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

    const result = {
      diseases: diseases.slice(0, 3) // Return top 3 predictions
    };

    console.log('Final results:', result);

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
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});
