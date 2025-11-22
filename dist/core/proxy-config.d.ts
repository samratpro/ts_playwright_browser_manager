import type { ProxyConfig, BrowserFingerprint, CountryFingerprints } from '../types/index.js';
/**
 * Detect country from IP address using ip-api.com
 */
export declare function detectCountry(ip: string): Promise<string | null>;
/**
 * Extract country from DataImpulse username format
 * Example: user__cr.fr → FR
 */
export declare function countryFromDataimpulseUsername(username: string): string | null;
/**
 * Browser fingerprints by country for anti-detection
 */
export declare const FINGERPRINTS: CountryFingerprints;
export declare const DEFAULT_FINGERPRINT: BrowserFingerprint;
/**
 * Get appropriate fingerprint for a proxy configuration
 */
export declare function getFingerprintForProxy(proxy: ProxyConfig): Promise<BrowserFingerprint>;
//# sourceMappingURL=proxy-config.d.ts.map