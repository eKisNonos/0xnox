document.addEventListener('DOMContentLoaded', () => {
    // App.init() is now called by TokenGate after access is verified
    // Only auto-init if already unlocked (e.g., session storage)
    if (typeof TokenGate !== 'undefined' && TokenGate.isUnlocked) {
        App.init();
    }
});

window.addEventListener('walletconnect-connected', async function(e) {
    if (e.detail && e.detail.address) {
        try {
            let wcProvider = e.detail.provider || (window.appKit && window.appKit.getWalletProvider());
            if (wcProvider) {
                Wallet.provider = new ethers.BrowserProvider(wcProvider);
                Wallet.signer = await Wallet.provider.getSigner();
                Wallet.address = e.detail.address;
                Wallet.isGenerated = false;
                localStorage.setItem('oxnox_wc_connected', JSON.stringify({
                    address: e.detail.address,
                    chainId: e.detail.chainId || 1
                }));

                // If gate is active, verify access first
                if (typeof TokenGate !== 'undefined' && !TokenGate.isUnlocked) {
                    await TokenGate.onWalletConnected(e.detail.address);
                    return;
                }

                UI.updateWallet();
                App.closeWalletModal();
                UI.showSuccess('Connected via WalletConnect');
                if (App.currentPage === 'bridge' && Bridge.initialized) {
                    Bridge.refresh();
                }
                if (App.currentPage === 'staking' && typeof Staking !== 'undefined') {
                    Staking.loadData();
                }
                App.checkNFT();
            } else {
                UI.showError('Connection failed - please try again');
            }
        } catch (err) {
            UI.showError('Failed to connect: ' + (err.message || 'Unknown error'));
        }
    }
});

window.addEventListener('walletconnect-disconnected', function() {
    if (Wallet.address && !Wallet.isGenerated) {
        Wallet.disconnect();
        localStorage.removeItem('oxnox_wc_connected');
        UI.updateWallet();
    }
});
