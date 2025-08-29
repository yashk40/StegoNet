// StegoNet Cryptographic Operations
// AES-256-GCM encryption and SHA-256 hashing for message integrity

export interface EncryptionResult {
  encryptedData: Uint8Array;
  iv: Uint8Array;
  salt: Uint8Array;
  hash: string;
}

export interface DecryptionResult {
  decryptedMessage: string;
  isValid: boolean;
  hash: string;
}

// Generate a cryptographically secure key from password
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Generate SHA-256 hash for integrity verification
export async function generateHash(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  
  return Array.from(hashArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// AES-256-GCM encryption
export async function encryptMessage(
  message: string, 
  password: string
): Promise<EncryptionResult> {
  const encoder = new TextEncoder();
  
  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Derive key from password
  const key = await deriveKey(password, salt);
  
  // Generate message hash before encryption
  const hash = await generateHash(message);
  
  // Encrypt the message
  const encodedMessage = encoder.encode(message);
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encodedMessage
  );
  
  const encryptedData = new Uint8Array(encryptedBuffer);
  
  return {
    encryptedData,
    iv,
    salt,
    hash
  };
}

// AES-256-GCM decryption with integrity verification
export async function decryptMessage(
  encryptedData: Uint8Array,
  iv: Uint8Array,
  salt: Uint8Array,
  password: string,
  expectedHash: string
): Promise<DecryptionResult> {
  try {
    const decoder = new TextDecoder();
    
    // Derive key from password and salt
    const key = await deriveKey(password, salt);
    
    // Decrypt the message
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encryptedData
    );
    
    const decryptedMessage = decoder.decode(decryptedBuffer);
    
    // Verify message integrity
    const actualHash = await generateHash(decryptedMessage);
    const isValid = actualHash === expectedHash;
    
    return {
      decryptedMessage,
      isValid,
      hash: actualHash
    };
  } catch (error) {
    console.error('Decryption failed:', error);
    return {
      decryptedMessage: '',
      isValid: false,
      hash: ''
    };
  }
}

// Convert arrays to base64 for storage/transmission
export function arrayToBase64(array: Uint8Array): string {
  return btoa(String.fromCharCode(...array));
}

// Convert base64 back to arrays
export function base64ToArray(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}