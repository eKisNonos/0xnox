Object.assign(WalletSidebar, {
    setTradeType(type) {
        this.tradeType = type;
        document.querySelectorAll('.quick-trade-tab').forEach(tab => {
            tab.classList.toggle('active', tab.classList.contains(type));
        });
        const btn = document.getElementById('qtSubmitBtn');
        btn.textContent = type === 'buy' ? 'Buy' : 'Sell';
        btn.className = 'btn quick-trade-btn ' + type;
        const suffix = document.getElementById('qtSuffix');
        suffix.textContent = type === 'buy' ? 'ETH' : this.selectedToken?.symbol || 'Tokens';
        document.getElementById('qtAmount').value = '';
        document.getElementById('qtEstimate').textContent = type === 'buy' ? '0 tokens' : '0 ETH';
    },

    setQuickAmount(amount) {
        if (amount === 'max') {
            if (this.tradeType === 'sell' && this.selectedToken) {
                document.getElementById('qtAmount').value = this.selectedToken.balance || 0;
            } else {
                document.getElementById('qtAmount').value = '0.1';
            }
        } else {
            document.getElementById('qtAmount').value = amount;
        }
        this.updateEstimate();
    },

    async updateEstimate() {
        if (!this.selectedToken) return;
        const amount = document.getElementById('qtAmount').value;
        if (!amount || parseFloat(amount) <= 0) {
            document.getElementById('qtEstimate').textContent = this.tradeType === 'buy' ? '0 tokens' : '0 ETH';
            return;
        }
        try {
            if (this.tradeType === 'buy') {
                const tokens = await Contracts.getBuyPrice(this.selectedToken.address, amount);
                document.getElementById('qtEstimate').textContent = this.formatNumber(ethers.formatEther(tokens)) + ' tokens';
            } else {
                const eth = await Contracts.getSellPrice(this.selectedToken.address, amount);
                document.getElementById('qtEstimate').textContent = parseFloat(ethers.formatEther(eth)).toFixed(6) + ' ETH';
            }
        } catch (e) {
            document.getElementById('qtEstimate').textContent = 'Error';
        }
    }
});
