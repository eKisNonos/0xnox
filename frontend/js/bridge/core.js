const Bridge = {
    currentFilter: 'all',
    transactions: [],
    initialized: false,

    async init() {
        this.bindEvents();
        this.syncWithCFWallet();
        this.loadSavedCFWallet();
        this.updateWalletDisplay();
        await this.loadData();
        this.initialized = true;
        if (this.initAnalytics) this.initAnalytics();
        this.setupWalletListeners();
    },

    setupWalletListeners() {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => this.handleWalletChange(accounts[0] || null));
        }
        // Listen for wallet-changed event from Wallet.connect()
        window.addEventListener('wallet-changed', (e) => this.handleWalletChange(e.detail?.address || Wallet.address));
        // Also listen for WalletConnect specific events
        window.addEventListener('walletconnect-connected', () => this.handleWalletChange(Wallet.address));
        window.addEventListener('walletconnect-disconnected', () => this.handleWalletChange(null));
    },

    handleWalletChange(address) {
        this.updateWalletDisplay();
        this.loadData();
    },

    async refresh() {
        this.updateWalletDisplay();
        await this.loadData();
    },

    syncWithCFWallet() {
        if (typeof CellframeWallet !== 'undefined' && CellframeWallet.activeWallet) {
            const cfInput = document.getElementById('cfAddress');
            if (cfInput) cfInput.value = CellframeWallet.activeWallet.address;
        }
    },

    bindEvents() {
        const form = document.getElementById('bridgeForm');
        if (form) form.onsubmit = (e) => this.bridgeToCell(e);
        const amountInput = document.getElementById('bridgeAmount');
        if (amountInput) amountInput.oninput = () => this.updateEstimate();
        document.querySelectorAll('.bridge-tab').forEach(tab => {
            tab.onclick = (e) => this.setFilter(e.target.dataset.type);
        });
    },

    async loadData() {
        console.log('[Bridge] loadData called, Wallet.address:', Wallet.address);
        await Promise.all([this.loadStats(), this.loadHistory(), this.loadNOXBalance()]);
    },

    setFilter(type) {
        this.currentFilter = type;
        document.querySelectorAll('.bridge-tab').forEach(t => t.classList.toggle('active', t.dataset.type === type));
        this.renderHistory();
    }
};
