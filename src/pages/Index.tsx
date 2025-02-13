
import { useState } from 'react';
import ImageUpload from '@/components/ImageUpload';
import Chat from '@/components/Chat';

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    // Here we'll later implement the AI processing logic
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
            {selectedImage && (
              <div className="animate-fadeIn">
                {/* Results will be displayed here */}
              </div>
            )}
          </div>
          <Chat />
        </div>
      </div>
    </div>
  );
};

export default Index;
