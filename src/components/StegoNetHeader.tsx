import { Shield, Eye, Lock } from "lucide-react";

const StegoNetHeader = () => {
  return (
    <header className="relative overflow-hidden   ">
      {/* Background grid effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-rose-100" />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="relative">
            <Shield className="w-12 h-12 text-red-600 animate-pulse" />
            <div className="absolute inset-0 blur-xl bg-red-500 opacity-30" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-red-600 via-rose-500 to-red-700 bg-clip-text text-transparent matrix-text">
            StegoNet
          </h1>
        </div>
        
        <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
          Adaptive Steganography Messaging System
        </p>
        
        <div className="flex items-center justify-center gap-8 text-sm text-red-600">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>AES-256 Encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>LSB Steganography</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>SHA-256 Integrity</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default StegoNetHeader;
