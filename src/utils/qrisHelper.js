import QRCode from 'qrcode';

// Base Static QRIS from PT. ARMADA DIGITAL MARKETING SYARIAH (NMID: ID1025438297117)
const BASE_STATIC_QRIS =
  '00020101021126570011ID.DANA.WWW011893600915324991259402092499125940303UMI51440014ID.CO.QRIS.WWW0215ID10254382971170303UMI5204899953033605802ID5924ARMADA DIGITAL MARKETING6012Kab. Bandung61054062463044D7B';

/**
 * Standard CRC16-CCITT (Polynomial 0x1021, Init 0xFFFF) for EMVCo QRIS Specification
 */
export function calculateCRC16(data) {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Convert Static QRIS into Dynamic QRIS with locked amount (Tag 54)
 * @param {number} amount - Exact transaction amount in IDR (e.g. 99000)
 * @returns {string} - Valid EMVCo Dynamic QRIS string
 */
export function generateDynamicQRIS(amount) {
  if (!amount || isNaN(amount) || amount <= 0) {
    return BASE_STATIC_QRIS;
  }

  // 1. Change Point of Initiation Method from 11 (Static) to 12 (Dynamic)
  let payload = BASE_STATIC_QRIS.replace('010211', '010212');

  // 2. Remove previous CRC (last 8 characters: 6304xxxx)
  payload = payload.slice(0, -8);

  // 3. Format tag 54 (Transaction Amount)
  const amountStr = Math.round(amount).toString();
  const amountLength = amountStr.length.toString().padStart(2, '0');
  const tag54 = `54${amountLength}${amountStr}`;

  // 4. Insert Tag 54 before Tag 5802ID (Country Code)
  const tag58Pos = payload.indexOf('5802ID');
  if (tag58Pos !== -1) {
    payload = payload.slice(0, tag58Pos) + tag54 + payload.slice(tag58Pos);
  } else {
    payload += tag54;
  }

  // 5. Append Tag 6304 and calculate final CRC16 Checksum
  const stringToSign = payload + '6304';
  const checksum = calculateCRC16(stringToSign);

  return stringToSign + checksum;
}

/**
 * Generate high quality QR code Data URL from dynamic QR string
 */
export async function getDynamicQRDataUrl(amount) {
  try {
    const dynamicString = generateDynamicQRIS(amount);
    const dataUrl = await QRCode.toDataURL(dynamicString, {
      width: 480,
      margin: 1,
      color: {
        dark: '#0A2540',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });
    return { dataUrl, dynamicString };
  } catch (error) {
    console.error('Error generating dynamic QRIS data URL:', error);
    return { dataUrl: null, dynamicString: BASE_STATIC_QRIS };
  }
}
