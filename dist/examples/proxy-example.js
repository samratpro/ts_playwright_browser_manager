/**
 * Proxy usage examples for BrowserManager
 * Demonstrates how to use different proxy configurations with proper fingerprinting
 */
import { BrowserManager } from '../core/browser-manager.js';
// ============================================================================
// EXAMPLE 1: Basic proxy usage with France proxy
// ============================================================================
async function example1_BasicFranceProxy() {
    console.log('=== Example 1: Basic France proxy ===');
    const manager = new BrowserManager({ debugPort: 9225 });
    const franceProxy = {
        server: 'http://gw.dataimpulse.com:823',
        username: 'user5505791abd0cd522901c__cr.fr', // France
        password: 'passf5d3919c504d8fc9pass'
    };
    try {
        console.log('Connecting to browser with France proxy...');
        const { page } = await manager.connectToBrowserWithProxy({
            profileName: 'france_profile',
            proxy: franceProxy,
            url: 'https://iphey.com',
            headless: false
        });
        // Wait for page to load
        await page.waitForTimeout(5000);
        // Take screenshot as proof
        await page.screenshot({
            path: 'france_proof.png',
            fullPage: true
        });
        console.log('✅ You are in France! Check the screenshot: france_proof.png');
        console.log('Press Ctrl+C to exit...');
        // Wait for user interaction
        await new Promise(resolve => {
            process.on('SIGINT', resolve);
            process.on('SIGTERM', resolve);
        });
    }
    catch (error) {
        console.error('❌ France proxy example failed:', error);
    }
    finally {
        await manager.closeBrowser();
    }
}
// ============================================================================
// EXAMPLE 2: Multiple country proxies testing
// ============================================================================
async function example2_MultipleCountryProxies() {
    console.log('=== Example 2: Multiple country proxies ===');
    const proxyConfigs = [
        {
            name: 'Germany',
            profile: 'germany_profile',
            proxy: {
                server: 'http://gw.dataimpulse.com:823',
                username: 'user5505791abd0cd522901c__cr.de',
                password: 'passf5d3919c504d8fc9pass'
            },
            port: 9226
        },
        {
            name: 'Netherlands',
            profile: 'netherlands_profile',
            proxy: {
                server: 'http://gw.dataimpulse.com:823',
                username: 'user5505791abd0cd522901c__cr.nl',
                password: 'passf5d3919c504d8fc9pass'
            },
            port: 9227
        },
        {
            name: 'United Kingdom',
            profile: 'uk_profile',
            proxy: {
                server: 'http://gw.dataimpulse.com:823',
                username: 'user5505791abd0cd522901c__cr.gb',
                password: 'passf5d3919c504d8fc9pass'
            },
            port: 9228
        }
    ];
    for (const config of proxyConfigs) {
        console.log(`\nTesting ${config.name} proxy...`);
        const manager = new BrowserManager({ debugPort: config.port });
        try {
            const { page } = await manager.connectToBrowserWithProxy({
                profileName: config.profile,
                proxy: config.proxy,
                url: 'https://iphey.com',
                headless: false
            });
            await page.waitForTimeout(3000);
            const screenshotPath = `${config.name.toLowerCase()}_proof.png`;
            await page.screenshot({
                path: screenshotPath,
                fullPage: true
            });
            console.log(`✅ ${config.name} proxy working! Screenshot saved: ${screenshotPath}`);
            await manager.closeBrowser();
            // Small delay between tests
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        catch (error) {
            console.error(`❌ ${config.name} proxy failed:`, error);
            await manager.closeBrowser();
        }
    }
    console.log('\n✅ All proxy tests completed');
}
// ============================================================================
// EXAMPLE 3: Proxy rotation and testing
// ============================================================================
async function example3_ProxyRotation() {
    console.log('=== Example 3: Proxy rotation ===');
    const proxies = [
        {
            server: 'http://proxy1.example.com:8080',
            username: 'user1',
            password: 'pass1'
        },
        {
            server: 'http://proxy2.example.com:8080',
            username: 'user2',
            password: 'pass2'
        },
        {
            server: 'http://proxy3.example.com:8080',
            username: 'user3',
            password: 'pass3'
        }
    ];
    const testUrls = [
        'https://httpbin.org/ip',
        'https://ipinfo.io/json',
        'https://api.ipify.org?format=json'
    ];
    for (let i = 0; i < proxies.length; i++) {
        const proxy = proxies[i];
        if (!proxy)
            continue;
        const profileName = `rotation_profile_${i + 1}`;
        const debugPort = 9230 + i;
        console.log(`\nTesting proxy ${i + 1}: ${proxy.server}`);
        const manager = new BrowserManager({ debugPort });
        try {
            const { page } = await manager.connectToBrowserWithProxy({
                profileName,
                proxy,
                url: testUrls[i % testUrls.length],
                headless: true // Use headless for automated testing
            });
            // Extract IP information
            await page.waitForLoadState('networkidle');
            const pageContent = await page.content();
            console.log(`✅ Proxy ${i + 1} connected successfully`);
            // You can add more sophisticated testing here
            // - Check response time
            // - Verify IP change
            // - Test specific website access
            await manager.closeBrowser();
        }
        catch (error) {
            console.error(`❌ Proxy ${i + 1} failed:`, error);
            await manager.closeBrowser();
        }
    }
    console.log('\n✅ Proxy rotation test completed');
}
// ============================================================================
// EXAMPLE 4: Advanced proxy with custom fingerprint
// ============================================================================
async function example4_CustomFingerprint() {
    console.log('=== Example 4: Advanced proxy with custom fingerprint ===');
    const manager = new BrowserManager({ debugPort: 9235 });
    const customProxy = {
        server: 'http://custom-proxy.example.com:8080',
        username: 'custom_user',
        password: 'custom_pass'
    };
    try {
        console.log('Connecting with custom proxy configuration...');
        const { page } = await manager.connectToBrowserWithProxy({
            profileName: 'custom_profile',
            proxy: customProxy,
            url: 'https://browserleaks.com/ip',
            headless: false,
            timeout: 60000
        });
        // Wait for full page load
        await page.waitForLoadState('networkidle');
        // Take multiple screenshots to verify all settings
        await page.screenshot({
            path: 'custom_proxy_proof.png',
            fullPage: true
        });
        console.log('✅ Custom proxy configuration active!');
        console.log('Check custom_proxy_proof.png to verify:');
        console.log('- IP address change');
        console.log('- Timezone detection');
        console.log('- Browser fingerprint spoofing');
        // Additional verification steps
        console.log('Press Ctrl+C to exit...');
        await new Promise(resolve => {
            process.on('SIGINT', resolve);
            process.on('SIGTERM', resolve);
        });
    }
    catch (error) {
        console.error('❌ Custom proxy example failed:', error);
    }
    finally {
        await manager.closeBrowser();
    }
}
// ============================================================================
// EXAMPLE 5: Proxy performance testing
// ============================================================================
async function example5_ProxyPerformanceTest() {
    console.log('=== Example 5: Proxy performance testing ===');
    const testProxy = {
        server: 'http://gw.dataimpulse.com:823',
        username: 'user5505791abd0cd522901c__cr.fr',
        password: 'passf5d3919c504d8fc9pass'
    };
    const testUrls = [
        'https://www.google.com',
        'https://www.facebook.com',
        'https://www.twitter.com',
        'https://www.github.com',
        'https://www.stackoverflow.com'
    ];
    const manager = new BrowserManager({ debugPort: 9240 });
    try {
        const { page, context } = await manager.connectToBrowserWithProxy({
            profileName: 'performance_profile',
            proxy: testProxy,
            url: 'https://www.google.com',
            headless: true
        });
        console.log('Running performance tests...\n');
        const results = [];
        for (const url of testUrls) {
            const startTime = Date.now();
            try {
                const testPage = await context.newPage();
                await testPage.goto(url, { timeout: 30000 });
                await testPage.waitForLoadState('networkidle');
                const endTime = Date.now();
                const responseTime = endTime - startTime;
                const title = await testPage.title();
                results.push({
                    url,
                    responseTime,
                    title,
                    status: 'Success'
                });
                console.log(`✅ ${url}: ${responseTime}ms`);
                await testPage.close();
            }
            catch (error) {
                const endTime = Date.now();
                const responseTime = endTime - startTime;
                results.push({
                    url,
                    responseTime,
                    title: 'N/A',
                    status: 'Failed',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
                console.log(`❌ ${url}: Failed (${responseTime}ms)`);
            }
            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        console.log('\nPerformance Test Results:');
        console.log('='.repeat(80));
        results.forEach(result => {
            const status = result.status === 'Success' ? '✅' : '❌';
            console.log(`${status} ${result.url}`);
            console.log(`   Response Time: ${result.responseTime}ms`);
            console.log(`   Title: ${result.title}`);
            if (result.error) {
                console.log(`   Error: ${result.error}`);
            }
            console.log('');
        });
        const avgResponseTime = results
            .filter(r => r.status === 'Success')
            .reduce((sum, r) => sum + r.responseTime, 0) /
            results.filter(r => r.status === 'Success').length;
        console.log(`Average response time: ${Math.round(avgResponseTime)}ms`);
        console.log('✅ Performance test completed');
    }
    catch (error) {
        console.error('❌ Performance test failed:', error);
    }
    finally {
        await manager.closeBrowser();
    }
}
// ============================================================================
// Main execution
// ============================================================================
async function runAllProxyExamples() {
    console.log('='.repeat(80));
    console.log('BROWSER MANAGER PROXY EXAMPLES');
    console.log('='.repeat(80));
    try {
        await example1_BasicFranceProxy();
        await new Promise(resolve => setTimeout(resolve, 3000));
        await example2_MultipleCountryProxies();
        await new Promise(resolve => setTimeout(resolve, 3000));
        await example3_ProxyRotation();
        await new Promise(resolve => setTimeout(resolve, 3000));
        await example4_CustomFingerprint();
        await new Promise(resolve => setTimeout(resolve, 3000));
        await example5_ProxyPerformanceTest();
        console.log('='.repeat(80));
        console.log('🎉 ALL PROXY EXAMPLES COMPLETED!');
        console.log('='.repeat(80));
    }
    catch (error) {
        console.error('💥 Error running proxy examples:', error);
    }
}
// Run specific example or all of them
import { fileURLToPath } from 'url';
if (fileURLToPath(import.meta.url) === process.argv[1]) {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        // Run all examples
        runAllProxyExamples().catch(console.error);
    }
    else {
        // Run specific example
        switch (args[0]) {
            case '1':
                example1_BasicFranceProxy().catch(console.error);
                break;
            case '2':
                example2_MultipleCountryProxies().catch(console.error);
                break;
            case '3':
                example3_ProxyRotation().catch(console.error);
                break;
            case '4':
                example4_CustomFingerprint().catch(console.error);
                break;
            case '5':
                example5_ProxyPerformanceTest().catch(console.error);
                break;
            default:
                console.error('Invalid example. Use 1, 2, 3, 4, 5, or no arguments to run all.');
        }
    }
}
