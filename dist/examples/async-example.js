/**
 * Async usage examples for BrowserManager
 * Demonstrates advanced patterns like multiple tabs, parallel processing, and concurrent profiles
 */
import { BrowserManager } from '../core/browser-manager.js';
import * as fs from 'fs';
import * as path from 'path';
// ============================================================================
// USE CASE 1: Multiple tabs with same profile (parallel data collection)
// ============================================================================
async function useCase1_MultipleTabsSameProfile() {
    console.log('=== Use Case 1: Multiple tabs with same profile ===');
    const debugPort = 9221;
    const profileName = 'my_facebook_profile';
    const manager = new BrowserManager({ debugPort });
    try {
        // Connect to browser with the profile
        const { context } = await manager.connectToBrowser(profileName, 'https://www.facebook.com');
        // Create multiple new pages (tabs)
        const page1 = await context.newPage();
        const page2 = await context.newPage();
        const page3 = await context.newPage();
        // URLs to navigate to
        const urls = [
            'https://www.facebook.com/marketplace',
            'https://www.facebook.com/groups',
            'https://www.facebook.com/watch'
        ];
        // Navigate to different URLs in parallel
        await Promise.all([
            page1.goto(urls[0], { timeout: 30000 }),
            page2.goto(urls[1], { timeout: 30000 }),
            page3.goto(urls[2], { timeout: 30000 })
        ]);
        // Get titles from all pages
        const titles = await Promise.all([
            page1.title(),
            page2.title(),
            page3.title()
        ]);
        console.log(`Page 1 Title: ${titles[0]}`);
        console.log(`Page 2 Title: ${titles[1]}`);
        console.log(`Page 3 Title: ${titles[2]}`);
        // Perform actions on each page in parallel
        const scrapePage = async (page, name) => {
            await page.waitForLoadState('networkidle');
            const content = await page.content();
            console.log(`${name} content length: ${content.length}`);
            return content;
        };
        const results = await Promise.all([
            scrapePage(page1, 'Marketplace'),
            scrapePage(page2, 'Groups'),
            scrapePage(page3, 'Watch')
        ]);
        // Close pages
        await page1.close();
        await page2.close();
        await page3.close();
        console.log('✅ Use case 1 completed successfully\n');
    }
    catch (error) {
        console.error('❌ Use case 1 failed:', error);
    }
    finally {
        await manager.closeBrowser();
    }
}
// ============================================================================
// USE CASE 2: Multiple profiles with multiple tabs (different accounts)
// ============================================================================
async function useCase2_MultipleProfilesMultipleTabs() {
    console.log('=== Use Case 2: Multiple profiles with multiple tabs ===');
    const manageProfile = async (profileName, debugPort, urls) => {
        const manager = new BrowserManager({ debugPort });
        try {
            // Connect to browser
            const { context } = await manager.connectToBrowser(profileName, urls[0]);
            const pages = [];
            // Open additional tabs for remaining URLs
            for (let i = 1; i < urls.length; i++) {
                const newPage = await context.newPage();
                await newPage.goto(urls[i], { timeout: 30000 });
                pages.push(newPage);
            }
            // Get titles from all pages
            const titles = await Promise.all(pages.map(page => page.title()));
            console.log(`\n${profileName} - Tabs opened:`);
            for (let i = 0; i < titles.length; i++) {
                console.log(`  Tab ${i + 1}: ${titles[i]}`);
            }
            // Simulate some work
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Close all pages
            for (const page of pages) {
                await page.close();
            }
            return `${profileName} completed`;
        }
        catch (error) {
            console.error(`❌ Error in profile ${profileName}:`, error);
            return `${profileName} failed`;
        }
        finally {
            await manager.closeBrowser();
        }
    };
    // Define profiles and their URLs
    const profilesConfig = [
        {
            profile: 'my_facebook_profile',
            port: 9221,
            urls: [
                'https://www.facebook.com',
                'https://www.facebook.com/marketplace',
                'https://www.facebook.com/groups'
            ]
        },
        {
            profile: 'my_facebook_profile2',
            port: 9222,
            urls: [
                'https://www.facebook.com',
                'https://www.facebook.com/watch',
                'https://www.facebook.com/gaming'
            ]
        }
    ];
    // Run all profiles in parallel
    const tasks = profilesConfig.map(config => manageProfile(config.profile, config.port, config.urls));
    const results = await Promise.all(tasks);
    console.log('\nAll profiles completed:', results);
    console.log('✅ Use case 2 completed successfully\n');
}
// ============================================================================
// USE CASE 3: Parallel scraping with semaphore control
// ============================================================================
async function useCase3_ParallelScraping() {
    console.log('=== Use Case 3: Parallel scraping with semaphore control ===');
    const csvPath = path.join(__dirname, '../../data.csv');
    const linksToScrape = [
        'https://example.com/page1',
        'https://example.com/page2',
        'https://example.com/page3',
        'https://example.com/page4',
        'https://example.com/page5',
        'https://example.com/page6',
        'https://example.com/page7',
        'https://example.com/page8',
        'https://example.com/page9',
        'https://example.com/page10'
    ];
    const scrapeSingleLink = async (context, link, maxConcurrent) => {
        const scraperPage = await context.newPage();
        try {
            await scraperPage.goto(link, { timeout: 20000, waitUntil: 'domcontentloaded' });
            // Simulate data extraction
            await scraperPage.waitForTimeout(1000);
            const title = await scraperPage.title();
            // Write to CSV
            const csvRow = `${link},${title || 'N/A'},${new Date().toISOString()}\n`;
            fs.appendFileSync(csvPath, csvRow);
            console.log(`✅ Scraped: ${link}`);
            return { url: link, status: 'Success', data: { title } };
        }
        catch (error) {
            console.error(`❌ Failed to scrape ${link}:`, error);
            return { url: link, status: 'Error', error: error instanceof Error ? error.message : 'Unknown error' };
        }
        finally {
            await scraperPage.close();
        }
    };
    const scrapeWithSemaphore = async (maxConcurrent) => {
        const debugPort = 9221;
        const profileName = 'my_facebook_profile';
        const manager = new BrowserManager({ debugPort });
        try {
            // Prepare CSV with header
            const csvHeader = 'URL,Title,ScrapedAt\n';
            fs.writeFileSync(csvPath, csvHeader);
            const { context } = await manager.connectToBrowser(profileName, 'https://www.example.com/', false, 60000);
            console.log(`Starting to scrape ${linksToScrape.length} links with ${maxConcurrent} concurrent tabs...`);
            // Create semaphore-like behavior using batches
            const results = [];
            for (let i = 0; i < linksToScrape.length; i += maxConcurrent) {
                const batch = linksToScrape.slice(i, i + maxConcurrent);
                const batchResults = await Promise.all(batch.map(link => scrapeSingleLink(context, link, maxConcurrent)));
                results.push(...batchResults);
                // Small delay between batches
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            const completed = results.length;
            const success = results.filter(r => r.status === 'Success').length;
            const errors = results.filter(r => r.status === 'Error').length;
            console.log(`\n${'='.repeat(60)}`);
            console.log('✅ Finished!');
            console.log(`Total: ${completed} | Success: ${success} | Errors: ${errors}`);
            console.log(`CSV saved as ${csvPath}`);
            console.log('='.repeat(60));
            return results;
        }
        catch (error) {
            console.error('❌ Scrape failed:', error);
            return [];
        }
        finally {
            await manager.closeBrowser();
        }
    };
    await scrapeWithSemaphore(5); // Limit to 5 concurrent tabs
    console.log('✅ Use case 3 completed successfully\n');
}
// ============================================================================
// USE CASE 4: Dynamic tab management
// ============================================================================
async function useCase4_DynamicTabManagement() {
    console.log('=== Use Case 4: Dynamic tab management ===');
    const debugPort = 9221;
    const profileName = 'my_facebook_profile';
    const manager = new BrowserManager({ debugPort });
    try {
        const { context } = await manager.connectToBrowser(profileName, 'https://www.facebook.com/marketplace');
        // Simulate a list of items to check
        const itemsToCheck = Array.from({ length: 10 }, (_, i) => `https://www.facebook.com/marketplace/item/${i + 1}`);
        // Process items in batches (max 3 tabs at a time)
        const batchSize = 3;
        for (let i = 0; i < itemsToCheck.length; i += batchSize) {
            const batch = itemsToCheck.slice(i, i + batchSize);
            console.log(`Processing batch ${Math.floor(i / batchSize) + 1} with ${batch.length} items...`);
            // Open tabs for this batch
            const tabs = [];
            for (const url of batch) {
                const tab = await context.newPage();
                tabs.push(tab);
                try {
                    await tab.goto(url, { timeout: 10000 });
                    console.log(`  Opened: ${url}`);
                }
                catch (error) {
                    console.error(`  ❌ Failed to open ${url}: ${error}`);
                }
            }
            // Process each tab
            for (let j = 0; j < tabs.length; j++) {
                try {
                    const title = await tabs[j].title();
                    console.log(`  Tab ${j + 1} title: ${title}`);
                    // Simulate some processing
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                catch (error) {
                    console.error(`  ❌ Error processing tab ${j + 1}: ${error}`);
                }
            }
            // Close all tabs in this batch
            for (const tab of tabs) {
                await tab.close();
            }
            console.log(`Batch ${Math.floor(i / batchSize) + 1} completed\n`);
        }
        console.log('✅ Use case 4 completed successfully\n');
    }
    catch (error) {
        console.error('❌ Use case 4 failed:', error);
    }
    finally {
        await manager.closeBrowser();
    }
}
// ============================================================================
// Main execution - run all use cases
// ============================================================================
async function runAllUseCases() {
    console.log('='.repeat(80));
    console.log('BROWSER MANAGER ASYNC EXAMPLES');
    console.log('='.repeat(80));
    try {
        await useCase1_MultipleTabsSameProfile();
        await new Promise(resolve => setTimeout(resolve, 2000));
        await useCase2_MultipleProfilesMultipleTabs();
        await new Promise(resolve => setTimeout(resolve, 2000));
        await useCase3_ParallelScraping();
        await new Promise(resolve => setTimeout(resolve, 2000));
        await useCase4_DynamicTabManagement();
        console.log('='.repeat(80));
        console.log('🎉 ALL USE CASES COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(80));
    }
    catch (error) {
        console.error('💥 Error running use cases:', error);
    }
}
// Run specific use case or all of them
import { fileURLToPath } from 'url';
if (fileURLToPath(import.meta.url) === process.argv[1]) {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        // Run all use cases
        runAllUseCases().catch(console.error);
    }
    else {
        // Run specific use case
        switch (args[0]) {
            case '1':
                useCase1_MultipleTabsSameProfile().catch(console.error);
                break;
            case '2':
                useCase2_MultipleProfilesMultipleTabs().catch(console.error);
                break;
            case '3':
                useCase3_ParallelScraping().catch(console.error);
                break;
            case '4':
                useCase4_DynamicTabManagement().catch(console.error);
                break;
            default:
                console.error('Invalid use case. Use 1, 2, 3, or 4, or no arguments to run all.');
        }
    }
}
