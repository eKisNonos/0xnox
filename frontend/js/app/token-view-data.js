Object.assign(App, {
    async loadTradeHistory(address) {
        const list = document.getElementById('tradeHistoryList');
        try {
            const res = await fetch(CONFIG.API_URL + '/tokens/' + address + '/trades?limit=20');
            const data = await res.json();
            const trades = data.trades || [];
            if (trades.length === 0) { list.innerHTML = '<div class="empty-state">No trades yet</div>'; return; }
            list.innerHTML = trades.map(t => {
                const type = t.is_buy ? 'buy' : 'sell';
                const amount = UI.formatNumber(UI.weiToEth(t.token_amount));
                const eth = parseFloat(UI.weiToEth(t.eth_amount)).toFixed(4);
                return `<div class="trade-history-item"><span class="trade-type-badge ${type}">${type}</span>
                    <div class="trade-history-info"><div class="trade-history-amount">${amount} tokens</div>
                    <div class="trade-history-price">${eth} ETH</div></div>
                    <div class="trade-history-time">${this.formatTime(t.created_at)}</div></div>`;
            }).join('');
        } catch (e) { list.innerHTML = '<div class="empty-state">Failed to load trades</div>'; }
    },

    async loadHolders(address) {
        const list = document.getElementById('holdersList');
        try {
            const res = await fetch(CONFIG.API_URL + '/tokens/' + address + '/holders?limit=10');
            const data = await res.json();
            const holders = data.holders || [];
            if (holders.length === 0) { list.innerHTML = '<div class="empty-state">No holders yet</div>'; return; }
            list.innerHTML = holders.map((h, i) => {
                const amount = UI.formatNumber(UI.weiToEth(h.balance));
                const pct = ((h.balance / (h.total_supply || 1)) * 100).toFixed(2);
                return `<div class="holder-item"><span class="holder-rank">#${i + 1}</span>
                    <span class="holder-address">${UI.truncateAddress(h.address)}</span>
                    <span class="holder-amount">${amount}</span><span class="holder-percent">${pct}%</span></div>`;
            }).join('');
        } catch (e) { list.innerHTML = '<div class="empty-state">Failed to load holders</div>'; }
    },

    toggleSlippage(type) {
        document.getElementById(type + 'SlippageSettings').classList.toggle('show');
    },

    setSlippage(type, value) {
        const slip = parseFloat(value) || 1;
        if (type === 'buy') { this.buySlippage = slip; document.getElementById('buySlippageValue').textContent = slip + '%'; }
        else { this.sellSlippage = slip; document.getElementById('sellSlippageValue').textContent = slip + '%'; }
        document.querySelectorAll(`#${type}SlippageSettings .slippage-option`).forEach(btn => {
            btn.classList.toggle('active', btn.textContent === slip + '%');
        });
    },

    shareToken() {
        if (!this.currentToken) return;
        const url = window.location.origin + '?token=' + this.currentToken;
        if (navigator.share) navigator.share({ title: 'Check out this token on 0xNOX', url });
        else { navigator.clipboard.writeText(url); UI.showSuccess('Link copied!'); }
    }
});
