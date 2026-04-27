Object.assign(NativeApp, {
    async setupPushNotifications() {
        if (!window.Capacitor) return;
        const { PushNotifications } = await import('@capacitor/push-notifications');

        const permStatus = await PushNotifications.checkPermissions();
        if (permStatus.receive === 'prompt') await PushNotifications.requestPermissions();

        if (permStatus.receive === 'granted') {
            await PushNotifications.register();

            PushNotifications.addListener('registration', (token) => {
                this.savePushToken(token.value);
            });

            PushNotifications.addListener('pushNotificationReceived', (notification) => {
                this.handleNotification(notification);
            });

            PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
                this.handleNotificationAction(action);
            });
        }
    },

    savePushToken(token) {
        if (typeof Wallet !== 'undefined' && Wallet.address) {
            fetch(CONFIG.API_URL + '/users/push-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: Wallet.address, token: token, platform: this.platform })
            }).catch(() => {});
        }
    },

    handleNotification(notification) {
        if (typeof UI !== 'undefined') UI.showInfo(notification.title + ': ' + notification.body);
    },

    handleNotificationAction(action) {
        const data = action.notification.data;
        if (data && data.url) window.location.href = data.url;
    }
});
