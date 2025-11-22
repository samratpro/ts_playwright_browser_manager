/**
 * Synchronous usage example for BrowserManager
 * Demonstrates basic profile setup and browser automation
 */
import { BrowserManager } from '../core/browser-manager.js';
import { fileURLToPath } from 'url';
const debugPort = 9221; // You can use 9222, 9223, etc.
async function main() {
    const manager = new BrowserManager({ debugPort });
    try {
        // Example 1: Check and setup Facebook profile
        const profileName = 'my_facebook_profile';
        if (!manager.profileExists(profileName)) {
            console.log(`Profile '${profileName}' does not exist. Setting it up now.`);
            await manager.setupProfile(profileName, 'https://www.facebook.com', 'Please login to Facebook, then close the browser to save your session.');
        }
        else {
            // For automation, you might want to skip the interactive prompt
            console.log(`Profile '${profileName}' exists. Using existing profile.`);
            // If you want to update it, uncomment:
            // await manager.setupProfile(
            //   profileName,
            //   'https://www.facebook.com',
            //   'Please update your Facebook session, then close the browser to save.'
            // );
        }
        // Example 2: Connect and use the profile
        console.log('Connecting to browser with profile...');
        const { page, context, browser } = await manager.connectToBrowser(profileName, 'https://www.facebook.com');
        console.log('Page Title:', await page.title());
        // You can perform various actions here:
        // - Navigate to different pages
        // - Click elements
        // - Fill forms
        // - Extract data
        // Example: Navigate to marketplace
        const marketplacePage = await context.newPage();
        await marketplacePage.goto('https://www.facebook.com/marketplace');
        console.log('Marketplace Title:', await marketplacePage.title());
        // Wait for user interaction (remove in production)
        console.log('Press Ctrl+C to close the browser...');
        await new Promise(resolve => {
            process.on('SIGINT', resolve);
            process.on('SIGTERM', resolve);
        });
        // Clean up
        await marketplacePage.close();
    }
    catch (error) {
        console.error('Error:', error);
    }
    finally {
        await manager.closeBrowser();
    }
}
// Alternative usage with multiple profiles
async function multiProfileExample() {
    try {
        // Profile 1
        const manager1 = new BrowserManager({ debugPort: 9221 });
        const profile1 = 'my_facebook_profile';
        if (manager1.profileExists(profile1)) {
            const { page } = await manager1.connectToBrowser(profile1, 'https://www.facebook.com');
            console.log('Profile 1 - Page Title:', await page.title());
            await manager1.closeBrowser();
        }
        // Profile 2
        const manager2 = new BrowserManager({ debugPort: 9222 });
        const profile2 = 'my_facebook_profile2';
        if (manager2.profileExists(profile2)) {
            const { page } = await manager2.connectToBrowser(profile2, 'https://www.facebook.com');
            console.log('Profile 2 - Page Title:', await page.title());
            await manager2.closeBrowser();
        }
    }
    catch (error) {
        console.error('Multi-profile error:', error);
    }
}
// Example using the dispose pattern
async function disposePatternExample() {
    const manager = new BrowserManager({ debugPort: 9221 });
    try {
        const profileName = 'my_facebook_profile';
        if (manager.profileExists(profileName)) {
            const { page } = await manager.connectToBrowser(profileName, 'https://www.facebook.com');
            console.log('Page Title:', await page.title());
            // Do your work here...
        }
        else {
            console.log(`Profile '${profileName}' does not exist. Please create it first.`);
        }
    }
    finally {
        await manager.dispose(); // Cleanup is automatic
    }
}
// Run the examples
if (fileURLToPath(import.meta.url) === process.argv[1]) {
    console.log('=== Browser Manager Sync Example ===\n');
    // Choose which example to run:
    main().catch(console.error);
    // multiProfileExample().catch(console.error);
    // disposePatternExample().catch(console.error);
}
