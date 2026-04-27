Object.assign(NFTDashboard, {
    async loadRevenueData() {
        if (!Wallet.address || this.nftBalance === 0) return;
        try {
            const provider = Wallet.provider || new ethers.JsonRpcProvider(CONFIG.RPC_URL);
            if (CONFIG.REVENUE_SPLITTER) {
                const splitter = new ethers.Contract(CONFIG.REVENUE_SPLITTER, ABI.REVENUE_SPLITTER, provider);
                try {
                    const [claimable, claimed] = await Promise.all([
                        splitter.claimable(Wallet.address),
                        splitter.userClaimed(Wallet.address)
                    ]);
                    document.getElementById('nftPendingRewards').textContent = this.formatNOX(claimable) + ' NOX';
                    document.getElementById('nftTotalEarned').textContent = this.formatNOX(claimed) + ' NOX';
                    const claimBtn = document.getElementById('claimNftRewardsBtn');
                    if (claimBtn) claimBtn.disabled = claimable === 0n;
                } catch (e) {}
            }
            await this.loadFeesSaved();
        } catch (e) {}
    },

    async loadFeesSaved() {
        try {
            const res = await fetch(CONFIG.API_URL + '/api/v1/users/' + Wallet.address + '/stats');
            const data = await res.json();
            const tokenCount = data.tokens_created || 0;
            const creationSaved = tokenCount * 10000;
            document.getElementById('nftFeesSaved').textContent = this.formatNOX(ethers.parseEther(creationSaved.toString())) + ' NOX';
            const volume = data.total_volume || 0;
            const tradingSaved = volume * 0.005;
            document.getElementById('nftTradingSaved').textContent = this.formatNOX(ethers.parseEther(tradingSaved.toString())) + ' NOX';
        } catch (e) {
            document.getElementById('nftFeesSaved').textContent = '0 NOX';
            document.getElementById('nftTradingSaved').textContent = '0 NOX';
        }
    }
});
