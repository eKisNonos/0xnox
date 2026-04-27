const Trading = {
    selectedToken: null,
    tradeType: 'buy',
    chart: null,
    chartSeries: null,
    tokenBalance: '0',
    refreshInterval: null,
    priceHistory: [],
    currentView: 'discovery',

    async init() {
        this.bindEvents();
        this.bindDiscoveryEvents();
        await this.loadDiscoveryPage();
        this.startAutoRefresh();
    },

    startAutoRefresh() {
        this.refreshInterval = setInterval(() => {
            this.loadTokens(document.querySelector('.sidebar-filter.active')?.dataset.filter || 'trending');
            if (this.selectedToken) this.refreshSelectedToken();
        }, 15000);
    },

    async refreshSelectedToken() {
        if (!this.selectedToken) return;
        try {
            const res = await fetch(`${CONFIG.API_URL}/tokens/${this.selectedToken.address}`);
            if (res.ok) {
                const token = await res.json();
                if (token && token.address) this.updateTokenDisplay(token);
            }
        } catch (err) {}
    },

    openToken(address) {
        this.showTerminal();
        this.selectTokenByAddress(address);
    },

    destroy() {
        if (this.refreshInterval) clearInterval(this.refreshInterval);
        if (this.chart) { this.chart.remove(); this.chart = null; }
    }
};

document.addEventListener('DOMContentLoaded', () => Trading.init());
window.addEventListener('wallet-changed', () => Trading.updateTradeUI());
window.addEventListener('balances-updated', () => Trading.updateTradeUI());
