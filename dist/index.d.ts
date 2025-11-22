/**
 * Main entry point for TypeScript Browser Manager
 * Exports all core functionality for easy importing
 */
export { BrowserManager } from './core/browser-manager.js';
export { detectCountry, countryFromDataimpulseUsername, getFingerprintForProxy, FINGERPRINTS, DEFAULT_FINGERPRINT } from './core/proxy-config.js';
export type { ProxyConfig, BrowserFingerprint, BrowserManagerOptions, BrowserLaunchOptions, ProxyConnectionOptions, CountryFingerprints, ProcessInfo, BrowserConnectionResult, BrowserType, BrowserPath, AsyncScrapeResult } from './types/index.js';
export type { Browser, BrowserContext, Page } from 'playwright';
//# sourceMappingURL=index.d.ts.map