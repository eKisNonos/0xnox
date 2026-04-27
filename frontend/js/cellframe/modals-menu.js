Object.assign(CellframeWallet, {
    showWalletMenu(address) {
        const w = this.wallets.find(x => x.address === address);
        if (!w) return;

        const m = document.createElement('div');
        m.className = 'modal-overlay show';
        m.id = 'cfMenuModal';

        m.innerHTML = '<div class="modal cf-modal cf-modal-sm">' +
            '<div class="modal-header">' +
                '<h2>' + w.name + '</h2>' +
                '<button class="modal-close" onclick="CellframeWallet.closeModal(\'cfMenuModal\')">&times;</button>' +
            '</div>' +
            '<div class="modal-body">' +
                '<div class="cf-menu-options">' +
                    '<button class="cf-menu-btn" onclick="CellframeWallet.copyToClipboard(\'' + w.address + '\'); CellframeWallet.closeModal(\'cfMenuModal\')">Copy Address</button>' +
                    '<button class="cf-menu-btn" onclick="CellframeWallet.promptRename(\'' + address + '\')">Rename</button>' +
                    '<button class="cf-menu-btn cf-menu-danger" onclick="CellframeWallet.confirmRemove(\'' + address + '\')">Remove</button>' +
                '</div>' +
            '</div>' +
        '</div>';

        document.body.appendChild(m);
    },

    promptRename(addr) {
        const w = this.wallets.find(x => x.address === addr);
        if (!w) return;
        this.closeModal('cfMenuModal');
        const newName = prompt('Enter new name:', w.name);
        if (newName && newName.trim()) {
            this.renameWallet(addr, newName.trim());
            UI.showSuccess('Wallet renamed');
        }
    },

    confirmRemove(addr) {
        this.closeModal('cfMenuModal');
        if (confirm('Remove this wallet from the list?')) {
            this.removeWallet(addr);
            UI.showSuccess('Wallet removed');
        }
    }
});
