
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '@/components/ImageUpload';
import Chat from '@/components/Chat';
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
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('detect-plant-disease', {
        body: formData,
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

        <div className="grid gap-8 md:grid-cols-2 items-start">
          <div className="space-y-8">
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
                {diseaseResult.diseases.length > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Detected Issue:</h3>
                      <p className="text-accent">{diseaseResult.diseases[0].name}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Confidence:</h3>
                      <p>{Math.round(diseaseResult.diseases[0].probability * 100)}%</p>
                    </div>
                    {diseaseResult.diseases[0].treatment && (
                      <div>
                        <h3 className="font-medium">Treatment Suggestions:</h3>
                        <ul className="list-disc list-inside space-y-2">
                          {diseaseResult.diseases[0].treatment.prevention?.map((tip, index) => (
                            <li key={index} className="text-sm">{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p>No diseases detected. Your plant appears healthy!</p>
                )}
              </div>
            )}
          </div>
          <Chat diseaseResult={diseaseResult} />
        </div>
      </div>
    </div>
  );
};

export default Index;
