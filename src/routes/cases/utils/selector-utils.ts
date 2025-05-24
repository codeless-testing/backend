export function buildLocator(page, c) {
    /**
     * Priority
     *   1. c.id   →  "#elementId"
     *   2. c.class
     *        • if it already starts with "." assume caller gave a selector
     *        • else treat it as one or many class names and convert:
     *            "btn btn-primary" → ".btn.btn-primary"
     */
    if (c.id && c.id.trim().length) return page.locator(`#${c.id.trim()}`);

    if (c.class && c.class.trim().length) {
        const raw = c.class.trim();
        const selector = raw.startsWith('.')
            ? raw
            : '.' + raw.split(/\s+/).join('.');
        return page.locator(selector);
    }

    throw new Error('Case has neither id nor class');
}
