Object.assign(WalletSidebar, {
    renderHolding(holding, index) {
        const symbol = holding.symbol || '?';
        const name = holding.name || 'Unknown';
        const amount = this.formatNumber(holding.balance || 0);
        const value = holding.valueUsd ? '$' + this.formatNumber(holding.valueUsd) : '--';
        const progress = holding.graduationProgress || 0;
        return `<div class="holding-item" onclick="WalletSidebar.selectToken(${index})">
            <div class="holding-header">
                <div class="holding-token">
                    <div class="holding-icon">${symbol.charAt(0)}</div>
                    <div>
                        <div class="holding-name">${name}</div>
                        <div class="holding-symbol">$${symbol}</div>
                    </div>
                </div>
                <div class="holding-value">
                    <div class="holding-amount">${amount}</div>
                    <div class="holding-usd">${value}</div>
                </div>
            </div>
            <div class="holding-progress">
                <div class="holding-progress-bar" style="width:${progress}%"></div>
            </div>
        </div>`;
    },

    selectToken(index) {
        this.selectedToken = this.holdings[index];
        if (!this.selectedToken) return;
        document.querySelectorAll('.holding-item').forEach((el, i) => {
            el.classList.toggle('selected', i === index);
        });
        document.getElementById('qtIcon').textContent = (this.selectedToken.symbol || '?').charAt(0);
        document.getElementById('qtTokenName').textContent = this.selectedToken.symbol || 'Token';
        document.getElementById('quickTradePanel').style.display = 'block';
        this.setTradeType('buy');
    },

    closeQuickTrade() {
        this.selectedToken = null;
        document.getElementById('quickTradePanel').style.display = 'none';
        document.querySelectorAll('.holding-item').forEach(el => el.classList.remove('selected'));
    }
});
