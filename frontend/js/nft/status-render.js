Object.assign(NFTDashboard, {
    async showHolderStatus(statusIcon, statusTitle, statusDesc, statusCard, connectBtn, dashboard, ctaSection, balance, nftContract) {
        statusIcon.innerHTML = '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
        statusTitle.textContent = 'ZeroState Pass Holder';
        statusDesc.innerHTML = `You own <strong class="accent">${balance}</strong> ZeroState Pass${balance > 1 ? 'es' : ''}`;
        connectBtn.style.display = 'none';
        statusCard.classList.add('holder');
        this.tokenIds = [];
        for (let i = 0; i < balance; i++) {
            try {
                const tokenId = await nftContract.tokenOfOwnerByIndex(Wallet.address, i);
                this.tokenIds.push(tokenId.toString());
            } catch (e) {}
        }
        if (dashboard) dashboard.style.display = 'grid';
        if (ctaSection) ctaSection.style.display = 'none';
        this.renderNFTList();
    },

    showNoNFTStatus(statusIcon, statusTitle, statusDesc, statusCard, connectBtn, dashboard, ctaSection) {
        statusIcon.innerHTML = '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
        statusTitle.textContent = 'No ZeroState Pass Found';
        statusDesc.textContent = 'Get a ZeroState Pass to unlock exclusive benefits';
        connectBtn.style.display = 'none';
        statusCard.classList.remove('holder');
        if (dashboard) dashboard.style.display = 'none';
        if (ctaSection) ctaSection.style.display = 'block';
    },

    renderNFTList() {
        const list = document.getElementById('nftTokensList');
        if (!list) return;
        if (this.tokenIds.length === 0 && this.nftBalance > 0) {
            list.innerHTML = `<div class="nft-token-item">
                <div class="nft-token-icon">ZS</div>
                <div class="nft-token-info"><div class="nft-token-name">ZeroState Pass</div><div class="nft-token-id">×${this.nftBalance} owned</div></div>
                <a href="https://opensea.io/collection/zerostate-pass" target="_blank" class="btn btn-sm">View on OpenSea</a>
            </div>`;
            return;
        }
        list.innerHTML = this.tokenIds.map(id => `
            <div class="nft-token-item">
                <div class="nft-token-icon">ZS</div>
                <div class="nft-token-info"><div class="nft-token-name">ZeroState Pass</div><div class="nft-token-id">#${id}</div></div>
                <a href="https://opensea.io/assets/ethereum/${CONFIG.NFT_PASS}/${id}" target="_blank" class="btn btn-sm">View</a>
            </div>
        `).join('');
    }
});
