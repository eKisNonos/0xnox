const CellframeWallet = {
    wallets: [],
    activeWallet: null,

    init() {
        this.clearStorage();
        this.updateUI();
    },

    isValidAddress(addr) {
        if (!addr || typeof addr !== 'string') return false;
        addr = addr.trim();
        return addr.length >= 90 && addr.length <= 120 && /^[A-Za-z][A-Za-z0-9]{89,119}$/.test(addr);
    },

    clearStorage() {
        localStorage.removeItem('0xnox_cf_wallets');
        localStorage.removeItem('0xnox_cf_active');
        this.wallets = [];
        this.activeWallet = null;
    },

    saveWallets() {},

    setActive(addr) {
        const w = this.wallets.find(x => x.address === addr);
        if (w) { this.activeWallet = w; this.saveWallets(); this.updateUI(); }
    },

    removeWallet(addr) {
        this.wallets = this.wallets.filter(w => w.address !== addr);
        if (this.activeWallet?.address === addr) this.activeWallet = this.wallets[0] || null;
        this.saveWallets();
        this.updateUI();
    },

    renameWallet(addr, name) {
        const w = this.wallets.find(x => x.address === addr);
        if (w) { w.name = name; this.saveWallets(); this.updateUI(); }
    },

    async refreshBalances() {
        for (const w of this.wallets) {
            try {
                const res = await fetch(CONFIG.API_URL + '/bridge/wallet/' + w.address + '/balance');
                const data = await res.json();
                w.balance = data.balance || '0';
            } catch (e) { w.balance = '0'; }
        }
        this.saveWallets();
        this.updateUI();
    },

    updateUI() {
        const input = document.getElementById('cfAddress');
        if (input && this.activeWallet) input.value = this.activeWallet.address;
        if (this.renderWalletSelector) this.renderWalletSelector();
        if (this.renderWalletManager) this.renderWalletManager();
    }
};

document.addEventListener('DOMContentLoaded', () => CellframeWallet.init());
