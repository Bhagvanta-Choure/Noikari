import { expect, type Locator, type Page } from '@playwright/test';

export class NaukriLoginPage {
  readonly page: Page;
  readonly loginLink: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginLink = page.locator('#login_Layer');
    this.emailInput = page.locator('input[placeholder="Enter your active Email ID / Username"]');
    this.passwordInput = page.locator('input[placeholder="Enter your password"]');
    this.submitButton = page.getByRole('button', { name: /^login$/i });
  }

  async navigate(): Promise<void> {
    const response = await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    const accessDenied = this.page.getByRole('heading', { name: 'Access Denied' });

    if (response?.status() === 403 || await accessDenied.isVisible()) {
      throw new Error('Naukri denied access from this network or browser session before the login page loaded.');
    }

    await expect(this.loginLink).toBeVisible();
  }

  async login(email: string, password: string): Promise<void> {
    await this.loginLink.click();
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectLoggedIn(): Promise<void> {
    await expect(this.loginLink).not.toBeVisible();
  }
}
