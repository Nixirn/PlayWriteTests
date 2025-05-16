// @ts-check
import { test, expect } from '@playwright/test';

const TIME_AGO_REGEX = RegExp(/\d{1,2}\s(minutes?|hours?)\s(ago)/);
const MAX_TABLE_ENTRIES = 30;

test.beforeEach( async ({page}) => {
    await page.goto('https://news.ycombinator.com/newest');
})

test('Ensure posts are ordered from most to least recent', async ({page}) => {
    // Get the table that contains only the post entries with the time signatures on them
    const moreLink = await page.getByRole('link', { name: 'More'});
    const postTable = await page.getByRole('table').nth(2).getByRole('row').filter({hasText: TIME_AGO_REGEX});
    var all = await postTable.all();
    var previousTime = -1;

    // Loop through the first hundred entries 
    for(let i = 0; i < 100; i++) {
        let mod = i % MAX_TABLE_ENTRIES;

        // Refresh Saved table every time the maximum number of tables entries have been read
        if(mod == 0 && i > 0)  { 
            await moreLink.click();
            all = await postTable.all();
        }

        // Parse text and compare with previous time value. Save current time as previous for the next loop
        await all.at(mod)?.textContent().then((text) => {
            if(isOutOfOrder(parsePostTime(text), previousTime)) {
                throw new Error("Found entry out of order!");
            }
            previousTime = parsePostTime(text);
        });
    }
    await page.close();
})


const isOutOfOrder = (time, previous) => {
    // Return false if there is no previous (First entry)
    if(previous == -1) {
        return false;
    // Return true if the previous time value is greater then the current
    } else if (time - previous < 0) { 
    } else {
        return false;
    }
}

const parsePostTime = (postTimeText) => {
    const matchArr = postTimeText.match(TIME_AGO_REGEX);
     // 0: full str, 1: time name 
    // Increment time number based on time name
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