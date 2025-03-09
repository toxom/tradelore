// $lib/auth/totp.ts
import * as OTPAuth from 'otpauth';

/**
 * Generates a random base32 string for TOTP secret
 */
function generateRandomBase32(length = 20) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let result = '';
  
  // Generate a random byte array
  const randomBytes = new Uint8Array(length);
  window.crypto.getRandomValues(randomBytes);
  
  // Convert to base32
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomBytes[i] % chars.length);
  }
  
  return result;
}

/**
 * Generates a TOTP secret for a user
 */
export function generateTOTPSecret(username: string) {
  // Generate a random base32 encoded secret
  const secretBase32 = generateRandomBase32();
  
  // Create a new TOTP instance with the generated secret
  const totp = new OTPAuth.TOTP({
    issuer: 'YourAppName',
    label: username,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: secretBase32
  });
  
  // Get the otpauth URL for QR code
  const otpauth = totp.toString();

  return { secret: secretBase32, otpauth };
}

/**
 * Generates a QR code for the TOTP setup
 */
export async function generateQRCode(otpauthUrl: string): Promise<string> {
  try {
    // Dynamically import QRCode library
    const QRCode = await import('qrcode');
    return await QRCode.toDataURL(otpauthUrl);
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw new Error('Failed to generate QR code: ' + (error.message || 'Unknown error'));
  }
}

/**
 * Verifies a TOTP token against a secret
 */
export function verifyTOTP(secret: string, token: string): boolean {
  try {
    // Create a TOTP instance with the stored secret
    const totp = new OTPAuth.TOTP({
      issuer: 'YourAppName',
      label: 'User',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret
    });

    // Verify the token
    const delta = totp.validate({ token, window: 1 });
    
    // If delta is null, the token is invalid
    // Otherwise, it's valid (delta tells how many periods away it is)
    return delta !== null;
  } catch (error) {
    console.error('Error verifying TOTP:', error);
    return false;
  }
}