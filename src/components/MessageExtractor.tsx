import { useState } from 'react';
import { Eye, EyeOff, Download, Shield, Copy, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';

interface MessageExtractorProps {
  extractedMessage: string;
  password: string;
  setPassword: (password: string) => void;
  onExtract: () => void;
  isProcessing: boolean;
  disabled?: boolean;
  integrityStatus?: {
    isValid: boolean;
    hash: string;
  };
}

const MessageExtractor = ({
  extractedMessage,
  password,
  setPassword,
  onExtract,
  isProcessing,
  disabled = false,
  integrityStatus
}: MessageExtractorProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showMessage, setShowMessage] = useState(true);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(extractedMessage);
      toast({
        title: "Message Copied",
        description: "The decrypted message has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy message to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadMessage = () => {
    const blob = new Blob([extractedMessage], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stegonet-message-${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Message Downloaded",
      description: "The decrypted message has been saved to your device.",
    });
  };

  return (
    <Card className="border-red-200 bg-white rounded-[30px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <Shield className="w-5 h-5" />
          Message Extraction
        </CardTitle>
        <CardDescription className="text-gray-600">
          Extract and decrypt the hidden message from your image
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Password Input */}
        <div className="space-y-2">
          <Label htmlFor="extract-password" className="text-sm font-medium text-gray-700">
            Decryption Password
          </Label>
          <div className="relative">
            <Input
              id="extract-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter the password used for encryption"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={disabled || isProcessing}
              className="pr-10 bg-white border-red-200 focus:border-red-400 font-mono"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={disabled || isProcessing}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
            </Button>
          </div>
        </div>

        {/* Extract Button */}
        <Button
          onClick={onExtract}
          disabled={password.length < 8 || disabled || isProcessing}
          size="lg"
          className={`w-full font-mono ${
            isProcessing 
              ? 'bg-gray-400 hover:bg-gray-400' 
              : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white'
          }`}
        >
          {isProcessing ? (
            <>
              <Shield className="w-4 h-4 animate-spin" />
              Extracting & Decrypting...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              Extract Hidden Message
            </>
          )}
        </Button>

        {/* Integrity Status */}
        {integrityStatus && (
          <Alert className={`border ${integrityStatus.isValid ? 'border-emerald-200 bg-emerald-50' : 'border-red-300 bg-red-50'}`}>
            {integrityStatus.isValid ? (
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={integrityStatus.isValid ? 'text-emerald-700' : 'text-red-700'}>
              <div className="flex items-center justify-between">
                <span>
                  {integrityStatus.isValid 
                    ? 'Message integrity verified ✓' 
                    : 'Message integrity check failed!'
                  }
                </span>
                <Badge variant="outline" className="font-mono text-xs border-current/50">
                  {integrityStatus.hash.slice(0, 12)}...
                </Badge>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Extracted Message Display */}
        {extractedMessage && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">Decrypted Message</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMessage(!showMessage)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {showMessage ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <Textarea
              value={showMessage ? extractedMessage : '••••••••••••••••••••••••••••••••••••'}
              readOnly
              className="min-h-[120px] bg-gray-50 border-emerald-200 font-mono text-sm resize-none"
            />
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyMessage}
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Copy className="w-4 h-4" />
                Copy Message
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadMessage}
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Download className="w-4 h-4" />
                Download as Text
              </Button>
            </div>
            
            <div className="text-xs text-gray-500">
              Message length: {extractedMessage.length} characters • {new TextEncoder().encode(extractedMessage).length} bytes
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MessageExtractor;
