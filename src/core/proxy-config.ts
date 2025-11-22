import got from 'got';
import type { ProxyConfig, BrowserFingerprint, CountryFingerprints } from '../types/index.js';

/**
 * Cache for country lookups to avoid repeated API calls
 */
const countryCache: Record<string, string | null> = {};

/**
 * Detect country from IP address using ip-api.com
 */
export async function detectCountry(ip: string): Promise<string | null> {
  if (countryCache[ip] !== undefined) {
    return countryCache[ip];
  }

  try {
    const data = await got
      .get(`http://ip-api.com/json/${ip}?fields=countryCode`, { timeout: { request: 7000 } })
      .json();

    const code = (data as any)?.countryCode;
    if (code) {
      countryCache[ip] = code;
      return code;
    }
  } catch (error) {
    console.warn(`Failed to detect country for IP ${ip}:`, error);
  }
  
  countryCache[ip] = null;
  return null;
}

/**
 * Extract country from DataImpulse username format
 * Example: user__cr.fr → FR
 */
export function countryFromDataimpulseUsername(username: string): string | null {
  if (username.toLowerCase().includes('__cr.')) {
    const parts = username.toLowerCase().split('__cr.');
    const code = parts[parts.length - 1]?.trim();
    
    if (!code) return null;
    
    const mapping: Record<string, string> = {
      'fr': 'FR',
      'de': 'DE',
      'nl': 'NL',
      'gb': 'GB',
      'us': 'US',
      'ca': 'CA',
      'au': 'AU',
      'jp': 'JP',
      'it': 'IT',
      'es': 'ES',
    };
    
    return mapping[code] || null;
  }
  
  return null;
}

/**
 * Browser fingerprints by country for anti-detection
 */
export const FINGERPRINTS: CountryFingerprints = {
  'US': { tz: 'America/New_York', locale: 'en-US', res: [1920, 1080] },
  'GB': { tz: 'Europe/London', locale: 'en-GB', res: [1920, 1080] },
  'DE': { tz: 'Europe/Berlin', locale: 'de-DE', res: [1920, 1080] },
  'FR': { tz: 'Europe/Paris', locale: 'fr-FR', res: [1920, 1080] },
  'NL': { tz: 'Europe/Amsterdam', locale: 'nl-NL', res: [1920, 1080] },
  'CA': { tz: 'America/Toronto', locale: 'en-CA', res: [1920, 1080] },
  'AU': { tz: 'Australia/Sydney', locale: 'en-AU', res: [1920, 1080] },
  'JP': { tz: 'Asia/Tokyo', locale: 'ja-JP', res: [1920, 1080] },
  'IN': { tz: 'Asia/Kolkata', locale: 'en-IN', res: [1366, 768] },
  'BR': { tz: 'America/Sao_Paulo', locale: 'pt-BR', res: [1366, 768] },
  'RU': { tz: 'Europe/Moscow', locale: 'ru-RU', res: [1920, 1080] },
};

export const DEFAULT_FINGERPRINT: BrowserFingerprint = FINGERPRINTS['US']!;

/**
 * Get appropriate fingerprint for a proxy configuration
 */
export async function getFingerprintForProxy(proxy: ProxyConfig): Promise<BrowserFingerprint> {
  let country: string | null = null;
  
  // Try to detect country from username first
  if (proxy.username) {
    country = countryFromDataimpulseUsername(proxy.username);
  }
  
  // Fallback to IP detection if username doesn't provide country
  if (!country && proxy.server) {
    const hostParts = proxy.server.split('://');
    const host = hostParts[hostParts.length - 1]?.split(':')[0]?.split('@')[-1] || '';
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      country = await detectCountry(host);
    }
  }
  
  const fingerprint = country ? (FINGERPRINTS[country] || DEFAULT_FINGERPRINT) : DEFAULT_FINGERPRINT;
  
  if (!fingerprint) {
    throw new Error('Unable to determine browser fingerprint');
  }
  
  console.debug(`Using fingerprint → Country: ${country || 'US'} | Timezone: ${fingerprint.tz} | Locale: ${fingerprint.locale}`);
  
  return fingerprint;
}