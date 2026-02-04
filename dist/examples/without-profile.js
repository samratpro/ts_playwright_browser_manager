/**
 * Without-profile examples for BrowserManager
 * Demonstrates temporary browser sessions (no persistent profile)
 * with both basic and proxy-based usage
 */
import { BrowserManager } from '../core/browser-manager.js';
const Sleep = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000));
// ============================================================
// Example 1: Basic usage without profile (no proxy)
// ============================================================
async function basicWithoutProfile() {
    const manager = new BrowserManager({ debugPort: 9221 });
    try {
        const { page, context } = await manager.connectToBrowserWithoutProfile('https://www.google.com');
        await page.waitForLoadState('networkidle');
        console.log('Page Title:', await page.title());
        // Navigate to another page
        await page.goto('https://example.com');
        console.log('Navigated to:', page.url());
        await Sleep(5);
    }
    finally {
        await manager.closeBrowser();
    }
}
// ============================================================
// Example 2: Without profile + Proxy
// ============================================================
async function withoutProfileWithProxy() {
    const manager = new BrowserManager({ debugPort: 9222 });
    const proxyConfig = {
        server: 'http://proxy.example.com:8080',
        username: 'your_username',
        password: 'your_password'
    };
    try {
        const { page } = await manager.connectToBrowserWithoutProfileWithProxy({
            proxy: proxyConfig,
            url: 'https://iphey.com',
            headless: false
        });
        console.log('Connected with proxy (no profile)!');
        console.log('Page Title:', await page.title());
        await Sleep(10);
    }
    finally {
        await manager.closeBrowser();
    }
}
// ============================================================
// Example 3: Multi-tab without profile
// ============================================================
async function multiTabWithoutProfile() {
    const manager = new BrowserManager({ debugPort: 9223 });
    try {
        const { page, context } = await manager.connectToBrowserWithoutProfile('https://www.google.com');
        const urls = [
            'https://github.com',
            'https://stackoverflow.com',
            'https://example.com'
        ];
        const results = await Promise.all(urls.map(async (url) => {
            const newPage = await context.newPage();
            await newPage.goto(url);
            const title = await newPage.title();
            await newPage.close();
            return { url, title };
        }));
        console.log('Multi-tab results:', results);
    }
    finally {
        await manager.closeBrowser();
    }
}
// ============================================================
// Run examples
// ============================================================
async function main() {
    console.log('=== Without Profile Examples ===\n');
    console.log('--- Example 1: Basic (no proxy) ---');
    await basicWithoutProfile();
    // Uncomment to run proxy example:
    // console.log('\n--- Example 2: With Proxy ---');
    // await withoutProfileWithProxy();
    // Uncomment to run multi-tab example:
    // console.log('\n--- Example 3: Multi-tab ---');
    // await multiTabWithoutProfile();
}
main().catch(console.error);
