import { expect, test } from '@playwright/test';

test('product spec project persists its accepted artifact across reloads', async ({ page }) => {
	test.setTimeout(60_000);
	await page.goto('/');
	await expect(page.locator('h1')).toBeVisible();

	await page.getByLabel('Create project').click();
	await expect(page).toHaveURL(/projectId=/);

	await page
		.getByPlaceholder('Ask anything...')
		.fill('Design a roadmap assistant for product teams');
	await page.getByLabel('Send prompt').click();

	await expect(page.getByRole('button', { name: /Clarify the user problem/ })).toBeVisible({
		timeout: 15_000
	});
	await page.getByRole('button', { name: /Clarify the user problem/ }).click();

	await expect(page.getByRole('button', { name: /Mockup first/ })).toBeVisible({ timeout: 15_000 });
	await page.getByRole('button', { name: /Mockup first/ }).click();

	await expect(page.getByRole('heading', { name: 'Product surface sketch' }).first()).toBeVisible({
		timeout: 15_000
	});
	await page.getByLabel('Accept this card').click();

	await expect(page.getByText('product-spec', { exact: true })).toBeVisible({ timeout: 15_000 });
	await expect(page.getByRole('heading', { name: '3 Accepted' })).toBeVisible();
	await expect(page.getByLabel('Accept this card')).toHaveCount(0);
	await expect(page.getByText('Selected intent: Clarify the user problem').first()).toBeVisible();

	await page.reload();
	await expect(page.getByRole('heading', { name: 'Product surface sketch' }).first()).toBeVisible();
	await expect(page.getByText('Selected intent: Clarify the user problem').first()).toBeVisible();

	await page.getByLabel('Create project').click();
	await expect(page.getByText('None pinned yet')).toBeVisible();
	await expect(page.getByText('Product surface sketch')).toHaveCount(0);
});
