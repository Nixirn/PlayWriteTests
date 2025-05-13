// @ts-check
import { test, expect } from '@playwright/test';

const TIME_AGO_REGEX = RegExp(/\d{1,2}\s(minutes?|hours?)\s(ago)/);
const MAX_TABLE_ENTRIES = 30;

test.beforeEach( async ({page}) => {
    await page.goto('https://news.ycombinator.com/newest');
})

test.describe('Ensure posts are ordered from most to least recent', () => {
    test('Verify order', async ({page}) => {
        // Get the table that contains only the post entries with the time signatures on them
        const postTable = await page.getByRole('table').nth(2).getByRole('row').filter({hasText: TIME_AGO_REGEX});
        var all = await postTable.all();
        var previousTime = -1;

        // Loop through the first hundred entries 
        for(let i = 0; i < 100; i++) {
            let mod = i % MAX_TABLE_ENTRIES;

            // Refresh Saved table when all entries have been read
            if(mod == 0 && i > 0)  { 
                await page.getByRole('link', { name: 'More', exact: true }).click();
                all = await postTable.all();
            }

            let text = await (await all).at(mod)?.textContent();
            if(isOutOfOrder(parsePostTime(text), previousTime)) {
                throw new Error("Found entry out of order!");
            }
            previousTime = parsePostTime(text);
        }
    })
})

const isOutOfOrder = (time, previous) => {
    if(previous == -1) {
        return false;
    } else if (time - previous < 0) {
        return true;
    } else {
        return false;
    }

}

const parsePostTime = (postTimeText) => {
    const matchArr = postTimeText.match(TIME_AGO_REGEX); // 0: full str, 1: time name 
    switch (matchArr[1]) {
        case 'minute':
        case 'minutes':
            return parseInt(matchArr[0]);
        case 'hour':
        case 'hours':
            return parseInt(matchArr[0]) + 60;
        default:
            throw new Error("Parsed unrecognized time name: " + matchArr[1]);
    }
}