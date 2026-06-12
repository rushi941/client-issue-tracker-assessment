import { chromium } from "playwright";
import { mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "../client/public/screenshots");
const BASE = "http://localhost:5173";

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, name), fullPage: true });
  console.log("Saved", name);
}

async function login(page, email, password) {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState("networkidle");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForLoadState("networkidle");
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // 01 Login
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState("networkidle");
  await shot(page, "01-login-page.png");

  // Client flow
  await login(page, "client@demo.com", "demo123");
  await page.waitForURL("**/dashboard");
  await shot(page, "02-client-dashboard.png");

  await page.goto(`${BASE}/issues/new`);
  await page.waitForLoadState("networkidle");
  await shot(page, "03-create-issue.png");

  await page.goto(`${BASE}/issues`);
  await page.waitForLoadState("networkidle");
  await page.locator('a[href*="/issues/"]').first().click();
  await page.waitForLoadState("networkidle");
  await shot(page, "04-issue-detail.png");

  // Scroll to timeline if present
  const timeline = page.getByText("Activity Timeline");
  if (await timeline.count()) {
    await timeline.scrollIntoViewIfNeeded();
  }
  await shot(page, "05-issue-timeline.png");

  // Notifications - open bell
  await page.locator('button[aria-label="Notifications"]').click();
  await page.waitForTimeout(500);
  await shot(page, "09-notifications.png");
  await page.keyboard.press("Escape");

  // Manager flow
  await page.goto(`${BASE}/login`);
  await login(page, "manager@demo.com", "demo123");
  await page.waitForURL("**/manager");
  await shot(page, "06-manager-dashboard.png");

  await page.goto(`${BASE}/manager/issues`);
  await page.waitForLoadState("networkidle");
  await shot(page, "07-manager-issue-queue.png");

  await page.locator('a[href*="/manager/issues/"]').first().click();
  await page.waitForLoadState("networkidle");
  await shot(page, "08-manager-manage-issue.png");

  await browser.close();
  console.log("All screenshots saved to client/public/screenshots/");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
