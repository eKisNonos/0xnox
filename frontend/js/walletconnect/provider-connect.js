Object.assign(WCSimple, {
    async connect() {
        if (this.connecting) return;
        this.connecting = true;
        const modal = WCModal.create();
        modal.classList.add('show');
        const loading = document.getElementById('wcQRLoading');
        try {
            if (loading) loading.textContent = 'Loading WalletConnect...';
            this.clearStaleSessions();
            const EthereumProvider = await this.loadSDK();
            if (loading) loading.textContent = 'Generating QR code...';
            this.provider = await EthereumProvider.init({
                projectId: WCConfig.PROJECT_ID, chains: [1], showQrModal: false, optionalChains: [1],
                rpcMap: { 1: CONFIG.RPC_URL || 'https://eth.llamarpc.com' }, metadata: WCConfig.metadata
            });
            this.provider.on('display_uri', (uri) => { this.uri = uri; WCModal.showQR(uri); });
            const accounts = await this.provider.enable();
            WCModal.close();
            this.connecting = false;
            if (accounts && accounts.length > 0) { await this.setupWallet(accounts[0]); return accounts[0]; }
            throw new Error('No accounts returned');
        } catch (error) {
            this.connecting = false;
            WCModal.close();
            const errorMsg = error.message || '';
            if (errorMsg.includes('session') || errorMsg.includes('key') || errorMsg.includes('deleted')) {
                this.clearStaleSessions();
                this.provider = null;
            }
            if (!errorMsg.includes('rejected')) {
                if (typeof UI !== 'undefined' && UI.showError) UI.showError('WalletConnect failed. Please try again.');
            }
            const btn = document.getElementById('gateWCBtn');
            if (btn) { btn.disabled = false; btn.textContent = 'WalletConnect'; }
            throw error;
        }
    },

    async setupWallet(address) {
        if (!address || !this.provider) return;
        try {
            Wallet.provider = new ethers.BrowserProvider(this.provider);
            Wallet.signer = await Wallet.provider.getSigner();
            Wallet.address = address;
            Wallet.isGenerated = false;
            this.provider.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) { Wallet.address = accounts[0]; if (typeof UI !== 'undefined') UI.updateWallet(); }
                else this.disconnect();
            });
            this.provider.on('disconnect', () => this.disconnect());
            window.dispatchEvent(new CustomEvent('wallet-changed', { detail: { address } }));
            window.dispatchEvent(new CustomEvent('walletconnect-connected', { detail: { address } }));
            if (typeof TokenGate !== 'undefined' && !TokenGate.isUnlocked) await TokenGate.onWalletConnected(address);
            else if (typeof UI !== 'undefined') { UI.updateWallet(); UI.showSuccess('Connected via WalletConnect'); }
        } catch {}
    }
});
