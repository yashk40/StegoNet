import { Shield, CheckCircle, AlertTriangle, Clock, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export type CryptoStatusType = 'idle' | 'encrypting' | 'embedding' | 'success' | 'extracting' | 'decrypting' | 'verified' | 'error';

interface CryptoStatusProps {
  status: CryptoStatusType;
  message?: string;
  progress?: number;
  stats?: {
    dataEmbedded?: number;
    capacity?: number;
    utilizationPercent?: number;
    originalSize?: number;
  };
}

const statusConfig = {
  idle: {
    icon: Shield,
    color: 'text-gray-500',
    bg: 'bg-gray-100',
    label: 'Ready',
    description: 'System ready for operations'
  },
  encrypting: {
    icon: Lock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    label: 'Encrypting',
    description: 'Applying AES-256 encryption'
  },
  embedding: {
    icon: Shield,
    color: 'text-red-600',
    bg: 'bg-red-50',
    label: 'Embedding',
    description: 'Hiding data using LSB steganography'
  },
  extracting: {
    icon: Shield,
    color: 'text-red-600',
    bg: 'bg-red-50',
    label: 'Extracting',
    description: 'Reading hidden data from image'
  },
  decrypting: {
    icon: Lock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    label: 'Decrypting',
    description: 'Decrypting with AES-256'
  },
  success: {
    icon: CheckCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    label: 'Success',
    description: 'Operation completed successfully'
  },
  verified: {
    icon: CheckCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    label: 'Verified',
    description: 'Message integrity verified'
  },
  error: {
    icon: AlertTriangle,
    color: 'text-red-700',
    bg: 'bg-red-100',
    label: 'Error',
    description: 'Operation failed'
  }
};

const CryptoStatus = ({ status, message, progress, stats }: CryptoStatusProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;
  const isProcessing = ['encrypting', 'embedding', 'extracting', 'decrypting'].includes(status);

  return (
    <Card className="border-red-200 bg-white rounded-[30px]">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className={`relative p-3 rounded-full ${config.bg} border border-current/30`}>
            <Icon className={`w-6 h-6 ${config.color} ${isProcessing ? 'animate-spin' : ''}`} />
            {isProcessing && (
              <div className="absolute inset-0 rounded-full animate-pulse" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={`${config.color} border-current/50`}>
                {config.label}
              </Badge>
              {isProcessing && (
                <Clock className="w-4 h-4 text-gray-500 animate-spin" />
              )}
            </div>
            
            <p className="text-sm text-gray-600">
              {message || config.description}
            </p>
            
            {typeof progress !== 'undefined' && (
              <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-red-500 to-rose-600 h-1.5 rounded-full transition-all duration-300 relative overflow-hidden"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-red-100">
            {stats.dataEmbedded && (
              <div className="text-center">
                <div className="text-lg font-mono font-bold text-red-600">
                  {(stats.dataEmbedded / 1024).toFixed(1)}KB
                </div>
                <div className="text-xs text-gray-500">Embedded</div>
              </div>
            )}
            
            {stats.capacity && (
              <div className="text-center">
                <div className="text-lg font-mono font-bold text-emerald-600">
                  {(stats.capacity / 1024).toFixed(1)}KB
                </div>
                <div className="text-xs text-gray-500">Capacity</div>
              </div>
            )}
            
            {stats.utilizationPercent && (
              <div className="text-center">
                <div className="text-lg font-mono font-bold text-amber-600">
                  {stats.utilizationPercent.toFixed(2)}%
                </div>
                <div className="text-xs text-gray-500">Utilization</div>
              </div>
            )}
            
            {stats.originalSize && (
              <div className="text-center">
                <div className="text-lg font-mono font-bold text-gray-600">
                  {(stats.originalSize / 1024 / 1024).toFixed(1)}MB
                </div>
                <div className="text-xs text-gray-500">Image Size</div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CryptoStatus;
