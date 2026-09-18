import { expect, type Locator, type Page } from '@playwright/test';

export class NaukriJobPage {
  readonly page: Page;
  readonly jobResultsWrapper: Locator;
  readonly jobLinks: Locator;
  readonly applyButton: Locator;
  readonly applyButtonFirstOnly: Locator;
  readonly externalApplyControl: Locator;
  readonly nextPageLink: Locator;
  readonly applicationDialog: Locator;
  readonly submitButton: Locator;
  readonly requiresAnswersText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.jobResultsWrapper = page.locator('.srp-jobtuple-wrapper, article').first();
    this.jobLinks = page.locator('a[href*="/job-listings-"]');
    this.applyButton = page.getByRole('button', { name: /^(apply|apply now)$/i });
    this.applyButtonFirstOnly = this.applyButton.first();
    this.externalApplyControl = page.getByRole('button', {
      name: /apply.*(company|employer|external|website|site)/i,
    }).or(page.getByRole('link', {
      name: /apply.*(company|employer|external|website|site)/i,
    }));
    this.nextPageLink = page.getByRole('link', { name: /next/i }).first();
    this.applicationDialog = page.getByRole('dialog').last();
    this.submitButton = this.applicationDialog.getByRole('button', {
      name: /^(apply|submit application|continue to apply)$/i,
    });
    this.requiresAnswersText = page.getByText(/answer.*question|add.*answer|required question/i);
  }

  async searchJobs(role: string, location: string): Promise<void> {
    const roleSlug = this.toSearchSlug(role);
    const locationSlug = this.toSearchSlug(location);
    await this.page.goto(`/${roleSlug}-jobs-in-${locationSlug}`, { waitUntil: 'domcontentloaded' });
    await this.jobResultsWrapper.waitFor({ state: 'visible' });
  }

  /**
   * Applies only through Naukri's own "Apply" action. Jobs that mention an
   * external/company-site application are ignored and are never opened.
   */
  async applyToTopJobs(count: number): Promise<void> {
    if (count < 1) {
      throw new Error('The number of jobs to apply for must be at least 1.');
    }

    let applied = 0;
    const visitedJobs = new Set<string>();
    this.logStart(count);

    while (applied < count) {
      const resultsUrl = this.page.url();
      const jobUrls = await this.getJobUrls();
      this.logInfo(`Found ${jobUrls.length} jobs on this results page.`);

      for (const jobUrl of jobUrls) {
        if (applied === count) {
          break;
        }

        if (visitedJobs.has(jobUrl)) {
          continue;
        }
        visitedJobs.add(jobUrl);
        const jobNumber = visitedJobs.size;
        const jobLabel = this.jobLabel(jobUrl);
        this.logJob(jobNumber, jobLabel);

        await this.page.goto(jobUrl, { waitUntil: 'domcontentloaded' });
        await this.ensureStillOnNaukri();

        if (await this.hasExternalApplication()) {
          this.logSkip(jobNumber, 'External/company website', jobLabel);
          await this.page.goto(resultsUrl, { waitUntil: 'domcontentloaded' });
          await this.jobResultsWrapper.waitFor({ state: 'visible', timeout: 10000 });
          continue;
        }

        if (!(await this.applyButtonFirstOnly.isVisible())) {
          this.logSkip(jobNumber, 'No Naukri Apply button', jobLabel);
          await this.page.goto(resultsUrl, { waitUntil: 'domcontentloaded' });
          await this.jobResultsWrapper.waitFor({ state: 'visible', timeout: 10000 });
          continue;
        }

        const urlBeforeApply = this.page.url();
        this.logInfo(`Applying through Naukri: ${jobLabel}`);
        await this.applyButtonFirstOnly.click();

        await this.ensureStillOnNaukri(urlBeforeApply);
        await this.completeNaukriApplication();
        applied += 1;
        this.logSuccess(applied, count, jobLabel);
        await this.page.goto(resultsUrl, { waitUntil: 'domcontentloaded' });
        // Wait for job results to load after returning to results page
        await this.jobResultsWrapper.waitFor({ state: 'visible', timeout: 10000 });
        
      }

      if (applied === count) {
        break;
      }

      if (!(await this.nextPageLink.isVisible())) {
        break;
      }

      const nextPageUrl = await this.nextPageLink.getAttribute('href');
      if (!nextPageUrl) {
        break;
      }

      this.logInfo('Moving to the next results page.');
      await this.page.goto(nextPageUrl, { waitUntil: 'domcontentloaded' });
      await this.jobResultsWrapper.waitFor();
    }

    this.logSummary(applied, count, visitedJobs.size);
    expect(
      applied,
      `Only ${applied} in-platform Easy Apply jobs were available; ${count} were requested.`
    ).toBe(count);
  }

  private async getJobUrls(): Promise<string[]> {
    return this.jobLinks.evaluateAll(links =>
      [...new Set(links.map(link => (link as HTMLAnchorElement).href))]
    );
  }

  private async hasExternalApplication(): Promise<boolean> {
    return await this.externalApplyControl.isVisible();
  }

  private async completeNaukriApplication(): Promise<void> {
    if (!(await this.applicationDialog.isVisible())) {
      return;
    }

    if (await this.submitButton.isVisible()) {
      await this.submitButton.click();
      await this.ensureStillOnNaukri();
    }

    if (await this.requiresAnswersText.isVisible()) {
      throw new Error('Naukri requires application answers. Complete them manually before rerunning this scenario.');
    }
  }

  private async ensureStillOnNaukri(previousUrl?: string): Promise<void> {
    await this.page.waitForTimeout(400);
    const currentUrl = new URL(this.page.url());

    const isNaukriDomain = currentUrl.hostname === 'naukri.com' || currentUrl.hostname.endsWith('.naukri.com');
    if (!isNaukriDomain) {
      throw new Error(`Stopped to avoid an external application website: ${currentUrl.hostname}`);
    }

    if (previousUrl && this.page.url() !== previousUrl) {
      await expect(this.page).toHaveURL(/naukri\.com/);
    }
  }

  private toSearchSlug(value: string): string {
    return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  private logStart(target: number): void {
    console.log(`\n╔══════════════════════════════════════════════╗\n║              NAUKRI EASY APPLY                ║\n║  Target: ${String(target).padStart(2, ' ')} in-platform applications             ║\n╚══════════════════════════════════════════════╝`);
  }

  private logJob(number: number, label: string): void {
    console.log(`\n[${String(number).padStart(2, '0')}] 🔎 Checking  ${label}`);
  }

  private logSuccess(applied: number, target: number, label: string): void {
    console.log(`     ✅ APPLIED  ${applied}/${target}  •  ${label}`);
  }

  private logSkip(number: number, reason: string, label: string): void {
    console.log(`     ↷ SKIPPED  #${String(number).padStart(2, '0')}  •  ${reason}  •  ${label}`);
  }

  private logInfo(message: string): void {
    console.log(`     ℹ ${message}`);
  }

  private logSummary(applied: number, target: number, reviewed: number): void {
    const result = applied === target ? 'COMPLETE' : 'INCOMPLETE';
    console.log(`\n╔══════════════════════════════════════════════╗\n║  ${result.padEnd(10)} Applied: ${String(applied).padStart(2, ' ')}/${target}  •  Reviewed: ${String(reviewed).padStart(2, ' ')}          ║\n╚══════════════════════════════════════════════╝\n`);
  }

  private jobLabel(jobUrl: string): string {
    const slug = new URL(jobUrl).pathname
      .replace('/job-listings-', '')
      .replace(/-\d+-to-\d+-years-.+$/, '')
      .replace(/-/g, ' ');
    const title = decodeURIComponent(slug).replace(/\b\w/g, letter => letter.toUpperCase());

    return title.length > 64 ? `${title.slice(0, 61)}...` : title;
  }
}
