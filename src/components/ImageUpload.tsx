
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect }) => {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      onImageSelect(file);
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: false
  });

  const clearImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  };

  return (
    <Card className="p-6 w-full max-w-xl mx-auto bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg animate-fadeIn">
      <div
        {...getRootProps()}
        className={`relative p-8 border-2 border-dashed rounded-lg transition-colors duration-300 ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
        }`}
      >
        <input {...getInputProps()} />
        {!preview ? (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm text-gray-600">
              Drag & drop an image here, or click to select
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Supports JPG, JPEG, PNG
            </p>
          </div>
        ) : (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-h-[400px] w-full object-contain rounded-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={(e) => {
                e.stopPropagation();
                clearImage();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ImageUpload;
