
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const diseaseDatabase = {
  "Tomato Late Blight": {
    prevention: [
      "Ensure good air circulation between plants",
      "Water at the base of plants, avoid wetting leaves",
      "Remove infected leaves and destroy them",
      "Plant resistant varieties"
    ],
    chemical: [
      "Apply copper-based fungicides",
      "Use preventative fungicide sprays",
      "Rotate between different fungicide types"
    ],
    biological: [
      "Apply beneficial bacteria like Bacillus subtilis",
      "Use organic copper sprays",
      "Maintain healthy soil with compost"
    ]
  },
  "Powdery Mildew": {
    prevention: [
      "Space plants properly for air circulation",
      "Avoid overhead watering",
      "Remove infected plant debris",
      "Choose resistant varieties"
    ],
    chemical: [
      "Apply sulfur-based fungicides",
      "Use potassium bicarbonate sprays",
      "Apply neem oil solutions"
    ],
    biological: [
      "Use milk spray solution",
      "Apply compost tea",
      "Introduce beneficial microorganisms"
    ]
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileData } = await req.json();

    if (!fileData) {
      throw new Error('No file data provided');
    }

    console.log('Processing image...');

    const response = await fetch('https://api.plant.id/v2/health_assessment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': Deno.env.get('PLANT_API_KEY') || '',
      },
      body: JSON.stringify({
        images: [fileData],
        modifiers: ["similar_images"],
        disease_details: ["description", "treatment"],
      }),
    });

    const data = await response.json();
    console.log('API Response received');

    if (!response.ok) {
      throw new Error(data.message || 'Failed to analyze image');
    }

    const diseases = data.health_assessment.diseases.map((disease: any) => {
      const diseaseName = disease.name;
      const defaultTreatment = {
        prevention: [
          "Ensure proper plant spacing",
          "Maintain good air circulation",
          "Water at the base of plants",
          "Remove infected plant material"
        ],
        chemical: [
          "Apply appropriate fungicides",
          "Use disease-specific treatments",
          "Follow local guidelines"
        ],
        biological: [
          "Use organic amendments",
          "Introduce beneficial organisms",
          "Apply compost tea"
        ]
      };

      return {
        name: diseaseName,
        probability: disease.probability,
        treatment: diseaseDatabase[diseaseName] || defaultTreatment
      };
    });

    diseases.sort((a, b) => b.probability - a.probability);
    const result = {
      diseases: diseases.slice(0, 3)
    };

    console.log('Analysis complete');

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
