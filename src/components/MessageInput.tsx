import { useState, useEffect } from 'react';
import { Eye, EyeOff, Hash, MessageSquare, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { generateHash } from '@/lib/crypto';

interface MessageInputProps {
  message: string;
  setMessage: (message: string) => void;
  password: string;
  setPassword: (password: string) => void;
  onEmbed: () => void;
  isProcessing: boolean;
  disabled?: boolean;
}

const MessageInput = ({
  message,
  setMessage,
  password,
  setPassword,
  onEmbed,
  isProcessing,
  disabled = false
}: MessageInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [messageHash, setMessageHash] = useState<string>('');

  // Calculate message statistics
  const messageBytes = new TextEncoder().encode(message).length;
  const isValidMessage = message.trim().length > 0;
  const isValidPassword = password.length >= 8;

  // Generate hash preview when message changes
  useEffect(() => {
    if (message.trim()) {
      generateHash(message).then(setMessageHash);
    } else {
      setMessageHash('');
    }
  }, [message]);

  return (
    <Card className="border-red-200 bg-white rounded-[30px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <MessageSquare className="w-5 h-5" />
          Secret Message
        </CardTitle>
        <CardDescription className="text-gray-600">
          Enter the message to hide and your encryption password
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Message Input */}
        <div className="space-y-2">
          <Label htmlFor="message" className="text-sm font-medium text-gray-700">
            Message to Hide
          </Label>
          <Textarea
            id="message"
            placeholder="Enter your secret message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={disabled || isProcessing}
            className="min-h-[120px] resize-none bg-gray-50 border-red-200 focus:border-red-400 font-mono text-sm"
          />
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{message.length} characters • {messageBytes} bytes</span>
            {messageHash && (
              <div className="flex items-center gap-1">
                <Hash className="w-3 h-3" />
                <span className="font-mono">{messageHash.slice(0, 8)}...</span>
              </div>
            )}
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
            Encryption Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter a strong password (min 8 characters)"
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
          
          {/* Password Strength Indicators */}
          <div className="flex gap-2">
            <Badge 
              variant="outline" 
              className={password.length >= 8 ? 'border-emerald-400 text-emerald-600 bg-emerald-50' : 'border-gray-300 text-gray-500'}
            >
              Length ≥8
            </Badge>
            <Badge 
              variant="outline" 
              className={/[A-Z]/.test(password) ? 'border-emerald-400 text-emerald-600 bg-emerald-50' : 'border-gray-300 text-gray-500'}
            >
              Uppercase
            </Badge>
            <Badge 
              variant="outline" 
              className={/[0-9]/.test(password) ? 'border-emerald-400 text-emerald-600 bg-emerald-50' : 'border-gray-300 text-gray-500'}
            >
              Numbers
            </Badge>
          </div>
        </div>

        {/* Embed Button */}
        <Button
          onClick={onEmbed}
          disabled={!isValidMessage || !isValidPassword || disabled || isProcessing}
          size="lg"
          className={`w-full font-mono ${
            isProcessing 
              ? 'bg-gray-400 hover:bg-gray-400' 
              : (!isValidMessage || !isValidPassword || disabled)
              ? 'bg-gray-300 hover:bg-gray-300 text-gray-500'
              : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white'
          }`}
        >
          {isProcessing ? (
            <>
              <Zap className="w-4 h-4 animate-spin" />
              Embedding Message...
            </>
          ) : (
            <>
              <MessageSquare className="w-4 h-4" />
              Embed Secret Message
            </>
          )}
        </Button>
        
        {/* Security Notice */}
        <div className="text-xs text-gray-600 p-3 bg-red-50 rounded border border-red-100">
          <div className="flex items-center gap-2 mb-1">
            <Hash className="w-3 h-3 text-red-500" />
            <span className="font-semibold text-red-600">Security Features</span>
          </div>
          <ul className="space-y-1 ml-5 list-disc">
            <li>AES-256-GCM encryption with random IV and salt</li>
            <li>SHA-256 hash for message integrity verification</li>
            <li>Pseudo-random LSB pixel selection</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default MessageInput;
