Object.assign(Bridge, {
    updateWalletDisplay() {
        console.log('[Bridge] updateWalletDisplay called, Wallet.address:', Wallet.address);
        const ethAddressEl = document.getElementById('bridgeEthAddress');
        const connectPrompt = document.getElementById('bridgeConnectPrompt');
        const connectBtn = document.getElementById('bridgeConnectBtn');
        const bridgeForm = document.getElementById('bridgeForm');
        if (Wallet.address) {
            console.log('[Bridge] Wallet connected, updating display');
            if (ethAddressEl) {
                ethAddressEl.textContent = Wallet.address.slice(0, 6) + '...' + Wallet.address.slice(-4);
                ethAddressEl.title = Wallet.address;
            }
            if (connectPrompt) connectPrompt.style.display = 'none';
            if (connectBtn) connectBtn.style.display = 'none';
            if (bridgeForm) bridgeForm.style.display = 'block';
        } else {
            console.log('[Bridge] No wallet, showing not connected');
            if (ethAddressEl) { ethAddressEl.textContent = 'Not connected'; ethAddressEl.title = ''; }
            if (connectPrompt) connectPrompt.style.display = 'block';
            if (connectBtn) connectBtn.style.display = 'inline-block';
            if (bridgeForm) bridgeForm.style.display = 'block';
        }
    },

    loadSavedCFWallet() {
        if (typeof CellframeWallet !== 'undefined' && CellframeWallet.activeWallet) {
            const cfInput = document.getElementById('cfAddress');
            if (cfInput && !cfInput.value) cfInput.value = CellframeWallet.activeWallet.address;
        }
    },

    formatNOX(wei) {
        if (!wei) return '0';
        try {
            const value = parseFloat(ethers.formatEther(wei));
            if (value >= 1000000) return (value / 1000000).toFixed(2) + 'M';
            if (value >= 1000) return (value / 1000).toFixed(2) + 'K';
            return value.toFixed(2);
        } catch (e) { return '0'; }
    }
});
