// StegoNet Adaptive Steganography Engine
// LSB-based image steganography with dynamic multi-layer embedding

import { EncryptionResult, arrayToBase64, base64ToArray } from './crypto';

export interface StegoResult {
  success: boolean;
  modifiedImageBlob?: Blob;
  error?: string;
  stats?: {
    originalSize: number;
    dataEmbedded: number;
    capacity: number;
    utilizationPercent: number;
  };
}

export interface ExtractionResult {
  success: boolean;
  encryptedData?: Uint8Array;
  iv?: Uint8Array;
  salt?: Uint8Array;
  hash?: string;
  error?: string;
}

// Convert image to canvas for pixel manipulation
async function imageToCanvas(file: File): Promise<{canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      resolve({ canvas, ctx });
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

// Pseudo-random number generator for consistent pixel selection
class PRNG {
  private seed: number;
  
  constructor(seed: string) {
    // Convert string to numeric seed
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    this.seed = Math.abs(hash);
  }
  
  next(): number {
    // Linear congruential generator
    this.seed = (this.seed * 1664525 + 1013904223) % Math.pow(2, 32);
    return this.seed / Math.pow(2, 32);
  }
  
  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }
}

// Generate pseudo-random pixel positions for embedding
function generatePixelPositions(
  width: number, 
  height: number, 
  dataLength: number, 
  seed: string
): number[] {
  const totalPixels = width * height;
  const positions: number[] = [];
  const used = new Set<number>();
  const prng = new PRNG(seed);
  
  // We need positions for: length header (32 bits) + actual data
  const bitsNeeded = 32 + (dataLength * 8);
  
  if (bitsNeeded > totalPixels * 3) {
    throw new Error('Image too small for data payload');
  }
  
  while (positions.length < bitsNeeded) {
    const pos = prng.nextInt(totalPixels);
    if (!used.has(pos)) {
      used.add(pos);
      positions.push(pos);
    }
  }
  
  return positions;
}

// Embed bit into LSB of pixel channel
function embedBit(pixelValue: number, bit: number): number {
  return (pixelValue & 0xFE) | bit;
}

// Extract bit from LSB of pixel channel
function extractBit(pixelValue: number): number {
  return pixelValue & 1;
}

// Convert data to bit array
function dataToBits(data: Uint8Array): number[] {
  const bits: number[] = [];
  for (const byte of data) {
    for (let i = 7; i >= 0; i--) {
      bits.push((byte >> i) & 1);
    }
  }
  return bits;
}

// Convert bit array back to data
function bitsToData(bits: number[]): Uint8Array {
  const bytes = new Uint8Array(Math.ceil(bits.length / 8));
  for (let i = 0; i < bits.length; i++) {
    const byteIndex = Math.floor(i / 8);
    const bitIndex = 7 - (i % 8);
    if (bits[i]) {
      bytes[byteIndex] |= (1 << bitIndex);
    }
  }
  return bytes;
}

// Embed encrypted data into image using adaptive LSB steganography
export async function embedDataInImage(
  imageFile: File,
  encryptionResult: EncryptionResult,
  password: string
): Promise<StegoResult> {
  try {
    const { canvas, ctx } = await imageToCanvas(imageFile);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    // Create payload: [encrypted_data_length][encrypted_data][iv][salt][hash_length][hash]
    const encryptedDataLength = encryptionResult.encryptedData.length;
    const hashBytes = new TextEncoder().encode(encryptionResult.hash);
    const hashLength = hashBytes.length;
    
    // Build payload
    const payload = new Uint8Array(
      4 + encryptedDataLength + 12 + 16 + 4 + hashLength
    );
    
    let offset = 0;
    
    // Encrypted data length (4 bytes)
    new DataView(payload.buffer).setUint32(offset, encryptedDataLength);
    offset += 4;
    
    // Encrypted data
    payload.set(encryptionResult.encryptedData, offset);
    offset += encryptedDataLength;
    
    // IV (12 bytes)
    payload.set(encryptionResult.iv, offset);
    offset += 12;
    
    // Salt (16 bytes)
    payload.set(encryptionResult.salt, offset);
    offset += 16;
    
    // Hash length (4 bytes)
    new DataView(payload.buffer).setUint32(offset, hashLength);
    offset += 4;
    
    // Hash
    payload.set(hashBytes, offset);
    
    // Generate pseudo-random positions
    const positions = generatePixelPositions(
      canvas.width, 
      canvas.height, 
      payload.length, 
      password
    );
    
    // Convert payload to bits
    const payloadBits = dataToBits(payload);
    
    // Embed length header (32 bits) + payload bits
    const totalLength = payload.length;
    const lengthBits = dataToBits(new Uint8Array([
      (totalLength >> 24) & 0xFF,
      (totalLength >> 16) & 0xFF,
      (totalLength >> 8) & 0xFF,
      totalLength & 0xFF
    ]));
    
    const allBits = [...lengthBits, ...payloadBits];
    
    // Embed bits into pixels
    for (let i = 0; i < allBits.length; i++) {
      const pixelIndex = positions[i];
      const pixelStart = pixelIndex * 4;
      const channel = i % 3; // Use RGB channels, skip alpha
      
      pixels[pixelStart + channel] = embedBit(
        pixels[pixelStart + channel], 
        allBits[i]
      );
    }
    
    // Update canvas with modified pixels
    ctx.putImageData(imageData, 0, 0);
    
    // Convert to blob
    const modifiedImageBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png');
    });
    
    const stats = {
      originalSize: imageFile.size,
      dataEmbedded: payload.length,
      capacity: Math.floor((canvas.width * canvas.height * 3) / 8),
      utilizationPercent: (allBits.length / (canvas.width * canvas.height * 3)) * 100
    };
    
    return {
      success: true,
      modifiedImageBlob,
      stats
    };
    
  } catch (error) {
    console.error('Embedding failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Extract encrypted data from image
export async function extractDataFromImage(
  imageFile: File,
  password: string
): Promise<ExtractionResult> {
  try {
    const { canvas, ctx } = await imageToCanvas(imageFile);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    // First, extract the length header to know how much data to read
    const lengthPositions = generatePixelPositions(
      canvas.width, 
      canvas.height, 
      4, // 4 bytes for length
      password
    ).slice(0, 32); // 32 bits for length
    
    // Extract length bits
    const lengthBits: number[] = [];
    for (let i = 0; i < 32; i++) {
      const pixelIndex = lengthPositions[i];
      const pixelStart = pixelIndex * 4;
      const channel = i % 3;
      
      lengthBits.push(extractBit(pixels[pixelStart + channel]));
    }
    
    // Convert length bits to number
    const lengthBytes = bitsToData(lengthBits);
    const totalLength = new DataView(lengthBytes.buffer).getUint32(0);
    
    // Now generate positions for the actual payload
    const positions = generatePixelPositions(
      canvas.width, 
      canvas.height, 
      totalLength, 
      password
    );
    
    // Extract payload bits (skip the length header positions)
    const payloadBits: number[] = [];
    for (let i = 32; i < 32 + (totalLength * 8); i++) {
      const pixelIndex = positions[i];
      const pixelStart = pixelIndex * 4;
      const channel = i % 3;
      
      payloadBits.push(extractBit(pixels[pixelStart + channel]));
    }
    
    // Convert bits back to payload
    const payload = bitsToData(payloadBits);
    
    // Parse payload
    let offset = 0;
    
    // Encrypted data length
    const encryptedDataLength = new DataView(payload.buffer).getUint32(offset);
    offset += 4;
    
    // Encrypted data
    const encryptedData = payload.slice(offset, offset + encryptedDataLength);
    offset += encryptedDataLength;
    
    // IV
    const iv = payload.slice(offset, offset + 12);
    offset += 12;
    
    // Salt
    const salt = payload.slice(offset, offset + 16);
    offset += 16;
    
    // Hash length
    const hashLength = new DataView(payload.buffer).getUint32(offset);
    offset += 4;
    
    // Hash
    const hashBytes = payload.slice(offset, offset + hashLength);
    const hash = new TextDecoder().decode(hashBytes);
    
    return {
      success: true,
      encryptedData,
      iv,
      salt,
      hash
    };
    
  } catch (error) {
    console.error('Extraction failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}