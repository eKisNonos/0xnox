const Contracts = {
    factory: null,
    provider: null,

    init() {
        this.provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
        this.factory = new ethers.Contract(CONFIG.FACTORY_ADDRESS, ABI.FACTORY, this.provider);
    },

    getProvider() { return Wallet.provider || this.provider; },

    isValidAddress(address) { return address && /^0x[a-fA-F0-9]{40}$/.test(address); },

    async isValidToken(address) {
        if (!this.isValidAddress(address)) return false;
        try { return await this.factory.isToken(address); } catch { return false; }
    },

    async hasNFTPass(address) {
        try {
            const nft = new ethers.Contract(CONFIG.NFT_PASS, ABI.ERC721, this.getProvider());
            return (await nft.balanceOf(address)) > 0n;
        } catch (e) { return false; }
    },

    async getBalance(tokenAddress, userAddress) {
        const token = new ethers.Contract(tokenAddress, ABI.ERC20, this.getProvider());
        return token.balanceOf(userAddress);
    },

    async getCurveState(tokenAddress) {
        const token = new ethers.Contract(tokenAddress, ABI.TOKEN, this.getProvider());
        return token.getCurveState();
    },

    async getGraduationProgress(tokenAddress) {
        const token = new ethers.Contract(tokenAddress, ABI.TOKEN, this.getProvider());
        return token.graduationProgress();
    },

    async isGraduated(tokenAddress) {
        const token = new ethers.Contract(tokenAddress, ABI.TOKEN, this.getProvider());
        return token.graduated();
    }
};
