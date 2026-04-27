Object.assign(Trading, {
    async updateEstimate() {
        const amountInput = document.getElementById('tradeAmount');
        const priceEl = document.getElementById('tradePrice');
        const feeEl = document.getElementById('tradeFee');
        const receiveEl = document.getElementById('tradeReceive');
        if (!amountInput || !priceEl || !feeEl || !receiveEl) return;
        const amount = parseFloat(amountInput.value) || 0;
        if (!amount || !this.selectedToken) {
            priceEl.textContent = '--';
            feeEl.textContent = '--';
            receiveEl.textContent = '--';
            return;
        }
        try {
            const price = this.calculatePrice(this.selectedToken);
            const priceNum = parseFloat(price);
            if (this.tradeType === 'buy') {
                const tokensOut = amount / priceNum;
                const fee = amount * 0.01;
                priceEl.textContent = price + ' ETH';
                feeEl.textContent = fee.toFixed(6) + ' ETH';
                receiveEl.textContent = this.formatNumber(tokensOut) + ' ' + this.selectedToken.symbol;
            } else {
                const ethOut = amount * priceNum;
                const fee = ethOut * 0.01;
                priceEl.textContent = price + ' ETH';
                feeEl.textContent = fee.toFixed(6) + ' ETH';
                receiveEl.textContent = (ethOut - fee).toFixed(6) + ' ETH';
            }
        } catch (err) {}
    }
});
