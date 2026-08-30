// BottleResult — QR Code Generation Module
import QRCode from 'qrcode';

/**
 * Generate QR code as Data URL (PNG base64) for verification
 */
export async function generateVerificationQR(
  verificationUrl: string
): Promise<string> {
  try {
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });
    return qrDataUrl;
  } catch (err) {
    console.error('Failed to generate QR code', err);
    return '';
  }
}
