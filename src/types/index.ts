/**
 * Core type definitions for Browser Manager
 */

export interface ProxyConfig {
  server: string;
  username?: string;
  password?: string;
}

export interface BrowserFingerprint {
  tz: string;
  locale: string;
  res: [number, number];
}

export interface BrowserManagerOptions {
  baseProfileDir?: string;
  browserPath?: string;
  debugPort?: number;
}

export interface BrowserLaunchOptions {
  profileName: string;
  url?: string;
  waitMessage?: string;
  headless?: boolean;
  timeout?: number;
}

export interface ProxyConnectionOptions extends BrowserLaunchOptions {
  proxy: ProxyConfig;
}

export interface ProxyConnectionWithoutProfileOptions {
  proxy: ProxyConfig;
  url?: string;
  headless?: boolean;
  timeout?: number;
}

export interface CountryFingerprints {
  [key: string]: BrowserFingerprint;
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cmd: string;
}

export interface BrowserConnectionResult {
  page: any; // Playwright Page
  context: any; // Playwright BrowserContext
  browser: any; // Playwright Browser
}

export type BrowserType = 'chrome' | 'edge' | 'brave' | 'chromium' | 'comet';

export interface BrowserPath {
  type: BrowserType;
  path: string;
}

export interface AsyncScrapeResult {
  url: string;
  status: 'Success' | 'Error';
  data?: any;
  error?: string;
}