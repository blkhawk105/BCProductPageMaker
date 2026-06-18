import type { Browser, BrowserContext, Page } from 'playwright';
import { chromium } from 'playwright';

let browser: Browser | undefined;

/** Chrome UA that looks like a regular desktop browser — prevents CDN bot blocks. */
const FAKE_UA =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

/** Create a context configured with realistic browser fingerprinting. */
function createContext(browser: Browser): Promise<BrowserContext> {
	return browser.newContext({
		userAgent: FAKE_UA,
		viewport: { width: 1920, height: 1080 }
	});
}

export async function getBrowser(): Promise<Browser> {
	if (!browser) {
		browser = await chromium.launch({
			headless: true,
			args: [
				'--disable-blink-features=AutomationControlled',
				'--no-first-run',
				'--no-default-browser-check',
				'--disable-dev-shm-usage',
				'--disable-extensions',
				'--disable-gpu'
			]
		});
	}
	return browser!;
}

/** Create a stealth page with anti-detection init scripts. */
export async function createStealthPage(browser: Browser): Promise<Page> {
	const context = await createContext(browser);

	await context.addInitScript(() => {
		// Override navigator.webdriver (set to true in automated browsers)
		Object.defineProperty(navigator, 'webdriver', { get: () => false });

		// Patch navigator.plugins / languages that bot-detection checks look for
		if (!Object.getOwnPropertyDescriptor(window.navigator, 'plugins')) {
			Object.defineProperty(window.navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
		}
		if (!Object.getOwnPropertyDescriptor(window.navigator, 'languages')) {
			Object.defineProperty(window.navigator, 'languages', { get: () => ['en-US', 'en'] });
		}

		// Prevent permissions from revealing automation
		const _permQuery = window.navigator.permissions.query.bind(window.navigator.permissions);
		window.navigator.permissions.query = function (desc: unknown) {
			if ((desc as { name?: string } | null)?.name === 'notifications') {
				return Promise.resolve({ state: Notification.permission } as PermissionStatus);
			}
			return _permQuery(desc as Parameters<typeof _permQuery>[0]);
		};
	});

	return context.newPage();
}

export async function fetchPageText(url: string): Promise<string> {
	const browser = await getBrowser();
	const page = await createStealthPage(browser);

	try {
		await page.goto(url, { waitUntil: 'domcontentloaded' });
		return await page.evaluate(() => document.body.innerText);
	} finally {
		await page.close();
	}
}

export async function closeBrowser(): Promise<void> {
	if (browser) {
		await browser.close();
		browser = undefined;
	}
}
