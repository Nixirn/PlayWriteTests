// @ts-check
import { test, expect } from '@playwright/test';

test.beforeEach( async ({page}) => {
    await page.goto('https://news.ycombinator.com/newest');
})

test.describe('Ensure posts are ordered from most to least recent', () => {
    test('Verify order', async ({page}) => {
        await page.getByRole('table').nth(2).locator("td").nth(1);
    })
})