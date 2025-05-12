// @ts-check
import { test, expect } from '@playwright/test';

test.beforeEach( async ({page}) => {
    await page.goto('https://news.ycombinator.com/newest');
})

test.describe('Ensure posts are ordered from most to least recent', () => {
    test('Verify order', async ({page}) => {
        const timeAgoRegex = RegExp('\d{1,3}\s(minute ago)|(minutes ago)|(hour ago)|(hours ago)');
        const postTable = await page.getByRole('table').nth(2).getByRole('row').filter({hasText: timeAgoRegex});
        var all = await postTable.all()
        for(let i = 0; i < 100; i++) {
            let mod = i % 30;
            let text = await (await all).at(mod)?.textContent()
            if(mod == 0 && i > 0)  { // don't click more on first run
                await page.getByRole('link', { name: 'More', exact: true }).click();
                all = await postTable.all();
                console.log(text); // TODO: Add helper methods to parse time and compare post time
            } else {
                console.log(text); // TODO: Add helper methods to parse time and compare post time
            }
        }
    })
})

const compareTime = (timeText, previous = "none") => {
    
}

const parsePostTime = (postTimeText) => {

}