import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image, FileImage, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  accept: string;
  maxSize: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FileUploadZone = ({ 
  onFileSelect, 
  accept, 
  maxSize, 
  title, 
  description, 
  icon 
}: FileUploadZoneProps) => {
  const [error, setError] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError('');
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Invalid file type. Please select an image file.');
      } else {
        setError('File rejected. Please try again.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { [accept]: [] },
    maxSize,
    multiple: false,
  });

  return (
    <Card className="relative overflow-hidden bg-white transition-all duration-300 border-red-200" style={{ borderRadius:"30px"}}>

      <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-rose-100/30" />
      
      <div
        {...getRootProps()}
        className={`
          relative z-10 p-8 rounded-lg cursor-pointer
          transition-all duration-300 text-center
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            {isDragActive ? (
              <Upload className="w-12 h-12 text-red-600 animate-bounce" />
            ) : (
              <div className="text-red-600">{icon}</div>
            )}
            <div className="absolute inset-0 blur-xl bg-red-500 opacity-20" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">
              {title}
            </h3>
            <p className="text-gray-600">
              {isDragActive ? 'Drop your file here...' : description}
            </p>
            <p className="text-sm text-red-500">
              Max size: {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </div>
          
          {!isDragActive && (
            <div className="px-4 py-2 bg-gradient-to-r from-red-100 to-rose-100 border border-red-200 rounded-[30px]">
              <span className="text-sm font-mono text-red-700">
                Click to browse or drag & drop
              </span>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <Alert className="mt-4 border-red-300 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}
    </Card>
  );
};

export default FileUploadZone;
