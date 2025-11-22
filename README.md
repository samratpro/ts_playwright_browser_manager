# 🎭 TypeScript Playwright Browser Manager

A powerful TypeScript-based Browser Manager for Playwright that simplifies managing persistent browser profiles, proxy configurations, and multi-tab automation with advanced fingerprinting capabilities.

## ✨ Key Features
- 🔄 **Persistent Browser Profiles** - Save and reuse browser sessions across runs  
- 🌍 **Proxy Management** - Built-in proxy support with automatic fingerprinting  
- 🎯 **Multi-Browser Support** - Chrome, Edge, Brave, Chromium, and custom browsers  
- 📱 **Multi-Tab Automation** - Manage multiple browser tabs efficiently  
- 🛡️ **Advanced Fingerprinting** - Country-specific browser fingerprinting  
- 🚀 **Easy Integration** - Simple API for quick setup and use  
- 📝 **TypeScript Support** - Full type definitions included  

## 📦 Installation

### **Method 1: Install from GitHub (Recommended)**
```bash
npm install github:samratpro/ts_playwright_browser_manager
```

### **Method 2: Clone and Build Locally**
```bash
git clone https://github.com/samratpro/ts_playwright_browser_manager.git
cd ts_playwright_browser_manager
npm install
npm run build
```

### **Method 3: Add as Git Submodule**
```bash
git submodule add https://github.com/samratpro/ts_playwright_browser_manager.git libs/playwright-browser-manager
cd libs/playwright-browser-manager
npm install
npm run build
```

### **Method 4: Copy Built Files**
```bash
git clone https://github.com/samratpro/ts_playwright_browser_manager.git
cd ts_playwright_browser_manager
npm install
npm run build

# Copy dist/ to your project
```

## 🚀 Quick Start

### **Basic Usage Without Proxy**
```ts
import { BrowserManager } from 'ts_playwright_browser_manager';

const manager = new BrowserManager({ debugPort: 9221 });

async function main() {
  try {
    const { page, context, browser } = await manager.connectToBrowser(
      'my_profile',
      'https://example.com'
    );

    console.log('Page title:', await page.title());
    await page.goto('https://google.com');
  } finally {
    await manager.closeBrowser();
  }
}

main().catch(console.error);
```

### **Usage with Proxy**
```ts
import { BrowserManager, type ProxyConfig } from 'ts_playwright_browser_manager';

const manager = new BrowserManager({ debugPort: 9222 });

const proxyConfig: ProxyConfig = {
  server: 'http://proxy.example.com:8080',
  username: 'your_username',
  password: 'your_password'
};

async function main() {
  try {
    const { page } = await manager.connectToBrowserWithProxy({
      profileName: 'proxy_profile',
      proxy: proxyConfig,
      url: 'https://iphey.com',
      headless: false
    });

    console.log('Connected with proxy!');
    await page.waitForTimeout(5000);
  } finally {
    await manager.closeBrowser();
  }
}

main().catch(console.error);
```

## ⚙️ Configuration Options

### **BrowserManager Options**
```ts
interface BrowserManagerOptions {
  baseProfileDir?: string;
  browserPath?: string;
  debugPort?: number;
}
```

### **Browser Launch Options**
```ts
interface BrowserLaunchOptions {
  profileName: string;
  url?: string;
  waitMessage?: string;
  headless?: boolean;
  timeout?: number;
}
```

### **Proxy Configuration**
```ts
interface ProxyConfig {
  server: string;
  username?: string;
  password?: string;
}
```

## 🎯 Advanced Usage Examples

### **Profile Management**
```ts
import { BrowserManager } from 'ts_playwright_browser_manager';

const manager = new BrowserManager({ debugPort: 9221 });

async function profileExample() {
  const profileName = 'facebook_profile';

  if (!manager.profileExists(profileName)) {
    console.log('Setting up new profile...');
    await manager.setupProfile(
      profileName,
      'https://www.facebook.com',
      'Please login and close the browser to save session.'
    );
  }

  const { page } = await manager.connectToBrowser(profileName);
  console.log('Using existing profile!');
  await manager.closeBrowser();
}
```

### **Multi-Profile Management**
```ts
async function multiProfileExample() {
  const manager1 = new BrowserManager({ debugPort: 9221 });
  if (manager1.profileExists('facebook_profile')) {
    const { page } = await manager1.connectToBrowser('facebook_profile', 'https://facebook.com');
    await manager1.closeBrowser();
  }

  const manager2 = new BrowserManager({ debugPort: 9222 });
  if (manager2.profileExists('twitter_profile')) {
    const { page } = await manager2.connectToBrowser('twitter_profile', 'https://twitter.com');
    await manager2.closeBrowser();
  }
}
```

### **Proxy with Country Fingerprinting**
```ts
import { BrowserManager, getFingerprintForProxy } from 'ts_playwright_browser_manager';

const manager = new BrowserManager({ debugPort: 9223 });

const franceProxy = {
  server: 'http://gw.dataimpulse.com:823',
  username: 'user5505791abd0cd522901c__cr.fr',
  password: 'passf5d3919c504d8fc9pass'
};

async function countryProxyExample() {
  try {
    const { page } = await manager.connectToBrowserWithProxy({
      profileName: 'france_profile',
      proxy: franceProxy,
      url: 'https://iphey.com',
      headless: false
    });

    await page.screenshot({ path: 'france_proof.png', fullPage: true });
    console.log('You appear to be browsing from France!');
  } finally {
    await manager.closeBrowser();
  }
}
```

### **Async Multi-Tab Operations**
```ts
async function asyncMultiTabExample() {
  const manager = new BrowserManager({ debugPort: 9224 });

  try {
    const { page, context } = await manager.connectToBrowser(
      'multi_tab_profile',
      'https://google.com'
    );

    const urls = [
      'https://github.com',
      'https://stackoverflow.com',
      'https://medium.com'
    ];

    const results = await Promise.all(
      urls.map(async url => {
        const newPage = await context.newPage();
        await newPage.goto(url);
        const title = await newPage.title();
        await newPage.close();
        return { url, title };
      })
    );

    console.log('Results:', results);
  } finally {
    await manager.closeBrowser();
  }
}
```

## 🔧 API Reference

### **Main Classes**

#### **BrowserManager**
```ts
new BrowserManager(options?: BrowserManagerOptions)
```

**Methods:**
```ts
profileExists(profileName: string): boolean
setupProfile(...): Promise<void>
connectToBrowser(...): Promise<BrowserConnectionResult>
connectToBrowserWithProxy(...): Promise<BrowserConnectionResult>
closeBrowser(): Promise<void>
dispose(): Promise<void>
```

### **Utility Functions**
```ts
detectCountry(username: string): string
getFingerprintForProxy(username: string): BrowserFingerprint
countryFromDataimpulseUsername(username: string): string
```

### **Types**
```ts
interface BrowserConnectionResult {
  page: Page;
  context: BrowserContext;
  browser: Browser;
}

type BrowserType = 'chrome' | 'edge' | 'brave' | 'chromium' | 'comet';
```

## 🛠️ Project Setup

### **Prerequisites**
- Node.js ≥ 18  
- Desktop Browser (Chrome/Edge/Brave/Chromium)  
- TypeScript environment  

### **Development Scripts**
```bash
npm run build
npm run typecheck
npm run start:sync-example
npm run dev:sync-example
```

### **Examples**
- sync-example.ts  
- async-example.ts  
- proxy-example.ts  

## 🚨 Troubleshooting

### **TypeScript Import Errors**
```bash
npm install
npm run build
```

### **Browser Not Found**
```ts
const manager = new BrowserManager({
  browserPath: '/path/to/chrome',
  debugPort: 9221
});
```

### **Proxy Issues**
```ts
const { page } = await manager.connectToBrowserWithProxy({
  profileName: 'test_profile',
  proxy: testProxy,
  headless: true
});
```

## 📝 Integration Examples

### **Express.js**
```ts
import express from 'express';
import { BrowserManager } from 'ts_playwright_browser_manager';
```

### **Jest**
```ts
import { BrowserManager } from 'ts_playwright_browser_manager';
```

## 🤝 Contributing
1. Fork repo  
2. Create branch  
3. Commit changes  
4. Push  
5. Open PR  

## 📄 License
ISC License

## 🔗 Links
- GitHub Repository  
- Playwright Docs  
- TypeScript Docs  

---

**Happy Browser Automating! 🎉**
