import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { AxePuppeteer } from "@axe-core/puppeteer";

export interface Issue {
  id: string;
  description: string;
  impact: string | null | undefined;
}

// 🧩 Enable stealth plugin to bypass bot detection
puppeteer.use(StealthPlugin());

// ✅ Return both issues and screenshot
export async function runAxeOnURL(url: string): Promise<{ issues: Issue[]; screenshot: string }> {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
        "--disable-features=IsolateOrigins,site-per-process",
      ],
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );

    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
    });

    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => false,
      });
    });

    console.log("🔍 Navigating to:", url);

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    await new Promise((resolve) => setTimeout(resolve, 3000));

    // ✅ Take screenshot
    const screenshotBuffer = await page.screenshot({
      type: "jpeg",
      quality: 80,
      fullPage: true,
    });

    const screenshot = screenshotBuffer.toString("base64");

    console.log("🧪 Running Axe accessibility analysis...");
    const results = await new AxePuppeteer(page).analyze();

    const issues: Issue[] = results.violations.map((violation) => ({
      id: violation.id,
      description: violation.description,
      impact: violation.impact,
    }));

    console.log(`✅ Found ${issues.length} accessibility issues.`);

    return { issues, screenshot };
  } catch (error: any) {
    console.error("❌ Axe Analysis Error:", error);

    if (
      error.message.includes("net::ERR_HTTP2_PROTOCOL_ERROR") ||
      error.message.includes("net::ERR_FAILED") ||
      error.message.includes("Navigation timeout")
    ) {
      throw new Error("This website blocks automated scanning or took too long to load.");
    }

    throw new Error(`Analysis failed: ${error.message}`);
  } finally {
    if (browser) await browser.close();
  }
}
