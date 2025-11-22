import type { BrowserManagerOptions, ProxyConnectionOptions, BrowserConnectionResult } from '../types/index.js';
/**
 * TypeScript BrowserManager for Playwright browser automation
 * Supports persistent profiles, proxy management, and multi-tab operations
 */
export declare class BrowserManager {
    private debug;
    private debugLog;
    private baseProfileDir;
    private browserPath;
    private debugPort;
    private browserProcess;
    private playwrightBrowser;
    private processPid;
    constructor(options?: BrowserManagerOptions);
    /**
     * Find browser executable with priority order
     */
    private findBrowserPath;
    /**
     * Check if the specified port is available
     */
    private isPortOpen;
    /**
     * Kill browser process and all child processes
     */
    private killBrowserProcess;
    /**
     * Get the full path to the profile directory
     */
    getProfilePath(profileName: string): string;
    /**
     * Check if a profile exists
     */
    profileExists(profileName: string): boolean;
    /**
     * Setup a browser profile for manual interaction
     */
    setupProfile(profileName: string, url?: string, waitMessage?: string, headless?: boolean): Promise<void>;
    /**
     * Connect to browser with the specified profile
     */
    connectToBrowser(profileName: string, url?: string, headless?: boolean, timeout?: number): Promise<BrowserConnectionResult>;
    /**
     * Connect to browser with proxy support
     */
    connectToBrowserWithProxy(options: ProxyConnectionOptions): Promise<BrowserConnectionResult>;
    /**
     * Apply anti-detection measures to browser context
     */
    private applyAntiDetection;
    /**
     * Close the browser and clean up all resources
     */
    closeBrowser(): Promise<void>;
    /**
     * Async version of connectToBrowser
     */
    connectToBrowserAsync(profileName: string, url?: string, headless?: boolean, timeout?: number): Promise<BrowserConnectionResult>;
    /**
     * Async version of connectToBrowserWithProxy
     */
    connectToBrowserAsyncWithProxy(options: ProxyConnectionOptions): Promise<BrowserConnectionResult>;
    /**
     * Async version of closeBrowser
     */
    closeBrowserAsync(): Promise<void>;
    /**
     * Cleanup method for resource management
     */
    dispose(): Promise<void>;
    /**
     * Enable using the class in async dispose patterns
     */
    [Symbol.asyncDispose](): Promise<void>;
}
//# sourceMappingURL=browser-manager.d.ts.map