import { useState, useCallback } from 'react';
import { Image, Download, RotateCcw, FileImage } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

import StegoNetHeader from '@/components/StegoNetHeader';
import FileUploadZone from '@/components/FileUploadZone';
import MessageInput from '@/components/MessageInput';
import MessageExtractor from '@/components/MessageExtractor';
import CryptoStatus, { CryptoStatusType } from '@/components/CryptoStatus';

import { encryptMessage, decryptMessage } from '@/lib/crypto';
import { embedDataInImage, extractDataFromImage } from '@/lib/steganography';

const StegoNet = () => {
  // State for embedding workflow
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [modifiedImageBlob, setModifiedImageBlob] = useState<Blob | null>(null);
  
  // State for extraction workflow
  const [extractImage, setExtractImage] = useState<File | null>(null);
  const [extractPassword, setExtractPassword] = useState('');
  const [extractedMessage, setExtractedMessage] = useState('');
  
  // Processing states
  const [status, setStatus] = useState<CryptoStatusType>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [stats, setStats] = useState<any>(null);
  
  // Integrity verification
  const [integrityStatus, setIntegrityStatus] = useState<{
    isValid: boolean;
    hash: string;
  } | null>(null);

  // Reset all state
  const handleReset = useCallback(() => {
    setSelectedImage(null);
    setMessage('');
    setPassword('');
    setModifiedImageBlob(null);
    setExtractImage(null);
    setExtractPassword('');
    setExtractedMessage('');
    setStatus('idle');
    setProgress(0);
    setStats(null);
    setIntegrityStatus(null);
  }, []);

  // Embed message workflow
  const handleEmbedMessage = useCallback(async () => {
    if (!selectedImage || !message.trim() || !password) {
      toast({
        title: "Missing Information",
        description: "Please select an image, enter a message, and provide a password.",
        variant: "destructive",
      });
      return;
    }

    try {
      setStatus('encrypting');
      setProgress(20);
      
      // Encrypt the message
      const encryptionResult = await encryptMessage(message, password);
      
      setStatus('embedding');
      setProgress(60);
      
      // Embed encrypted data into image
      const stegoResult = await embedDataInImage(selectedImage, encryptionResult, password);
      
      if (stegoResult.success && stegoResult.modifiedImageBlob) {
        setModifiedImageBlob(stegoResult.modifiedImageBlob);
        setStats(stegoResult.stats);
        setStatus('success');
        setProgress(100);
        
        toast({
          title: "Message Embedded Successfully!",
          description: "Your secret message has been hidden in the image.",
        });
      } else {
        throw new Error(stegoResult.error || 'Embedding failed');
      }
      
    } catch (error) {
      console.error('Embed error:', error);
      setStatus('error');
      toast({
        title: "Embedding Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    }
  }, [selectedImage, message, password]);

  // Extract message workflow
  const handleExtractMessage = useCallback(async () => {
    if (!extractImage || !extractPassword) {
      toast({
        title: "Missing Information",
        description: "Please select an image and provide the decryption password.",
        variant: "destructive",
      });
      return;
    }

    try {
      setStatus('extracting');
      setProgress(30);
      
      // Extract encrypted data from image
      const extractionResult = await extractDataFromImage(extractImage, extractPassword);
      
      if (!extractionResult.success || !extractionResult.encryptedData) {
        throw new Error(extractionResult.error || 'No hidden data found in image');
      }
      
      setStatus('decrypting');
      setProgress(70);
      
      // Decrypt the extracted message
      const decryptionResult = await decryptMessage(
        extractionResult.encryptedData,
        extractionResult.iv!,
        extractionResult.salt!,
        extractPassword,
        extractionResult.hash!
      );
      
      if (decryptionResult.decryptedMessage) {
        setExtractedMessage(decryptionResult.decryptedMessage);
        setIntegrityStatus({
          isValid: decryptionResult.isValid,
          hash: decryptionResult.hash
        });
        
        setStatus(decryptionResult.isValid ? 'verified' : 'success');
        setProgress(100);
        
        toast({
          title: decryptionResult.isValid ? "Message Verified!" : "Message Extracted",
          description: decryptionResult.isValid 
            ? "Message integrity verified successfully." 
            : "Message extracted but integrity check failed.",
          variant: decryptionResult.isValid ? "default" : "destructive",
        });
      } else {
        throw new Error('Decryption failed - incorrect password or corrupted data');
      }
      
    } catch (error) {
      console.error('Extract error:', error);
      setStatus('error');
      setIntegrityStatus(null);
      toast({
        title: "Extraction Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    }
  }, [extractImage, extractPassword]);

  // Download modified image
  const handleDownloadImage = useCallback(() => {
    if (!modifiedImageBlob) return;
    
    const url = URL.createObjectURL(modifiedImageBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stegonet-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Image Downloaded",
      description: "Your steganographic image has been saved to your device.",
    });
  }, [modifiedImageBlob]);

  const isProcessing = ['encrypting', 'embedding', 'extracting', 'decrypting'].includes(status);

  return (
    <div className="min-h-screen bg-white">
      <StegoNetHeader />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Status Display */}
        <CryptoStatus 
          status={status} 
          progress={isProcessing ? progress : undefined}
          stats={stats}
        />

        <Tabs defaultValue="embed" className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-white border border-red-200 shadow-sm rounded-[50px]">
              <TabsTrigger 
                value="embed" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 hover:text-red-600 rounded-[50px]"
              >
                Embed Message
              </TabsTrigger>
              <TabsTrigger 
                value="extract" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 hover:text-red-600 rounded-[50px]"
              >
                Extract Message
              </TabsTrigger>
            </TabsList>
            
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isProcessing}
              className="border-red-300 text-red-600 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-400 disabled:opacity-50 rounded-[50px]"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
          
          {/* Embed Message Tab */}
          <TabsContent value="embed" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Image Upload Section */}
              <div className="space-y-4">
                <FileUploadZone
                  onFileSelect={setSelectedImage}
                  accept="image/*"
                  maxSize={10 * 1024 * 1024}
                  title="Select Cover Image"
                  description="Choose an image to hide your message in"
                  icon={<Image className="w-12 h-12" />}
                />
                
                {selectedImage && (
                  <div className="text-center p-4 bg-gradient-to-br from-white to-red-50 rounded-lg border border-red-200 shadow-sm">
                    <div className="text-sm font-mono text-red-700 font-semibold">
                      {selectedImage.name}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                )}
                
                {modifiedImageBlob && (
                  <Button
                    size="lg"
                    onClick={handleDownloadImage}
                    className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Steganographic Image
                  </Button>
                )}
              </div>
              
              {/* Message Input */}
              <MessageInput
                message={message}
                setMessage={setMessage}
                password={password}
                setPassword={setPassword}
                onEmbed={handleEmbedMessage}
                isProcessing={isProcessing}
                disabled={!selectedImage}
              />
            </div>
          </TabsContent>
          
          {/* Extract Message Tab */}
          <TabsContent value="extract" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Image Upload for Extraction */}
              <div className="space-y-4">
                <FileUploadZone
                  onFileSelect={setExtractImage}
                  accept="image/*"
                  maxSize={10 * 1024 * 1024}
                  title="Select Steganographic Image"
                  description="Choose the image containing hidden message"
                  icon={<FileImage className="w-12 h-12" />}
                />
                
                {extractImage && (
                  <div className="text-center p-4 bg-gradient-to-br from-white to-red-50 rounded-lg border border-red-200 shadow-sm">
                    <div className="text-sm font-mono text-red-700 font-semibold">
                      {extractImage.name}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {(extractImage.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                )}
              </div>
              
              {/* Message Extractor */}
              <MessageExtractor
                extractedMessage={extractedMessage}
                password={extractPassword}
                setPassword={setExtractPassword}
                onExtract={handleExtractMessage}
                isProcessing={isProcessing}
                disabled={!extractImage}
                integrityStatus={integrityStatus}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StegoNet;
