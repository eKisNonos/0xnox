Object.assign(NFTDashboard, {
    async claimRewards() {
        if (!Wallet.address || !Wallet.signer) {
            UI.showError('Connect wallet first');
            return;
        }
        if (!CONFIG.REVENUE_SPLITTER) {
            UI.showError('Revenue splitter not configured');
            return;
        }
        const btn = document.getElementById('claimNftRewardsBtn');
        const originalText = btn.textContent;
        try {
            btn.disabled = true;
            btn.textContent = 'Claiming...';
            const splitter = new ethers.Contract(CONFIG.REVENUE_SPLITTER, ABI.REVENUE_SPLITTER, Wallet.signer);
            const claimable = await splitter.claimable(Wallet.address);
            if (claimable === 0n) {
                UI.showError('No rewards to claim');
                return;
            }
            UI.showToast('Claiming rewards...', 'info');
            const tx = await splitter.claim();
            await tx.wait();
            UI.showSuccess('Rewards claimed successfully!');
            await this.loadRevenueData();
        } catch (e) {
            UI.showError(e.reason || e.message || 'Claim failed');
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    }
});
