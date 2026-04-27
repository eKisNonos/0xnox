Object.assign(App, {
    async estimateBuy(eth) {
        if (!eth || !this.currentToken) return;
        try {
            const tokens = await Contracts.getBuyPrice(this.currentToken, eth);
            document.getElementById('buyEstimate').value = UI.formatNumber(UI.weiToEth(tokens)) + ' tokens';
        } catch (e) { document.getElementById('buyEstimate').value = 'Enter amount'; }
    },

    async estimateSell(amount) {
        if (!amount || !this.currentToken) return;
        try {
            const eth = await Contracts.getSellPrice(this.currentToken, amount);
            document.getElementById('sellEstimate').value = UI.formatETH(eth);
        } catch (e) { document.getElementById('sellEstimate').value = 'Enter amount'; }
    },

    async buyTokens(e) {
        e.preventDefault();
        if (!Wallet.address) return UI.showError('Connect wallet first');
        const ethAmount = document.getElementById('buyAmount').value;
        if (!ethAmount || parseFloat(ethAmount) <= 0) return UI.showError('Enter valid amount');
        try {
            const estimatedTokens = await Contracts.getBuyPrice(this.currentToken, ethAmount);
            const slippageMultiplier = (100 - this.buySlippage) / 100;
            const minTokens = (estimatedTokens * BigInt(Math.floor(slippageMultiplier * 1000))) / 1000n;
            UI.showToast('Confirming transaction...', 'info');
            await Contracts.buy(this.currentToken, ethers.parseEther(ethAmount), minTokens);
            UI.showSuccess('Purchase successful!');
            document.getElementById('buyAmount').value = '';
            document.getElementById('buyEstimate').value = '';
            this.viewToken(this.currentToken);
        } catch (err) {
            if (err.message?.includes('slippage')) {
                UI.showError('Slippage exceeded. Try increasing slippage tolerance.');
            } else {
                UI.showError(err.reason || err.message || 'Transaction failed');
            }
        }
    },

    async sellTokens(e) {
        e.preventDefault();
        if (!Wallet.address) return UI.showError('Connect wallet first');
        const tokenAmount = document.getElementById('sellAmount').value;
        if (!tokenAmount || parseFloat(tokenAmount) <= 0) return UI.showError('Enter valid amount');
        try {
            const estimatedEth = await Contracts.getSellPrice(this.currentToken, tokenAmount);
            const slippageMultiplier = (100 - this.sellSlippage) / 100;
            const minEth = (estimatedEth * BigInt(Math.floor(slippageMultiplier * 1000))) / 1000n;
            UI.showToast('Confirming transaction...', 'info');
            await Contracts.sell(this.currentToken, tokenAmount, ethers.formatEther(minEth));
            UI.showSuccess('Sale successful!');
            document.getElementById('sellAmount').value = '';
            document.getElementById('sellEstimate').value = '';
            this.viewToken(this.currentToken);
        } catch (err) {
            if (err.message?.includes('slippage')) {
                UI.showError('Slippage exceeded. Try increasing slippage tolerance.');
            } else {
                UI.showError(err.reason || err.message || 'Transaction failed');
            }
        }
    }
});
