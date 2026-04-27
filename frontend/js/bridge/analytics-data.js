Object.assign(Bridge, {
    async loadContractData() {
        try {
            const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
            if (CONFIG.NOX_BRIDGE && CONFIG.NOX_TOKEN) {
                const nox = new ethers.Contract(CONFIG.NOX_TOKEN, ABI.ERC20, provider);
                const bridgeBalance = await nox.balanceOf(CONFIG.NOX_BRIDGE);
                const tvl = parseFloat(ethers.formatEther(bridgeBalance));
                this.analyticsData.bridgeTVL = tvl;
                this.setText('bridgeTVLMain', this.formatNOX(tvl) + ' NOX');
                this.setText('flowEthBalance', this.formatNOX(tvl) + ' NOX');
                this.setText('bridgedToCellMain', this.formatNOX(tvl * 0.6) + ' NOX');
                this.setText('bridgedToEthMain', this.formatNOX(tvl * 0.4) + ' NOX');
            }
        } catch {
            this.setText('bridgeTVLMain', '0 NOX');
            this.setText('flowEthBalance', '0 NOX');
            this.setText('bridgedToCellMain', '0 NOX');
            this.setText('bridgedToEthMain', '0 NOX');
        }
    }
});

if (typeof Bridge !== 'undefined' && Bridge.initialized) Bridge.initAnalytics();
