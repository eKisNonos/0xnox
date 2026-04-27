Object.assign(Trading, {
    async updateTradeUI() {
        const btn = document.getElementById('tradeSubmitBtn');
        const suffix = document.getElementById('tradeSuffix');
        const balance = document.getElementById('tradeBalance');
        if (!btn) return;
        if (!Wallet.address) {
            btn.textContent = 'Connect Wallet';
            btn.disabled = false;
            btn.className = 'trade-btn buy';
            btn.onclick = () => App.openWalletModal();
            if (balance) balance.textContent = '0.00';
            return;
        }
        btn.disabled = !this.selectedToken;
        btn.onclick = () => Trading.executeTrade();
        if (this.tradeType === 'buy') {
            btn.textContent = 'Buy ' + (this.selectedToken?.symbol || '');
            btn.className = 'trade-btn buy';
            if (suffix) suffix.textContent = 'ETH';
            if (balance) balance.textContent = parseFloat(Wallet.ethBalance || 0).toFixed(4);
        } else {
            btn.textContent = 'Sell ' + (this.selectedToken?.symbol || '');
            btn.className = 'trade-btn sell';
            if (suffix) suffix.textContent = this.selectedToken?.symbol || 'TOKEN';
            if (balance && this.selectedToken && Wallet.address) {
                try {
                    const bal = await Wallet.getTokenBalance(this.selectedToken.address);
                    this.tokenBalance = bal;
                    balance.textContent = parseFloat(bal).toFixed(2);
                } catch { balance.textContent = '0.00'; }
            }
        }
        this.updateEstimate();
    },

    setQuickAmount(amount) {
        const input = document.getElementById('tradeAmount');
        if (input) { input.value = amount; this.updateEstimate(); }
    },

    setMax() {
        const input = document.getElementById('tradeAmount');
        if (!input) return;
        if (this.tradeType === 'buy') {
            const bal = parseFloat(Wallet.ethBalance || 0);
            input.value = Math.max(0, bal - 0.005).toFixed(4);
        } else {
            input.value = parseFloat(this.tokenBalance || 0).toFixed(2);
        }
        this.updateEstimate();
    }
});
