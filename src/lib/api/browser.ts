import { chromium, type Browser, type Page } from 'playwright';

let browser: Browser | null = null;

export async function getBrowser(): Promise<Browser> {
	if (!browser) {
		browser = await chromium.launch({ headless: true });
	}

	return browser;
}

export async function fetchPageText(url: string): Promise<string> {
	const browser = await getBrowser();
	const page: Page = await browser.newPage();

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
		browser = null;
	}
}
