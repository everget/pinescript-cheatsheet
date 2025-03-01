import { expect, test } from '@playwright/test';

test.describe('Example suite', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('has a headline', async ({ page }) => {
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Pine Script Cheatsheet/);
	});
});
