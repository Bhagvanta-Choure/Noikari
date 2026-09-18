import { createBdd } from 'playwright-bdd';
import { expect, type Locator } from '@playwright/test';
import { test } from '../fixture/fixtures';

const { Given, When, Then } = createBdd(test);

Given('the user is logged into the job portal', async ({ naukriLoginPage }) => {
  await naukriLoginPage.navigate();

  const { NAUKRI_EMAIL: email, NAUKRI_PASSWORD: password } = process.env;
  if (!email || !password) {
    throw new Error('Missing NAUKRI_EMAIL or NAUKRI_PASSWORD. Add valid credentials to .env.');
  }

  await naukriLoginPage.login(email, password);
  await naukriLoginPage.expectLoggedIn();
});

When('the user searches for {string} with {string}', async ({ page }, role: string, experience: string) => {
  await page.locator('input[placeholder*="keyword"]').fill(role);
  await page.locator('#experienceDD').click();
  await page.locator(`ul.dropdown li:has-text("${experience}")`).click();
  await page.locator('.qsbSubmit').click();
  await page.waitForLoadState('domcontentloaded');
});

When('filters the job location by {string}', async ({ page }, location: string) => {
  const locationCheckbox: Locator = page.locator(`label:has-text("${location}") input[type="checkbox"]`);
  await locationCheckbox.check();
  await page.waitForLoadState('networkidle');
});

Then('the user reviews the available job listings', async ({ page }) => {
  await page.locator('.srp-jobtuple-wrapper, article').first().waitFor({ state: 'visible' });
});

Then(
  'applies only to jobs with direct application and skips external redirects',
  async ({ page }) => {
    const jobCards = await page.locator('.srp-jobtuple-wrapper, article').all();

    for (const card of jobCards) {
      const isCompanySiteRedirect = (await card.locator('.redirect-badge, .external-apply').count()) > 0;

      if (isCompanySiteRedirect) {
        console.log('Skipping: Requires redirection to external company career page.');
        continue;
      }

      const directApplyButton: Locator = card.locator('button:has-text("Apply"), .easy-apply');
      if (await directApplyButton.isVisible()) {
        await directApplyButton.click();
        console.log('Applied directly through the portal.');
      }
    }
  }
);