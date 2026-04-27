Object.assign(NativeApp, {
    async share(title, text, url) {
        if (!window.Capacitor) {
            if (navigator.share) await navigator.share({ title, text, url });
            return;
        }
        const { Share } = await import('@capacitor/share');
        await Share.share({ title, text, url, dialogTitle: 'Share 0xNOX' });
    },

    async copyToClipboard(text) {
        if (!window.Capacitor) {
            await navigator.clipboard.writeText(text);
            return;
        }
        const { Clipboard } = await import('@capacitor/clipboard');
        await Clipboard.write({ string: text });
    },

    async haptic(type = 'light') {
        if (!window.Capacitor) return;
        const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
        const styles = { light: ImpactStyle.Light, medium: ImpactStyle.Medium, heavy: ImpactStyle.Heavy };
        await Haptics.impact({ style: styles[type] || ImpactStyle.Light });
    },

    async openBrowser(url) {
        if (!window.Capacitor) {
            window.open(url, '_blank');
            return;
        }
        const { Browser } = await import('@capacitor/browser');
        await Browser.open({ url });
    }
});

document.addEventListener('DOMContentLoaded', () => NativeApp.init());
