import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { spawn } from 'child_process';
import * as net from 'net';
import kill from 'tree-kill';
import { chromium } from 'playwright';
import { getFingerprintForProxy } from './proxy-config.js';
/**
 * TypeScript BrowserManager for Playwright browser automation
 * Supports persistent profiles, proxy management, and multi-tab operations
 */
export class BrowserManager {
    debugLog(...args) {
        if (this.debug)
            console.debug('[BrowserManager]', ...args);
    }
    constructor(options = {}) {
        this.debug = false;
        if (options.debug)
            this.debug = true;
        this.debugPort = options.debugPort || 9222;
        if (options.baseProfileDir) {
            this.baseProfileDir = options.baseProfileDir;
        }
        else {
            this.baseProfileDir = os.platform() === 'darwin'
                ? path.join(os.homedir(), 'ChromeProfiles')
                : 'C:\\ChromeProfiles';
        }
        // Ensure profile directory exists
        if (!fs.existsSync(this.baseProfileDir)) {
            fs.mkdirSync(this.baseProfileDir, { recursive: true });
        }
        this.browserPath = options.browserPath || this.findBrowserPath();
    }
    /**
     * Find browser executable with priority order
     */
    findBrowserPath() {
        const platform = os.platform();
        const possiblePaths = [];
        this.debugLog('\nScanning for browser executable (priority order)...');
        // macOS paths
        if (platform === 'darwin') {
            possiblePaths.push({ type: 'brave', path: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser' }, { type: 'brave', path: path.join(os.homedir(), 'Applications/Brave Browser.app/Contents/MacOS/Brave Browser') }, { type: 'comet', path: '/Applications/Comet Browser.app/Contents/MacOS/Comet Browser' }, { type: 'comet', path: path.join(os.homedir(), 'Applications/Comet Browser.app/Contents/MacOS/Comet Browser') }, { type: 'edge', path: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge' }, { type: 'edge', path: path.join(os.homedir(), 'Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge') }, { type: 'chrome', path: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' }, { type: 'chrome', path: path.join(os.homedir(), 'Applications/Google Chrome.app/Contents/MacOS/Google Chrome') }, { type: 'chromium', path: '/Applications/Chromium.app/Contents/MacOS/Chromium' }, { type: 'chromium', path: path.join(os.homedir(), 'Applications/Chromium.app/Contents/MacOS/Chromium') });
        }
        // Windows paths
        if (platform === 'win32') {
            possiblePaths.push({ type: 'brave', path: 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe' }, { type: 'brave', path: 'C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe' }, { type: 'brave', path: path.join(os.homedir(), 'AppData\\Local\\BraveSoftware\\Brave-Browser\\Application\\brave.exe') }, { type: 'comet', path: 'C:\\Program Files\\CometBrowser\\Application\\comet.exe' }, { type: 'comet', path: 'C:\\Program Files (x86)\\CometBrowser\\Application\\comet.exe' }, { type: 'comet', path: path.join(os.homedir(), 'AppData\\Local\\CometBrowser\\Application\\comet.exe') }, { type: 'edge', path: 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe' }, { type: 'edge', path: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' }, { type: 'edge', path: path.join(os.homedir(), 'AppData\\Local\\Microsoft\\Edge\\Application\\msedge.exe') }, { type: 'chrome', path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' }, { type: 'chrome', path: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe' }, { type: 'chrome', path: path.join(os.homedir(), 'AppData\\Local\\Google\\Chrome\\Application\\chrome.exe') }, { type: 'chrome', path: 'C:\\Program Files\\Google\\Chrome Beta\\Application\\chrome.exe' }, { type: 'chrome', path: 'C:\\Program Files\\Google\\Chrome Canary\\Application\\chrome.exe' }, { type: 'chromium', path: 'C:\\Program Files\\Chromium\\Application\\chromium.exe' }, { type: 'chromium', path: 'C:\\Program Files (x86)\\Chromium\\Application\\chromium.exe' }, { type: 'chromium', path: path.join(os.homedir(), 'AppData\\Local\\Chromium\\Application\\chromium.exe') });
        }
        // Linux paths
        if (platform === 'linux') {
            possiblePaths.push({ type: 'brave', path: '/usr/bin/brave-browser' }, { type: 'brave', path: '/usr/bin/brave' }, { type: 'brave', path: '/usr/local/bin/brave-browser' }, { type: 'brave', path: '/usr/local/bin/brave' }, { type: 'brave', path: path.join(os.homedir(), '.local/bin/brave-browser') }, { type: 'comet', path: '/usr/bin/comet-browser' }, { type: 'comet', path: '/usr/bin/comet' }, { type: 'comet', path: '/usr/local/bin/comet-browser' }, { type: 'comet', path: '/usr/local/bin/comet' }, { type: 'comet', path: path.join(os.homedir(), '.local/bin/comet-browser') }, { type: 'edge', path: '/usr/bin/microsoft-edge' }, { type: 'edge', path: '/usr/bin/microsoft-edge-stable' }, { type: 'edge', path: '/usr/local/bin/microsoft-edge' }, { type: 'chrome', path: '/usr/bin/google-chrome' }, { type: 'chrome', path: '/usr/bin/google-chrome-stable' }, { type: 'chrome', path: '/usr/local/bin/google-chrome' }, { type: 'chromium', path: '/usr/bin/chromium' }, { type: 'chromium', path: '/usr/bin/chromium-browser' }, { type: 'chromium', path: '/usr/local/bin/chromium' }, { type: 'chromium', path: path.join(os.homedir(), '.local/bin/chromium') });
        }
        // Scan for existing browser
        for (const browserPath of possiblePaths) {
            const exists = fs.existsSync(browserPath.path);
            this.debugLog(`  ${exists ? 'Found' : 'Not found'} ${browserPath.path}`);
            if (exists) {
                this.debugLog(`\nSELECTED: ${browserPath.path}\n`);
                return browserPath.path;
            }
        }
        // If no browser found, throw error with instructions
        throw new Error('No supported browser found in standard locations.\n' +
            'Please install one of the following browsers:\n' +
            '- Google Chrome\n' +
            '- Microsoft Edge\n' +
            '- Brave Browser\n' +
            '- Chromium\n' +
            '- Comet Browser\n\n' +
            'Or specify the browser path in the constructor: new BrowserManager({ browserPath: "/path/to/browser" })');
    }
    /**
     * Check if the specified port is available
     */
    isPortOpen(port) {
        return new Promise((resolve) => {
            const server = net.createServer();
            server.listen(port, () => {
                server.once('close', () => {
                    resolve(true);
                });
                server.close();
            });
            server.on('error', () => {
                resolve(false);
            });
        });
    }
    /**
     * Kill browser process and all child processes
     */
    async killBrowserProcess(pid) {
        try {
            this.debugLog(`Killing browser process: ${pid}`);
            await new Promise((resolve) => {
                kill(pid, (error) => {
                    if (error) {
                        console.warn(`Warning: Could not kill process ${pid}: ${error && error.message}`);
                    }
                    else {
                        this.debugLog(`Successfully killed process ${pid}`);
                    }
                    resolve();
                });
            });
        }
        catch (error) {
            console.warn(`Error killing browser process: ${error}`);
        }
    }
    /**
     * Get the full path to the profile directory
     */
    getProfilePath(profileName) {
        return path.join(this.baseProfileDir, profileName);
    }
    /**
     * Check if a profile exists
     */
    profileExists(profileName) {
        return fs.existsSync(this.getProfilePath(profileName));
    }
    /**
     * Setup a browser profile for manual interaction
     */
    async setupProfile(profileName, url, waitMessage = 'Perform manual actions, then close the browser to save.', headless = false) {
        const userDataDir = this.getProfilePath(profileName);
        if (!(await this.isPortOpen(this.debugPort))) {
            throw new Error(`Port ${this.debugPort} is in use. Choose another port.`);
        }
        const args = [
            this.browserPath,
            `--remote-debugging-port=${this.debugPort}`,
            `--user-data-dir=${userDataDir}`,
            '--no-first-run',
            '--no-default-browser-check'
        ];
        if (url) {
            args.push(url);
        }
        if (headless) {
            args.push('--headless=new');
        }
        this.debugLog(`Starting browser for profile '${profileName}'`);
        this.debugLog(waitMessage);
        const process = spawn(this.browserPath, args.slice(1), {
            detached: true,
            stdio: 'ignore'
        });
        // Wait for process to complete (user closes browser)
        await new Promise((resolve) => {
            process.on('close', resolve);
            process.on('exit', resolve);
        });
        console.log(`✅ Profile '${profileName}' saved.`);
    }
    /**
     * Connect to browser with the specified profile
     */
    async connectToBrowser(profileName, url, headless = false, timeout = 60000) {
        if (!this.profileExists(profileName)) {
            throw new Error(`Profile '${profileName}' does not exist. Create it first.`);
        }
        if (!(await this.isPortOpen(this.debugPort))) {
            throw new Error(`Port ${this.debugPort} is in use. Choose another port.`);
        }
        const userDataDir = this.getProfilePath(profileName);
        const args = [
            `--remote-debugging-port=${this.debugPort}`,
            `--user-data-dir=${userDataDir}`,
            '--no-first-run',
            '--no-default-browser-check'
        ];
        if (headless) {
            args.push('--headless=new');
        }
        this.browserProcess = spawn(this.browserPath, args, {
            detached: true,
            stdio: 'pipe'
        });
        this.processPid = this.browserProcess.pid || undefined;
        if (!this.processPid) {
            throw new Error('Failed to start browser process');
        }
        this.debugLog(`✅ Browser started for profile '${profileName}' (PID: ${this.processPid}).`);
        // Wait for browser to start
        await new Promise(resolve => setTimeout(resolve, 3000));
        try {
            // Connect via Playwright CDP
            this.playwrightBrowser = await chromium.connectOverCDP(`http://127.0.0.1:${this.debugPort}`);
            const context = this.playwrightBrowser.contexts()[0] || await this.playwrightBrowser.newContext();
            const pages = context.pages();
            const page = pages[0] || await context.newPage();
            if (url) {
                await page.goto(url, { timeout });
                await page.waitForLoadState('load', { timeout });
            }
            return { page, context, browser: this.playwrightBrowser };
        }
        catch (error) {
            console.error(`Failed to connect to browser: ${error}`);
            await this.closeBrowser();
            throw error;
        }
    }
    /**
     * Connect to browser without a profile (temporary session)
     * Useful for scenarios where you don't need to persist browser data
     */
    async connectToBrowserWithoutProfile(url, headless = false, timeout = 60000) {
        if (!(await this.isPortOpen(this.debugPort))) {
            throw new Error(`Port ${this.debugPort} is in use. Choose another port.`);
        }
        // Create a temporary profile directory for this session
        // This is required for Brave/Chrome to start properly
        const tempProfileName = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const tempUserDataDir = this.getProfilePath(tempProfileName);
        this.debugLog(`Creating temporary profile at: ${tempUserDataDir}`);
        const args = [
            `--remote-debugging-port=${this.debugPort}`,
            `--user-data-dir=${tempUserDataDir}`,
            '--no-first-run',
            '--no-default-browser-check'
        ];
        if (headless) {
            args.push('--headless=new');
        }
        this.browserProcess = spawn(this.browserPath, args, {
            detached: true,
            stdio: 'pipe'
        });
        this.processPid = this.browserProcess.pid || undefined;
        if (!this.processPid) {
            throw new Error('Failed to start browser process');
        }
        // Capture stderr for debugging
        if (this.browserProcess.stderr) {
            this.browserProcess.stderr.on('data', (data) => {
                this.debugLog(`Browser stderr: ${data}`);
            });
        }
        this.debugLog(`✅ Browser started without profile (PID: ${this.processPid}).`);
        // Wait for browser to start with retry logic
        let connected = false;
        let lastError;
        for (let i = 0; i < 10; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            try {
                // Try to connect via Playwright CDP
                this.playwrightBrowser = await chromium.connectOverCDP(`http://127.0.0.1:${this.debugPort}`);
                connected = true;
                break;
            }
            catch (error) {
                lastError = error;
                this.debugLog(`Connection attempt ${i + 1} failed, retrying...`);
            }
        }
        if (!connected) {
            console.error(`Failed to connect to browser after 10 attempts: ${lastError}`);
            await this.closeBrowser();
            // Clean up temporary profile
            try {
                if (fs.existsSync(tempUserDataDir)) {
                    fs.rmSync(tempUserDataDir, { recursive: true, force: true });
                    this.debugLog(`Cleaned up temporary profile: ${tempUserDataDir}`);
                }
            }
            catch (cleanupError) {
                this.debugLog(`Failed to clean up temporary profile: ${cleanupError}`);
            }
            throw lastError;
        }
        try {
            const context = this.playwrightBrowser.contexts()[0] || await this.playwrightBrowser.newContext();
            const pages = context.pages();
            const page = pages[0] || await context.newPage();
            if (url) {
                await page.goto(url, { timeout });
                await page.waitForLoadState('load', { timeout });
            }
            // Store temp profile path for cleanup later
            this._tempProfilePath = tempUserDataDir;
            return { page, context, browser: this.playwrightBrowser };
        }
        catch (error) {
            console.error(`Failed to navigate or setup page: ${error}`);
            await this.closeBrowser();
            // Clean up temporary profile
            try {
                if (fs.existsSync(tempUserDataDir)) {
                    fs.rmSync(tempUserDataDir, { recursive: true, force: true });
                    this.debugLog(`Cleaned up temporary profile: ${tempUserDataDir}`);
                }
            }
            catch (cleanupError) {
                this.debugLog(`Failed to clean up temporary profile: ${cleanupError}`);
            }
            throw error;
        }
    }
    /**
     * Connect to browser with proxy support
     */
    async connectToBrowserWithProxy(options) {
        if (!this.profileExists(options.profileName)) {
            throw new Error(`Profile '${options.profileName}' does not exist. Create it first.`);
        }
        if (!(await this.isPortOpen(this.debugPort))) {
            throw new Error(`Port ${this.debugPort} is in use. Choose another port.`);
        }
        const userDataDir = this.getProfilePath(options.profileName);
        // Start browser without proxy first
        const args = [
            `--remote-debugging-port=${this.debugPort}`,
            `--user-data-dir=${userDataDir}`,
            '--no-first-run',
            '--no-default-browser-check',
            '--disable-features=BraveShields',
            '--brave-ads-service-enabled=0'
        ];
        if (options.headless) {
            args.push('--headless=new');
        }
        this.browserProcess = spawn(this.browserPath, args, {
            detached: true,
            stdio: 'pipe'
        });
        this.processPid = this.browserProcess.pid || undefined;
        if (!this.processPid) {
            throw new Error('Failed to start browser process');
        }
        this.debugLog(`✅ Browser started for profile '${options.profileName}' (PID: ${this.processPid}).`);
        // Wait for browser to start
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
            // Get fingerprint for proxy
            const fingerprint = await getFingerprintForProxy(options.proxy);
            // Connect via Playwright CDP
            this.playwrightBrowser = await chromium.connectOverCDP(`http://127.0.0.1:${this.debugPort}`);
            const context = await this.playwrightBrowser.newContext({
                proxy: options.proxy,
                timezoneId: fingerprint.tz,
                locale: fingerprint.locale,
                viewport: { width: fingerprint.res[0], height: fingerprint.res[1] },
                ignoreHTTPSErrors: true,
            });
            // Apply anti-detection measures
            await this.applyAntiDetection(context);
            const page = await context.newPage();
            if (options.url) {
                this.debugLog(`Going to ${options.url}...`);
                await page.goto(options.url, { timeout: options.timeout || 60000 });
                await page.waitForLoadState('networkidle', { timeout: options.timeout || 60000 });
            }
            this.debugLog('Browser ready with PERFECT proxy + fingerprint');
            return { page, context, browser: this.playwrightBrowser };
        }
        catch (error) {
            console.error(`Failed to connect to browser: ${error}`);
            await this.closeBrowser();
            throw error;
        }
    }
    /**
     * Apply anti-detection measures to browser context
     */
    async applyAntiDetection(context) {
        await context.addInitScript(`
      () => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
        Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
        Object.defineProperty(navigator, 'plugins', { get: () => [1,2,3,4,5] });
        Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
        window.chrome = window.chrome || {};
        delete navigator.__proto__.webdriver;
      }
    `);
    }
    /**
     * Close the browser and clean up all resources
     */
    async closeBrowser() {
        // Close Playwright browser
        if (this.playwrightBrowser) {
            try {
                await this.playwrightBrowser.close();
                this.debugLog('Closed Playwright browser instance');
            }
            catch (error) {
                console.error(`Error closing Playwright browser: ${error}`);
            }
            this.playwrightBrowser = undefined;
        }
        // Kill browser process
        if (this.browserProcess && this.processPid) {
            try {
                await this.killBrowserProcess(this.processPid);
            }
            catch (error) {
                console.error(`Error killing browser process: ${error}`);
            }
            this.browserProcess = undefined;
            this.processPid = undefined;
        }
        // Clean up temporary profile if it exists
        const tempProfilePath = this._tempProfilePath;
        if (tempProfilePath) {
            try {
                // Wait a bit for browser to fully close before cleanup
                await new Promise(resolve => setTimeout(resolve, 1000));
                if (fs.existsSync(tempProfilePath)) {
                    fs.rmSync(tempProfilePath, { recursive: true, force: true });
                    this.debugLog(`Cleaned up temporary profile: ${tempProfilePath}`);
                }
                this._tempProfilePath = undefined;
            }
            catch (cleanupError) {
                this.debugLog(`Failed to clean up temporary profile: ${cleanupError}`);
            }
        }
        console.log('✅ Browser closed.');
    }
    /**
     * Async version of connectToBrowser
     */
    async connectToBrowserAsync(profileName, url, headless = false, timeout = 60000) {
        return this.connectToBrowser(profileName, url, headless, timeout);
    }
    /**
     * Async version of connectToBrowserWithProxy
     */
    async connectToBrowserAsyncWithProxy(options) {
        return this.connectToBrowserWithProxy(options);
    }
    /**
     * Async version of closeBrowser
     */
    async closeBrowserAsync() {
        return this.closeBrowser();
    }
    /**
     * Cleanup method for resource management
     */
    async dispose() {
        await this.closeBrowser();
    }
    /**
     * Enable using the class in async dispose patterns
     */
    async [Symbol.asyncDispose]() {
        await this.dispose();
    }
}
