import { test as base } from 'playwright-bdd';
import { NaukriLoginPage } from '../page/NaukriLoginPage';
import { NaukriJobPage } from '../page/NaukriJobPage';
import type { World } from '../type/world';
import { ProfileUpdatePage} from '../page/ProfileUpdatePage';

type Fixtures = {
  naukriLoginPage: NaukriLoginPage;
  naukriJobPage: NaukriJobPage;
  profileUpdatePage: ProfileUpdatePage;
  world: World;
};

export const test = base.extend<Fixtures>({
  naukriLoginPage: async ({ page }, use) => await use(new NaukriLoginPage(page)),
  naukriJobPage: async ({ page }, use) => await use(new NaukriJobPage(page)),
  profileUpdatePage: async ({ page }, use) => await use(new ProfileUpdatePage(page)),
  world: async ({}, use) => await use({} as World),
});
