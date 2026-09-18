import { expect, type Locator, type Page } from '@playwright/test';

export class ProfileUpdatePage {
    readonly page: Page;
    readonly viewProfileLink: Locator;
    readonly editKeySkillElement: Locator;
    constructor(page: Page) {
        this.page = page;

        this.viewProfileLink = page.getByRole('link', { name: 'View profile' });
        this.editKeySkillElement = page.locator('.edit.icon');
    }
    async clickOnViewProfile(): Promise<void> {
        await this.viewProfileLink.click();
    }
    async updateKeySkill(): Promise<void> {
        await this.editKeySkillElement.click();
    }

}