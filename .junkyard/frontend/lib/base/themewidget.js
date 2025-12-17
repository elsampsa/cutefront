import { Widget, Signal } from './widget.js';

class ThemeWidget extends Widget { /*//DOC
    Theme controller widget for Bootstrap 5.3+ dark/light mode.
    - On creation: reads localStorage "theme" key and applies theme immediately
    - Listens for system theme changes when in "system" mode
    - Has set_theme_slot() to receive theme changes from UI widgets (like AppearanceWidget)
    - Saves theme preference to localStorage

    This widget should be instantiated early (before other widgets) to prevent theme flash.
    It has no visible UI elements.
    */
    constructor() {
        super();
        this.createState();
    }

    createSignals() {
        this.signals.theme_changed = new Signal("Emitted when theme changes. Carries {mode: str, effective: str}");
    }

    createState() {
        // Load saved preference from localStorage, default to 'system'
        this.currentMode = localStorage.getItem('theme') || 'system';
        this._applyTheme(this.currentMode);

        // Listen for system theme changes
        this.systemMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.systemMediaQuery.addEventListener('change', () => {
            if (this.currentMode === 'system') {
                this._applyTheme('system');
            }
        });
    }

    set_theme_slot(mode) { /*//DOC
        Set the theme mode. Called by UI widgets like AppearanceWidget.
        :param mode: 'light', 'dark', or 'system'
        */
        if (mode === 'light' || mode === 'dark' || mode === 'system') {
            if (mode !== this.currentMode) {
                this.currentMode = mode;
                localStorage.setItem('theme', mode);
                this._applyTheme(mode);
            }
        }
    }

    _applyTheme(mode) {
        let effectiveTheme;
        if (mode === 'system') {
            effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } else {
            effectiveTheme = mode;
        }
        // Apply Bootstrap 5.3+ theme attribute
        document.documentElement.setAttribute('data-bs-theme', effectiveTheme);
        this.log(-1, `Theme applied: ${mode} (effective: ${effectiveTheme})`);
        this.signals.theme_changed.emit({ mode: mode, effective: effectiveTheme });
    }

    getMode() { /*//DOC
        Returns the current theme mode ('light', 'dark', or 'system')
        */
        return this.currentMode;
    }

    getEffectiveTheme() { /*//DOC
        Returns the effective theme ('light' or 'dark'), resolving 'system' to actual value
        */
        if (this.currentMode === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return this.currentMode;
    }
}

export { ThemeWidget };
