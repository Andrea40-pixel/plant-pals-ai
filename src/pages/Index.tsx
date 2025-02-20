
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '@/components/ImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface DiseaseResult {
  diseases: Array<{
    name: string;
    probability: number;
    treatment: {
      prevention: string[];
      chemical: string[];
      biological: string[];
    };
  }>;
}

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diseaseResult, setDiseaseResult] = useState<DiseaseResult | null>(null);
  const { toast } = useToast();

  const handleImageSelect = async (file: File) => {
    setSelectedImage(file);
    setIsAnalyzing(true);
    
    try {
      // Convert file to base64
      const base64File = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            // Remove data URL prefix
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke('detect-plant-disease', {
        body: {
          fileData: base64File,
          fileName: file.name,
          fileType: file.type
        }
      });

      if (error) throw error;

      setDiseaseResult(data.result);
      
      toast({
        title: "Analysis Complete",
        description: "We've analyzed your plant image and detected potential issues.",
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to analyze the image. Please try again.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F7F3] to-[#CAD2C5]">
      <div className="container py-8 px-4">
        <header className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl font-bold text-accent mb-4">Plant Disease Detection</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload a photo of your plant and our AI will help identify any potential diseases
          </p>
        </header>

        <div className="max-w-2xl mx-auto space-y-8">
          <ImageUpload onImageSelect={handleImageSelect} />
          
          {isAnalyzing && (
            <div className="flex items-center justify-center gap-2 text-accent animate-fadeIn">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Analyzing your plant...</span>
            </div>
          )}
          
          {diseaseResult && !isAnalyzing && (
            <div className="animate-fadeIn bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
              {diseaseResult.diseases.map((disease, index) => (
                <div key={index} className="mb-6 last:mb-0 p-4 border border-gray-200 rounded-lg">
                  <div className="mb-3">
                    <h3 className="font-medium">Detected Issue:</h3>
                    <p className="text-accent">{disease.name}</p>
                    <p className="text-sm text-gray-600">
                      Confidence: {Math.round(disease.probability * 100)}%
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm">Prevention Methods:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {disease.treatment.prevention.map((tip, i) => (
                          <li key={i} className="text-sm text-gray-700">{tip}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm">Chemical Treatment:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {disease.treatment.chemical.map((tip, i) => (
                          <li key={i} className="text-sm text-gray-700">{tip}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm">Biological Treatment:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {disease.treatment.biological.map((tip, i) => (
                          <li key={i} className="text-sm text-gray-700">{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
