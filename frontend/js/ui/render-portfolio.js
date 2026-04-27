Object.assign(UI, {
    renderHoldings(holdings) {
        const el = document.getElementById('holdingsList');
        if (!el) return;
        const setEl = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
        if (!holdings || !holdings.length) {
            el.innerHTML = '<div class="empty-state">No holdings yet</div>';
            setEl('holdingsCount', '0');
            setEl('portfolioValue', '$0');
            return;
        }
        let total = 0;
        el.innerHTML = holdings.map(h => {
            const name = this.escapeHtml(h.name || 'Unknown');
            const symbol = this.escapeHtml(h.symbol || '???');
            const value = this.weiToEth(h.balance) * this.weiToEth(h.reserve || 0) * this.ETH_PRICE / this.weiToEth(h.supply || 1);
            total += value;
            return '<div class="holding-card" onclick="App.viewToken(\'' + h.token_address + '\')">' +
                '<div class="holding-icon">' + symbol.charAt(0) + '</div>' +
                '<div class="holding-info"><div class="holding-name">' + name + '</div><div class="holding-symbol">$' + symbol + '</div></div>' +
                '<div class="holding-balance"><div class="holding-amount">' + this.formatNumber(this.weiToEth(h.balance)) + '</div><div class="holding-value">' + this.formatUSD(h.balance * h.reserve / (h.supply || 1)) + '</div></div></div>';
        }).join('');
        setEl('holdingsCount', holdings.length);
        setEl('portfolioValue', '$' + this.formatNumber(total));
    },

    renderTrades(trades) {
        const el = document.getElementById('tradesList');
        if (!el) return;
        const setEl = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
        if (!trades || !trades.length) {
            el.innerHTML = '<div class="empty-state">No trades yet</div>';
            setEl('tradesCount', '0');
            return;
        }
        el.innerHTML = trades.map(t => {
            const name = this.escapeHtml(t.name || t.token_address.slice(0, 10));
            const type = t.is_buy ? 'buy' : 'sell';
            return '<div class="trade-row">' +
                '<span class="trade-type ' + type + '">' + type + '</span>' +
                '<span class="trade-token">' + name + '</span>' +
                '<span class="trade-amount">' + this.formatNumber(this.weiToEth(t.token_amount)) + ' tokens</span>' +
                '<span class="trade-amount">' + this.formatETH(t.eth_amount) + '</span>' +
                '<span class="trade-time">' + new Date(t.created_at).toLocaleDateString() + '</span></div>';
        }).join('');
        setEl('tradesCount', trades.length);
    },

    renderCreatedTokens(tokens) {
        const el = document.getElementById('createdTokensList');
        if (!el) return;
        const setEl = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
        if (!tokens || !tokens.length) {
            el.innerHTML = '<div class="empty-state">No tokens created yet</div>';
            setEl('createdCount', '0');
            return;
        }
        let graduated = 0;
        el.innerHTML = tokens.map(t => {
            const name = this.escapeHtml(t.name || 'Unknown');
            const symbol = this.escapeHtml(t.symbol || '???');
            if (t.state === 3) graduated++;
            const mcap = this.weiToEth(t.reserve) * this.ETH_PRICE;
            const progress = Math.min(100, (mcap / this.GRADUATION_MCAP) * 100);
            return '<div class="created-token-card" onclick="App.viewToken(\'' + t.address + '\')">' +
                '<div class="created-token-header"><div class="created-token-info"><h3>' + name + '</h3><span>$' + symbol + '</span></div></div>' +
                '<div class="created-token-stats"><div class="created-token-stat"><label>Market Cap</label><span>' + this.formatUSD(t.reserve) + '</span></div>' +
                '<div class="created-token-stat"><label>Holders</label><span>' + (t.holders || 0) + '</span></div></div>' +
                '<div class="progress-container"><div class="progress-bar"><div class="progress" style="width:' + progress + '%"></div></div></div></div>';
        }).join('');
        setEl('createdCount', tokens.length);
        setEl('creatorGraduated', graduated);
    }
});
