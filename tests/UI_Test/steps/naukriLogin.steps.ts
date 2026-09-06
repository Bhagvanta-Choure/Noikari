import { createBdd } from 'playwright-bdd';
import { test } from '../fixture/fixtures';

const { Given, When, Then } = createBdd(test);

Given('I navigate to the Naukri homepage', async ({ naukriLoginPage }) => {
  await naukriLoginPage.navigate();
});

When('I log in to Naukri with valid credentials', async ({ naukriLoginPage }) => {
  const { NAUKRI_EMAIL: email, NAUKRI_PASSWORD: password } = process.env;

  if (!email || !password) {
    throw new Error('Missing NAUKRI_EMAIL or NAUKRI_PASSWORD. Add valid credentials to .env.');
  }

  await naukriLoginPage.login(email, password);
});

Then('I should be logged in to Naukri successfully', async ({ naukriLoginPage }) => {
  await naukriLoginPage.expectLoggedIn();
});

When('I search for {string} jobs in {string}', async ({ naukriJobPage }, role: string, location: string) => {
  await naukriJobPage.searchJobs(role, location);
});

Then('I apply to top {int} easy apply jobs', async ({ naukriJobPage }, count: number) => {
  // A real Naukri application can take several seconds; the global 30-second
  // timeout is not enough for a batch of applications.
  test.setTimeout(10 * 60 * 1000);
  await naukriJobPage.applyToTopJobs(count);
});
