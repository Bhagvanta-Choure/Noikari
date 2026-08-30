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
