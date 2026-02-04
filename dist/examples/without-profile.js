import { BrowserManager } from "../core/browser-manager.js";
import fs from 'fs/promises';
const Sleep = (Second) => new Promise(resolve => setTimeout(resolve, Second * 1000));
// Load configuration
const loadConfig = async () => {
    const configContent = await fs.readFile('config.json', 'utf-8');
    return JSON.parse(configContent);
};
const manager = new BrowserManager({ debug: true });
(async () => {
    try {
        // Load config
        const config = await loadConfig();
        console.log(`[CONFIG] Loaded configuration from config.json`);
        const { page } = await manager.connectToBrowserWithoutProfile(config.target.url);
        await page.waitForLoadState('networkidle');
        // Handle cookie consent more robustly
        await Sleep(50);
        await manager.closeBrowser();
        console.log('Test completed successfully!');
    }
    catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
})();
