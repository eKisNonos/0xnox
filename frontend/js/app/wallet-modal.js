Object.assign(App, {
    openWalletModal() {
        if (Wallet.address) {
            Wallet.disconnect();
            UI.updateWallet();
        } else {
            document.getElementById('walletModal').classList.add('show');
        }
    },

    closeWalletModal() {
        document.getElementById('walletModal').classList.remove('show');
    },

    async connectExternal() {
        try {
            await Wallet.connect();
            UI.updateWallet();
            this.closeWalletModal();
            this.checkNFT();
            if (this.currentPage === 'bridge' && Bridge.initialized) Bridge.refresh();
        } catch (e) {
            UI.showError(e.message);
        }
    },

    async connectWalletConnect() {
        this.closeWalletModal();
        if (window.appKit && typeof window.appKit.open === 'function') {
            try {
                await window.appKit.open();
            } catch (err) {
                if (!err.message || !err.message.includes('rejected')) {
                    UI.showError('WalletConnect failed: ' + (err.message || 'Unknown error'));
                }
            }
        } else {
            UI.showToast('Initializing WalletConnect...', 'info');
            let attempts = 0;
            const iv = setInterval(async () => {
                attempts++;
                if (window.appKit && typeof window.appKit.open === 'function') {
                    clearInterval(iv);
                    try { await window.appKit.open(); }
                    catch (err) {
                        if (!err.message || !err.message.includes('rejected')) {
                            UI.showError('WalletConnect failed');
                        }
                    }
                } else if (attempts > 30) {
                    clearInterval(iv);
                    UI.showError('WalletConnect unavailable - use Browser Wallet');
                }
            }, 200);
        }
    },

    async checkNFT() {
        if (!Wallet.address) return;
        try {
            const hasNFT = await Contracts.hasNFTPass(Wallet.address);
            const badge = document.getElementById('nftBadge');
            if (badge) badge.style.display = hasNFT ? 'flex' : 'none';
        } catch (e) {}
    }
});
