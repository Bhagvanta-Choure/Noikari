import { test as base } from 'playwright-bdd';
import { NaukriLoginPage } from '../page/NaukriLoginPage';

import type { World } from '../type/world';


type Fixtures = {
  naukriLoginPage: NaukriLoginPage;
  world: World;
};

export const test = base.extend<Fixtures>({
  naukriLoginPage: async ({ page }, use) => await use(new NaukriLoginPage(page)),
  world: async ({}, use) => await use({} as World),
});
