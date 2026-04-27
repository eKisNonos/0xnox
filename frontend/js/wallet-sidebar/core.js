const WalletSidebar = {
    isOpen: false,
    currentTab: 'holdings',
    tradeType: 'buy',
    selectedToken: null,
    holdings: [],

    init() {
        this.bindEvents();
    },

    bindEvents() {
        document.getElementById('qtAmount').oninput = () => this.updateEstimate();
    },

    open() {
        this.isOpen = true;
        document.getElementById('walletSidebar').classList.add('open');
        document.getElementById('sidebarOverlay').classList.add('show');
        this.loadWalletInfo();
        this.loadHoldings();
    },

    close() {
        this.isOpen = false;
        document.getElementById('walletSidebar').classList.remove('open');
        document.getElementById('sidebarOverlay').classList.remove('show');
    },

    toggle() {
        if (this.isOpen) this.close();
        else this.open();
    },

    formatNumber(num) {
        const n = parseFloat(num);
        if (isNaN(n)) return '0';
        if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(2) + 'K';
        if (n < 0.01) return n.toFixed(6);
        return n.toFixed(2);
    }
};

document.addEventListener('DOMContentLoaded', () => WalletSidebar.init());
