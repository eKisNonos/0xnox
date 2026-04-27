Object.assign(UI, {
    updateWallet() {
        const addr = document.getElementById('walletAddress');
        const btn = document.getElementById('connectBtn');
        if (addr && btn) {
            if (Wallet.address) {
                addr.textContent = this.truncateAddress(Wallet.address);
                btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/></svg> Wallet';
                btn.classList.add('connected');
            } else {
                addr.textContent = '';
                btn.textContent = 'Connect Wallet';
                btn.classList.remove('connected');
            }
        }
        // Always update Bridge if initialized
        if (typeof Bridge !== 'undefined' && Bridge.initialized) {
            Bridge.refresh();
        }
    },

    renderStats(s) {
        const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        setEl('totalTokens', s.total_tokens || 0);
        setEl('totalVolume', this.formatUSD(s.total_volume || 0));
        setEl('totalGraduated', s.total_graduated || 0);
        setEl('totalBurned', this.formatNumber(this.weiToEth(s.total_burned || 0)));
    },

    renderKing(t) {
        const content = document.getElementById('kingContent');
        const section = document.getElementById('kingSection');
        if (!t) {
            if (content) content.innerHTML = '<div class="empty-state">No king yet</div>';
            if (section) section.style.display = 'none';
            return;
        }
        const name = this.escapeHtml(t.name || 'Unknown');
        const symbol = this.escapeHtml(t.symbol || '???');
        const kingHtml = '<div class="king-token" onclick="App.viewToken(\'' + t.address + '\')">' +
            '<div class="king-icon">' + symbol.charAt(0) + '</div>' +
            '<div class="king-info"><h3 class="king-name">' + name + '</h3>' +
            '<p class="king-meta">$' + symbol + ' · ' + this.truncateAddress(t.creator) + '</p></div>' +
            '<div class="king-stats"><div class="king-mcap">' + this.formatUSD(t.reserve) + '</div>' +
            '<div class="king-holders">' + (t.holders || 0) + ' holders</div></div></div>';
        if (content) content.innerHTML = kingHtml;
        if (section) {
            section.style.display = 'block';
            const card = document.getElementById('kingCard');
            if (card && !content) card.innerHTML = kingHtml;
        }
    }
});
