Object.assign(Trading, {
    async executeTrade() {
        if (!Wallet.address) { App.openWalletModal(); return; }
        if (!this.selectedToken) { UI.showError('Select a token first'); return; }
        const amountInput = document.getElementById('tradeAmount');
        const amount = parseFloat(amountInput?.value) || 0;
        if (!amount || amount <= 0) { UI.showError('Enter a valid amount'); return; }
        const btn = document.getElementById('tradeSubmitBtn');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Processing...';
        try {
            if (this.tradeType === 'buy') {
                const ethAmount = ethers.parseEther(amount.toString());
                await Contracts.buy(this.selectedToken.address, ethAmount, 0n);
                UI.showSuccess(`Bought ${this.selectedToken.symbol}!`);
            } else {
                await Contracts.sell(this.selectedToken.address, amount.toString(), '0');
                UI.showSuccess(`Sold ${this.selectedToken.symbol}!`);
            }
            if (amountInput) amountInput.value = '';
            await Wallet.updateBalances();
            await this.refreshSelectedToken();
            await this.loadRecentTrades(this.selectedToken.address);
            this.updateTradeUI();
        } catch (err) {
            const msg = err.reason || err.message || 'Transaction failed';
            UI.showError(msg.length > 50 ? msg.substring(0, 50) + '...' : msg);
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    },

    async loadRecentTrades(tokenAddress) {
        const c = document.getElementById('recentTradesList');
        if (!c) return;
        try {
            const res = await fetch(`${CONFIG.API_URL}/tokens/${tokenAddress}/trades?limit=10`);
            const data = await res.json();
            if (!data.trades || data.trades.length === 0) {
                c.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:0.85rem">No trades yet</div>';
                return;
            }
            c.innerHTML = data.trades.map(t => `<div class="trade-history-row">
                <span class="trade-type-badge ${t.is_buy ? 'buy' : 'sell'}">${t.is_buy ? 'Buy' : 'Sell'}</span>
                <span class="trade-history-amount">${(parseFloat(t.eth_amount) / 1e18).toFixed(4)} ETH</span>
                <span class="trade-history-time">${this.formatTimeShort(t.created_at)}</span>
            </div>`).join('');
        } catch (err) {}
    }
});
