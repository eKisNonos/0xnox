const Theme = {
    STORAGE_KEY: "0xnox_theme",
    
    init() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            this.setTheme(saved, false);
        } else {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            this.setTheme(prefersDark ? "dark" : "light", false);
        }
    },
    
    setTheme(theme, save = true) {
        document.documentElement.setAttribute("data-theme", theme);
        if (document.body) document.body.setAttribute("data-theme", theme);
        if (save) localStorage.setItem(this.STORAGE_KEY, theme);
        const meta = document.querySelector("meta[name=theme-color]");
        if (meta) meta.setAttribute("content", theme === "light" ? "#ffffff" : "#000000");
    },
    
    toggle() {
        const current = document.documentElement.getAttribute("data-theme") || "dark";
        const next = current === "dark" ? "light" : "dark";
        this.setTheme(next);
    },
    
    get current() {
        return document.documentElement.getAttribute("data-theme") || "dark";
    }
};

window.Theme = Theme;
Theme.init();
