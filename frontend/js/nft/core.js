const NFTDashboard = {
    nftBalance: 0,
    tokenIds: [],
    initialized: false,

    async init() {
        if (this.initialized) {
            await this.refresh();
            return;
        }
        this.bindEvents();
        await this.loadData();
        this.initialized = true;
    },

    bindEvents() {
        window.addEventListener('wallet-changed', () => this.refresh());
    },

    async refresh() {
        await this.loadData();
    },

    async loadData() {
        await Promise.all([
            this.loadNFTStatus(),
            this.loadNFTStats(),
            this.loadRevenueData()
        ]);
    },

    formatNumber(n) {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return n.toLocaleString();
    },

    formatNOX(wei) {
        if (!wei) return '0';
        const num = parseFloat(ethers.formatEther(wei));
        if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
        return num.toFixed(2);
    }
};
