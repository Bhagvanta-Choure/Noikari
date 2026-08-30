import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import 'dotenv/config';

const testDir = defineBddConfig({
  features: 'tests/UI_Test/feature/**/*.feature',
  steps: ['tests/UI_Test/steps/**/*.ts', 'tests/UI_Test/fixture/**/*.ts'],
});

export default defineConfig({
  testDir,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: 'https://www.naukri.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
