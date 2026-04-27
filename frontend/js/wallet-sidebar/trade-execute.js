Object.assign(WalletSidebar, {
    async executeTrade(e) {
        e.preventDefault();
        if (!Wallet.address) {
            UI.showError('Connect wallet first');
            return;
        }
        if (!this.selectedToken) return;
        const amount = document.getElementById('qtAmount').value;
        if (!amount || parseFloat(amount) <= 0) {
            UI.showError('Enter amount');
            return;
        }
        const btn = document.getElementById('qtSubmitBtn');
        btn.disabled = true;
        btn.textContent = 'Processing...';
        try {
            if (this.tradeType === 'buy') {
                await Contracts.buy(this.selectedToken.address, ethers.parseEther(amount), 0n);
                UI.showSuccess('Purchase successful!');
            } else {
                await Contracts.sell(this.selectedToken.address, amount, '0');
                UI.showSuccess('Sale successful!');
            }
            document.getElementById('qtAmount').value = '';
            await this.loadWalletInfo();
            await this.loadHoldings();
        } catch (err) {
            UI.showError(err.reason || err.message || 'Transaction failed');
        } finally {
            btn.disabled = false;
            btn.textContent = this.tradeType === 'buy' ? 'Buy' : 'Sell';
        }
    },

    switchTab(tab) {
        this.currentTab = tab;
        document.querySelectorAll('.sidebar-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });
        document.getElementById('sidebarHoldings').style.display = tab === 'holdings' ? 'block' : 'none';
        document.getElementById('sidebarActivity').style.display = tab === 'activity' ? 'block' : 'none';
    },

    copyAddress() {
        if (!Wallet.address) return;
        navigator.clipboard.writeText(Wallet.address);
        UI.showSuccess('Address copied!');
    },

    disconnect() {
        Wallet.disconnect();
        localStorage.removeItem('oxnox_wallet');
        localStorage.removeItem('0xnox_cf_wallets');
        localStorage.removeItem('0xnox_cf_active');
        UI.updateWallet();
        this.loadWalletInfo();
        this.loadHoldings();
        this.close();
        UI.showSuccess('Wallet disconnected');
    }
});
