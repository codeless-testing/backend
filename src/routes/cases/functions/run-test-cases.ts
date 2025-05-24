import { chromium, firefox, webkit } from 'playwright';
import { test, expect } from 'playwright/test';
import {buildLocator} from "../utils/selector-utils";

/** map camel-case param names to real CSS properties */
const cssMap = {
    width:            'width',
    height:           'height',
    color:            'color',
    backgroundColor:  'background-color',
    font:             'font-family',
    fontSize:         'font-size',
    fontWeight:       'font-weight',
    borderSize:       'border-width',
    borderColor:      'border-color',
};

/** fallback: camelCase → kebab-case, e.g. lineHeight → line-height */
const camelToKebab = s =>
    s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/**
 * NEW: run‐style-validation case
 *   • doc must have .cases[]
 *   • optional doc.url OR ?url=… query param tells us what page to open
 */
export async function runTestCases(data, headed) {
    const url = data.url || data.redirectUrl || '';
    if (!url)
        throw new Error('No URL supplied (add ?url=https://… or store `url` in the doc)');

    const logs = [];
    const errors = [];
    const browser = await chromium.launch({ headless: !headed });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        await page.goto(url);
        logs.push(`navigated to ${url}`);

        for (const c of data.cases) {
            const loc = buildLocator(page, c);
            await loc.waitFor({ state: 'visible' });

            const clickNeeded      = !!c.click;
            const hasRedirect      = c.redirectUrl && c.redirectUrl.trim() !== '';
            const needStyleChecks  = !clickNeeded && !hasRedirect;

            // 1️⃣  Style assertions (if neither click nor redirectUrl requested)
            if (needStyleChecks && c.params) {
                for (const [k, expectedRaw] of Object.entries(c.params || {})) {
                    // ───────── ① skip “unset” values ─────────
                    const cssProp = cssMap[k] || camelToKebab(k);

                    if (expectedRaw == null || expectedRaw === '') continue;

                    // ───────── ② normalise colour hex → rgb ─────────
                    let expected = expectedRaw.trim();
                    if (expected.startsWith('#') && expected.length === 7) {
                        const r = parseInt(expected.slice(1, 3), 16);
                        const g = parseInt(expected.slice(3, 5), 16);
                        const b = parseInt(expected.slice(5, 7), 16);
                        expected = `rgb(${r}, ${g}, ${b})`;

                        const cssProp = cssMap[k] || camelToKebab(k);
                        await expect(loc).toHaveCSS(cssProp, expected);
                    } else {
                        await expect(loc).toHaveCSS(cssProp, expectedRaw);
                    }
                }
            }

            // 2️⃣  Click + optional redirect checks
            if (clickNeeded || hasRedirect) {
                logs.push(`${c.class} click`);
                if (hasRedirect) {
                    // waitForURL guarantees we only resolve after navigation
                    await Promise.all([
                        page.waitForURL(c.redirectUrl, { timeout: 10_000 }),
                        loc.click(),
                    ]);
                    await expect(page).toHaveURL(c.redirectUrl, { timeout: 10_000 });
                    logs.push(`navigated ➜ ${c.redirectUrl}`);
                } else {
                    // simple “is clickable” – Playwright throws if element is disabled/hidden
                    await loc.click();
                }
            }
        }


        await browser.close();
        return { _id: data._id, name: data.name, passed: true, logs, errors };
    } catch (e) {
        errors.push(e.message);
        console.log(e.message)
        await browser.close();
        return { _id: data._id, name: data.name, passed: false, logs, errors };
    }
}
