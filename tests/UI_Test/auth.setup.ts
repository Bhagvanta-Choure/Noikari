import { test as setup } from '@playwright/test';

const authFile = 'naukriAuth.json';

setup('Authenticate to Naukri', async ({ page }) => {
  await page.goto('https://www.naukri.com/nlogin/login');

  // .env मधील credentials भरणे
  await page.locator('#usernameField').fill(process.env.NAUKRI_EMAIL || '');
  await page.locator('#passwordField').fill(process.env.NAUKRI_PASSWORD || '');
  await page.locator('button[type="submit"]').click();

  // Dashboard लोड होईपर्यंत किंवा OTP सोडवण्यासाठी ६० सेकंद वाट पाहणे
  await page.waitForURL('**/mynaukri/**', { timeout: 60_000 });

  // Session Cookies & Local Storage सेव्ह करणे
  await page.context().storageState({ path: authFile });
  console.log('Naukri Session successfully saved to naukriAuth.json');
});