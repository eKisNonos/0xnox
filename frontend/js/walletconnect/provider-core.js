const WCSimple = {
    provider: null,
    uri: null,
    connecting: false,
    EthereumProvider: null,

    clearStaleSessions() {
        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.startsWith('wc@') || key.startsWith('walletconnect') || key.includes('WalletConnect'))) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
        } catch {}
    },

    async loadSDK() {
        if (this.EthereumProvider) return this.EthereumProvider;
        try {
            const module = await import('https://esm.sh/@walletconnect/ethereum-provider@2.17.0');
            this.EthereumProvider = module.EthereumProvider;
            return this.EthereumProvider;
        } catch (e) {
            throw new Error('Failed to load WalletConnect SDK');
        }
    },

    isConnected() {
        return !!(this.provider && this.provider.session);
    },

    async disconnect() {
        if (this.provider) {
            try { await this.provider.disconnect(); } catch {}
            this.provider = null;
        }
        this.uri = null;
        this.connecting = false;
        this.clearStaleSessions();
        if (typeof Wallet !== 'undefined') {
            Wallet.provider = null;
            Wallet.signer = null;
            Wallet.address = null;
        }
        if (typeof UI !== 'undefined' && UI.updateWallet) UI.updateWallet();
    }
};

window.WCSimple = WCSimple;
