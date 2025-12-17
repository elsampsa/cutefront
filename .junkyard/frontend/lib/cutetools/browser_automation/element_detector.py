"""Element detection and extraction for browser automation."""


# JavaScript to inject into the page for element detection
ELEMENT_DETECTION_JS = """
() => {
    const elements = [];
    let elementId = 0;

    // Helper to generate a unique ID for elements
    function getElementId(el) {
        if (el.id) return el.id;
        if (!el.dataset.autoId) {
            el.dataset.autoId = `auto-id-${elementId++}`;
        }
        return el.dataset.autoId;
    }

    // Helper to check if element is visible
    function isVisible(el) {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' &&
               style.visibility !== 'hidden' &&
               style.opacity !== '0' &&
               el.offsetWidth > 0 &&
               el.offsetHeight > 0;
    }

    // Helper to get element text (including aria-label, placeholder, etc.)
    function getElementText(el) {
        return el.innerText?.trim() ||
               el.textContent?.trim() ||
               el.ariaLabel ||
               el.getAttribute('aria-label') ||
               el.placeholder ||
               el.value ||
               el.alt ||
               '';
    }

    // Helper to get bounding box
    function getBoundingBox(el) {
        const rect = el.getBoundingClientRect();
        return {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
        };
    }

    // Extract buttons
    document.querySelectorAll('button, input[type="button"], input[type="submit"], input[type="reset"], [role="button"]').forEach(el => {
        if (!isVisible(el)) return;
        elements.push({
            type: 'button',
            id: getElementId(el),
            text: getElementText(el),
            tag: el.tagName.toLowerCase(),
            disabled: el.disabled || false,
            bbox: getBoundingBox(el),
            selector: `[data-auto-id="${el.dataset.autoId}"]`
        });
    });

    // Extract links
    document.querySelectorAll('a[href]').forEach(el => {
        if (!isVisible(el)) return;
        elements.push({
            type: 'link',
            id: getElementId(el),
            text: getElementText(el),
            href: el.href,
            bbox: getBoundingBox(el),
            selector: `[data-auto-id="${el.dataset.autoId}"]`
        });
    });

    // Extract text inputs
    document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input[type="search"], input[type="tel"], input[type="url"], input[type="number"], input:not([type]), textarea').forEach(el => {
        if (!isVisible(el)) return;
        elements.push({
            type: 'input',
            id: getElementId(el),
            input_type: el.type || 'text',
            placeholder: el.placeholder || '',
            value: el.value || '',
            label: el.labels?.[0]?.innerText?.trim() || '',
            disabled: el.disabled || false,
            bbox: getBoundingBox(el),
            selector: `[data-auto-id="${el.dataset.autoId}"]`
        });
    });

    // Extract select dropdowns
    document.querySelectorAll('select').forEach(el => {
        if (!isVisible(el)) return;
        const options = Array.from(el.options).map(opt => ({
            value: opt.value,
            text: opt.text
        }));
        elements.push({
            type: 'select',
            id: getElementId(el),
            label: el.labels?.[0]?.innerText?.trim() || '',
            options: options,
            selected_value: el.value,
            disabled: el.disabled || false,
            bbox: getBoundingBox(el),
            selector: `[data-auto-id="${el.dataset.autoId}"]`
        });
    });

    // Extract checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(el => {
        if (!isVisible(el)) return;
        elements.push({
            type: 'checkbox',
            id: getElementId(el),
            label: el.labels?.[0]?.innerText?.trim() || '',
            checked: el.checked,
            disabled: el.disabled || false,
            bbox: getBoundingBox(el),
            selector: `[data-auto-id="${el.dataset.autoId}"]`
        });
    });

    // Extract radio buttons
    document.querySelectorAll('input[type="radio"]').forEach(el => {
        if (!isVisible(el)) return;
        elements.push({
            type: 'radio',
            id: getElementId(el),
            name: el.name,
            label: el.labels?.[0]?.innerText?.trim() || '',
            checked: el.checked,
            disabled: el.disabled || false,
            bbox: getBoundingBox(el),
            selector: `[data-auto-id="${el.dataset.autoId}"]`
        });
    });

    return elements;
}
"""


async def get_page_elements(page):
    """
    Extract all interactive elements from the page.

    Args:
        page: Playwright Page object

    Returns:
        List of element dictionaries with their properties
    """
    elements = await page.evaluate(ELEMENT_DETECTION_JS)
    return elements
