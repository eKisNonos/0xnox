Object.assign(CellframeWallet, {
    showSwitchModal() {
        const m = document.createElement('div');
        m.className = 'modal-overlay show';
        m.id = 'cfSwitchModal';

        const walletItems = this.wallets.map(w => {
            const isActive = w.address === this.activeWallet?.address ? 'active' : '';
            return '<div class="cf-switch-item ' + isActive + '" onclick="CellframeWallet.selectAndClose(\'' + w.address + '\')">'+
                '<div class="cf-switch-icon">' + w.name.charAt(0) + '</div>' +
                '<div class="cf-switch-info">' +
                    '<span class="cf-switch-name">' + w.name + '</span>' +
                    '<span class="cf-switch-addr">' + this.truncateAddress(w.address) + '</span>' +
                '</div>' +
                '<span class="cf-switch-balance">' + this.formatBalance(w.balance) + ' NOX</span>' +
            '</div>';
        }).join('');

        m.innerHTML = '<div class="modal cf-modal">' +
            '<div class="modal-header">' +
                '<h2>Switch Wallet</h2>' +
                '<button class="modal-close" onclick="CellframeWallet.closeModal(\'cfSwitchModal\')">&times;</button>' +
            '</div>' +
            '<div class="modal-body">' +
                '<div class="cf-switch-list">' + walletItems + '</div>' +
                '<div class="cf-switch-actions">' +
                    '<button class="btn" onclick="CellframeWallet.closeModal(\'cfSwitchModal\'); CellframeWallet.showCreateModal()">+ Create New</button>' +
                    '<button class="btn btn-outline" onclick="CellframeWallet.closeModal(\'cfSwitchModal\'); CellframeWallet.showImportModal()">Import</button>' +
                '</div>' +
            '</div>' +
        '</div>';

        document.body.appendChild(m);
    },

    selectAndClose(address) {
        this.setActive(address);
        this.closeModal('cfSwitchModal');
    }
});
