Object.assign(WalletSidebar, {
    async loadWalletInfo() {
        if (!Wallet.address) {
            document.getElementById('sidebarAddress').textContent = 'Not connected';
            document.getElementById('sidebarEthBalance').textContent = '0.00 ETH';
            document.getElementById('sidebarNoxBalance').textContent = '0 NOX';
            return;
        }
        document.getElementById('sidebarAddress').textContent =
            Wallet.address.slice(0, 6) + '...' + Wallet.address.slice(-4);
        // Use our reliable RPC instead of wallet's provider
        const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
        try {
            const ethBalance = await provider.getBalance(Wallet.address);
            document.getElementById('sidebarEthBalance').textContent =
                parseFloat(ethers.formatEther(ethBalance)).toFixed(4) + ' ETH';
        } catch (e) { console.error('ETH balance error:', e); }
        try {
            const nox = new ethers.Contract(CONFIG.NOX_TOKEN, ABI.ERC20, provider);
            const noxBalance = await nox.balanceOf(Wallet.address);
            console.log('[Sidebar] NOX balance for', Wallet.address, ':', ethers.formatEther(noxBalance));
            document.getElementById('sidebarNoxBalance').textContent =
                this.formatNumber(ethers.formatEther(noxBalance)) + ' NOX';
        } catch (e) { console.error('NOX balance error:', e); }
    },

    async loadHoldings() {
        const el = document.getElementById('sidebarHoldings');
        if (!Wallet.address) {
            el.innerHTML = '<div class="empty-holdings">Connect wallet to see holdings</div>';
            return;
        }
        el.innerHTML = '<div class="empty-holdings">Loading...</div>';
        try {
            const res = await fetch(CONFIG.API_URL + '/api/v1/users/' + Wallet.address + '/holdings');
            const data = await res.json();
            this.holdings = data.holdings || [];
            if (this.holdings.length === 0) {
                el.innerHTML = '<div class="empty-holdings">No token holdings yet</div>';
                return;
            }
            el.innerHTML = this.holdings.map((h, i) => this.renderHolding(h, i)).join('');
        } catch (e) {
            el.innerHTML = '<div class="empty-holdings">Failed to load holdings</div>';
        }
    }
});
