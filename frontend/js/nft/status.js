Object.assign(NFTDashboard, {
    async loadNFTStatus() {
        const statusCard = document.getElementById('nftStatusCard');
        const statusIcon = document.getElementById('nftStatusIcon');
        const statusTitle = document.getElementById('nftStatusTitle');
        const statusDesc = document.getElementById('nftStatusDesc');
        const connectBtn = document.getElementById('nftConnectBtn');
        const dashboard = document.getElementById('nftDashboard');
        const ctaSection = document.getElementById('nftCtaSection');

        if (!Wallet.address) {
            statusIcon.innerHTML = '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v4m0 4h.01"/></svg>';
            statusTitle.textContent = 'Connect Wallet';
            statusDesc.textContent = 'Connect your wallet to check ZeroState Pass ownership';
            connectBtn.style.display = 'inline-flex';
            if (dashboard) dashboard.style.display = 'none';
            if (ctaSection) ctaSection.style.display = 'block';
            return;
        }

        try {
            const provider = Wallet.provider || new ethers.JsonRpcProvider(CONFIG.RPC_URL);
            const nftContract = new ethers.Contract(CONFIG.NFT_PASS, ABI.ERC721, provider);
            this.nftBalance = await nftContract.balanceOf(Wallet.address);
            const balance = Number(this.nftBalance);

            if (balance > 0) {
                this.showHolderStatus(statusIcon, statusTitle, statusDesc, statusCard, connectBtn, dashboard, ctaSection, balance, nftContract);
            } else {
                this.showNoNFTStatus(statusIcon, statusTitle, statusDesc, statusCard, connectBtn, dashboard, ctaSection);
            }
        } catch (e) {
            statusTitle.textContent = 'Error Loading';
            statusDesc.textContent = 'Failed to check NFT ownership';
        }
    }
});
