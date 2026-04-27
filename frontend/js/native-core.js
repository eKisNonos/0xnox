const NativeApp = {
    isNative: false,
    platform: 'web',

    async init() {
        if (window.Capacitor) {
            this.isNative = true;
            this.platform = window.Capacitor.getPlatform();
            await this.setupNativeFeatures();
        }
    },

    async setupNativeFeatures() {
        try {
            await this.setupStatusBar();
            await this.setupSplashScreen();
            await this.setupDeepLinks();
            await this.setupPushNotifications();
            await this.setupBackButton();
        } catch (e) {}
    },

    async setupStatusBar() {
        if (!window.Capacitor) return;
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#000000' });
    },

    async setupSplashScreen() {
        if (!window.Capacitor) return;
        const { SplashScreen } = await import('@capacitor/splash-screen');
    },

    async setupDeepLinks() {
        if (!window.Capacitor) return;
        const { App } = await import('@capacitor/app');

        App.addListener('appUrlOpen', (event) => {
            const url = new URL(event.url);
            const path = url.pathname;

            if (path.includes('/token/')) {
                const tokenAddress = path.split('/token/')[1];
                if (typeof window.App !== 'undefined') window.App.viewToken(tokenAddress);
            } else if (path.includes('/bridge')) {
                if (typeof window.App !== 'undefined') window.App.showPage('bridge');
            }
        });
    },

    async setupBackButton() {
        if (!window.Capacitor) return;
        const { App } = await import('@capacitor/app');

        App.addListener('backButton', ({ canGoBack }) => {
            if (typeof window.App !== 'undefined') {
                const currentPage = window.App.currentPage;
                if (currentPage !== 'home') window.App.showPage('home');
                else if (canGoBack) window.history.back();
                else App.exitApp();
            }
        });
    }
};
