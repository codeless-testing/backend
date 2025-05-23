// helpers ────────────────────────────────────────────────────────────
import { chromium, firefox, webkit, expect } from 'playwright';

/** map camel-case param names to real CSS properties */
const cssMap = {
    width:            'width',
    height:           'height',
    color:            'color',
    backgroundColor:  'background-color',
    font:             'font-family',
    fontSize:         'font-size',
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
export async function runTestCases(testDoc, headed, urlFromQuery) {
    const url = urlFromQuery || testDoc.url || testDoc.redirectUrl || '';
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

        for (const c of testDoc.cases) {
            const loc = page.locator(c.class);
            await loc.waitFor();

            for (const [key, expected] of Object.entries(c.params)) {
                const cssProp = cssMap[key] || camelToKebab(key);
                await expect(loc).toHaveCSS(cssProp, expected);
                logs.push(`${c.class} ⇒ ${cssProp}: ${expected}`);
            }
        }

        await browser.close();
        return { _id: testDoc._id, passed: true, logs, errors };
    } catch (e) {
        errors.push(e.message);
        await browser.close();
        return { _id: testDoc._id, passed: false, logs, errors };
    }
}
