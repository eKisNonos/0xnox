// PWA Installation and Service Worker
const PWA = {
    deferredPrompt: null,
    isInstalled: false,

    init() {
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.checkIfInstalled();
    },

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateAvailable();
                        }
                    });
                });
            } catch (e) {
                // Service worker registration failed
            }
        }
    },

    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        window.addEventListener('appinstalled', () => {
            this.deferredPrompt = null;
            this.isInstalled = true;
            this.hideInstallButton();
        });
    },

    checkIfInstalled() {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
        }
        if (window.navigator.standalone === true) {
            this.isInstalled = true;
        }
    },

    showInstallButton() {
        const btn = document.getElementById('installAppBtn');
        if (btn && !this.isInstalled) {
            btn.style.display = 'flex';
        }
    },

    hideInstallButton() {
        const btn = document.getElementById('installAppBtn');
        if (btn) btn.style.display = 'none';
    },

    async promptInstall() {
        if (!this.deferredPrompt) {
            // Show manual install instructions
            this.showInstallInstructions();
            return;
        }

        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            this.deferredPrompt = null;
        }
    },

    showInstallInstructions() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);

        let instructions = '';
        if (isIOS) {
            instructions = 'Tap the Share button, then "Add to Home Screen"';
        } else if (isAndroid) {
            instructions = 'Tap the menu (3 dots), then "Add to Home Screen"';
        } else {
            instructions = 'Click the install icon in your browser\'s address bar';
        }

        if (typeof UI !== 'undefined') {
            UI.showInfo(instructions);
        }
    },

    showUpdateAvailable() {
        if (typeof UI !== 'undefined') {
            UI.showInfo('Update available! Refresh to get the latest version.');
        }
    }
};

// Initialize PWA on load
document.addEventListener('DOMContentLoaded', () => PWA.init());
