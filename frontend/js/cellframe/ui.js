Object.assign(CellframeWallet, {
    renderWalletSelector() {
        const c = document.getElementById('cfWalletSelector');
        if (!c) return;
        if (this.wallets.length === 0) {
            c.innerHTML = `<div class="cf-no-wallet"><p>No Cellframe wallet connected</p><button class="btn" onclick="CellframeWallet.showImportModal()">Import Wallet Address</button></div>`;
            return;
        }
        c.innerHTML = `<div class="cf-wallet-active"><div class="cf-wallet-icon">CF</div><div class="cf-wallet-info"><span class="cf-wallet-name">${this.activeWallet?.name || 'Select Wallet'}</span><span class="cf-wallet-addr">${this.truncateAddress(this.activeWallet?.address)}</span></div><div class="cf-wallet-balance">${this.formatBalance(this.activeWallet?.balance)} NOX</div><button class="cf-wallet-switch" onclick="CellframeWallet.showSwitchModal()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3h5v5M8 3H3v5M21 16v5h-5M3 16v5h5M21 3l-7 7M3 21l7-7"/></svg></button></div>`;
    },

    renderWalletManager() {
        const c = document.getElementById('cfWalletManager');
        if (!c) return;
        if (this.wallets.length === 0) {
            c.innerHTML = `<div class="cf-manager-empty"><h4>No Cellframe Wallets</h4><p>Import your Cellframe wallet address to bridge NOX tokens</p><div class="cf-manager-actions"><button class="btn" onclick="CellframeWallet.showImportModal()">Import Address</button></div></div>`;
            return;
        }
        c.innerHTML = `<div class="cf-manager-header"><h4>Cellframe Wallets</h4><div class="cf-manager-actions"><button class="btn btn-sm" onclick="CellframeWallet.showImportModal()">+ Import</button><button class="btn btn-sm btn-outline" onclick="CellframeWallet.refreshBalances()">Refresh</button></div></div><div class="cf-wallet-list">${this.wallets.map(w => this.renderWalletItem(w)).join('')}</div>`;
    },

    renderWalletItem(w) {
        const active = w.address === this.activeWallet?.address ? 'active' : '';
        return `<div class="cf-wallet-item ${active}" onclick="CellframeWallet.setActive('${w.address}')"><div class="cf-wallet-item-icon">${w.name.charAt(0)}</div><div class="cf-wallet-item-info"><span class="cf-wallet-item-name">${w.name}</span><span class="cf-wallet-item-addr">${this.truncateAddress(w.address)}</span></div><div class="cf-wallet-item-balance">${this.formatBalance(w.balance)} NOX</div><button class="cf-wallet-item-menu" onclick="event.stopPropagation(); CellframeWallet.showWalletMenu('${w.address}')">...</button></div>`;
    },

    showImportModal() {
        const m = document.createElement('div');
        m.className = 'modal-overlay show';
        m.id = 'cfImportModal';
        m.innerHTML = `<div class="modal cf-modal"><div class="modal-header"><h2>Import Cellframe Address</h2><button class="modal-close" onclick="CellframeWallet.closeModal('cfImportModal')">&times;</button></div><div class="modal-body"><div class="form-group"><label>Wallet Name</label><input type="text" id="cfImportName" placeholder="My Cellframe Wallet"></div><div class="form-group"><label>Cellframe Address</label><input type="text" id="cfImportAddr" placeholder="Enter your Cellframe address..."></div><p class="cf-import-note">Enter your Cellframe Backbone wallet address</p><button class="btn btn-full" onclick="CellframeWallet.importFromModal()">Import Address</button></div></div>`;
        document.body.appendChild(m);
    },

    async importFromModal() {
        const name = document.getElementById('cfImportName').value.trim() || null;
        const addr = document.getElementById('cfImportAddr').value.trim();
        try {
            await this.importWallet(addr, name);
            this.closeModal('cfImportModal');
            UI.showSuccess('Address imported');
        } catch (e) { UI.showError(e.message); }
    }
});
