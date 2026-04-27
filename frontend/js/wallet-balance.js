Object.assign(Wallet, {
    async getBalance() {
        if (!this.address || !this.provider) return "0";
        const bal = await this.provider.getBalance(this.address);
        return ethers.formatEther(bal);
    },

    async getNoxBalance() {
        if (!this.address || !this.provider) return "0";
        const nox = new ethers.Contract(CONFIG.NOX_TOKEN, ABI.ERC20, this.provider);
        const bal = await nox.balanceOf(this.address);
        return ethers.formatEther(bal);
    },

    async hasNFT() {
        if (!this.address || !this.provider) return false;
        const nft = new ethers.Contract(CONFIG.NFT_PASS, ABI.ERC721, this.provider);
        const bal = await nft.balanceOf(this.address);
        return bal > 0;
    },

    async updateBalances() {
        if (!this.address || !this.provider) {
            this.ethBalance = '0';
            this.noxBalance = '0';
            return;
        }
        try {
            const ethBal = await this.provider.getBalance(this.address);
            this.ethBalance = ethers.formatEther(ethBal);
        } catch (e) { this.ethBalance = '0'; }
        try {
            const nox = new ethers.Contract(CONFIG.NOX_TOKEN, ABI.ERC20, this.provider);
            const noxBal = await nox.balanceOf(this.address);
            this.noxBalance = ethers.formatEther(noxBal);
        } catch (e) { this.noxBalance = '0'; }
        window.dispatchEvent(new CustomEvent('balances-updated'));
    },

    async getTokenBalance(tokenAddress) {
        if (!this.address || !this.provider) return '0';
        try {
            const token = new ethers.Contract(tokenAddress, ABI.ERC20, this.provider);
            const bal = await token.balanceOf(this.address);
            return ethers.formatEther(bal);
        } catch (e) { return '0'; }
    }
});
