Object.assign(WCSimple, {
    async tryRestore() {
        try {
            let hasSession = false;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('wc@2:client')) { hasSession = true; break; }
            }
            if (!hasSession) return false;
            const EthereumProvider = await this.loadSDK();
            this.provider = await EthereumProvider.init({
                projectId: WCConfig.PROJECT_ID, chains: [1], showQrModal: false, optionalChains: [1],
                rpcMap: { 1: CONFIG.RPC_URL || 'https://eth.llamarpc.com' }, metadata: WCConfig.metadata
            });
            if (this.provider.session) {
                const accounts = await this.provider.request({ method: 'eth_accounts' });
                if (accounts && accounts.length > 0) { await this.setupWallet(accounts[0]); return true; }
            }
            return false;
        } catch (e) {
            this.clearStaleSessions();
            return false;
        }
    },

    async init() {
        await this.tryRestore();
    }
});

window.appKit = {
    async open() { return WCSimple.connect(); },
    close() { WCModal.close(); },
    disconnect() { return WCSimple.disconnect(); }
};

WCSimple.init();
