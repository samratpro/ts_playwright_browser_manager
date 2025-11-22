import { chromium } from 'playwright';
(async () => {
    // Setup
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    // The actual interesting bit
    await page.goto('https://chatgpt.com/');
    // Pause briefly to allow any dynamic content to load (1 second)
    await page.waitForTimeout(100000);
    // Teardown
    await context.close();
    await browser.close();
})();
