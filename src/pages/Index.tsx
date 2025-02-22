
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '@/components/ImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Leaf, AlertCircle, Check } from 'lucide-react';
import ChatInterface from '@/components/ChatInterface';

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
      const base64File = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
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

      // Filter results to only include high confidence predictions (above 70%)
      const highConfidenceResults = {
        diseases: data.result.diseases.filter(
          (disease: any) => disease.probability > 0.7
        )
      };

      setDiseaseResult(highConfidenceResults);
      
      if (highConfidenceResults.diseases.length > 0) {
        toast({
          title: "Analysis Complete",
          description: "We've detected potential issues with high confidence.",
        });
      } else {
        toast({
          title: "Analysis Complete",
          description: "No high-confidence disease detections. Your plant might be healthy!",
          variant: "default",
        });
      }
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
    <div className="min-h-screen bg-[#F6F7F3] dark:bg-gray-900">
      <div className="container max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Leaf className="h-12 w-12 text-green-600 mr-3" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              Plant Disease Detection
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Upload a photo of your plant and our AI will analyze it for potential diseases and provide treatment recommendations
          </p>
        </header>

        <div className="max-w-3xl mx-auto space-y-8">
          <ImageUpload onImageSelect={handleImageSelect} />
          
          {isAnalyzing && (
            <div className="flex items-center justify-center gap-3 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg animate-pulse">
              <Loader2 className="h-6 w-6 text-green-600 animate-spin" />
              <span className="text-lg font-medium text-gray-700 dark:text-gray-200">
                Analyzing your plant...
              </span>
            </div>
          )}
          
          {diseaseResult && !isAnalyzing && diseaseResult.diseases.length > 0 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-6 w-6 text-amber-500" />
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                      High Confidence Results
                    </h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    We've detected the following conditions with high confidence (>70%):
                  </p>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {diseaseResult.diseases.map((disease, index) => (
                    <div key={index} className="p-6 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-medium text-red-600 dark:text-red-400">
                            {disease.name}
                          </h3>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500">
                            {Math.round(disease.probability * 100)}% Confidence
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid gap-6 md:grid-cols-3">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
                            <Check className="h-5 w-5" />
                            <h4 className="font-medium">Prevention</h4>
                          </div>
                          <ul className="space-y-2">
                            {disease.treatment.prevention.map((tip, i) => (
                              <li key={i} className="text-sm text-gray-600 dark:text-gray-300 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-green-600 dark:before:text-green-500">
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-500">
                            <Check className="h-5 w-5" />
                            <h4 className="font-medium">Chemical Treatment</h4>
                          </div>
                          <ul className="space-y-2">
                            {disease.treatment.chemical.map((tip, i) => (
                              <li key={i} className="text-sm text-gray-600 dark:text-gray-300 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-blue-600 dark:before:text-blue-500">
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-500">
                            <Check className="h-5 w-5" />
                            <h4 className="font-medium">Biological Treatment</h4>
                          </div>
                          <ul className="space-y-2">
                            {disease.treatment.biological.map((tip, i) => (
                              <li key={i} className="text-sm text-gray-600 dark:text-gray-300 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-purple-600 dark:before:text-purple-500">
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {diseaseResult && !isAnalyzing && diseaseResult.diseases.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 text-center">
              <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">
                No High Confidence Detections
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We couldn't detect any plant diseases with high confidence. Your plant might be healthy, but feel free to ask our chatbot for general plant care advice!
              </p>
            </div>
          )}
        </div>
      </div>
      
      <ChatInterface diseaseInfo={diseaseResult} />
    </div>
  );
};

export default Index;
