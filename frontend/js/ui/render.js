Object.assign(UI, {
    renderTokenCard(t) {
        const name = this.escapeHtml(t.name || 'Unknown');
        const symbol = this.escapeHtml(t.symbol || '???');
        const mcap = this.weiToEth(t.reserve) * this.ETH_PRICE;
        const progress = Math.min(100, (mcap / this.GRADUATION_MCAP) * 100);
        return '<div class="token-card" onclick="App.viewToken(\'' + t.address + '\')">' +
            '<div class="token-top"><div class="token-icon">' + symbol.charAt(0) + '</div>' +
            '<div class="token-meta"><h3>' + name + '</h3><span>$' + symbol + '</span></div>' +
            '<span class="token-creator">' + this.truncateAddress(t.creator) + '</span></div>' +
            '<div class="token-bottom"><span class="token-mcap">' + this.formatUSD(t.reserve) + '</span>' +
            '<span class="token-holders">' + (t.holders || 0) + ' holders</span></div>' +
            '<div class="progress-container"><div class="progress-bar"><div class="progress" style="width:' + progress + '%"></div></div>' +
            '<div class="progress-label"><span>' + progress.toFixed(0) + '%</span><span>$69,420</span></div></div></div>';
    },

    renderTokenList(tokens, id) {
        const el = document.getElementById(id);
        if (!el) return;
        if (!tokens || !tokens.length) {
            this.showEmpty(id, 'Be the first to launch a token on 0xNOX!', true);
            return;
        }
        el.innerHTML = tokens.map(t => this.renderTokenCard(t)).join('');
    },

    renderTokenPage(t) {
        const mcap = this.weiToEth(t.reserve) * this.ETH_PRICE;
        const supply = this.weiToEth(t.supply);
        const price = supply > 0 ? this.weiToEth(t.reserve) / supply : 0;
        const progress = Math.min(100, (mcap / this.GRADUATION_MCAP) * 100);
        const setEl = (id, prop, val) => { const el = document.getElementById(id); if (el) el[prop] = val; };
        setEl('detailIcon', 'textContent', (t.symbol || '?').charAt(0));
        setEl('tokenName', 'textContent', t.name || 'Unknown');
        setEl('tokenSymbol', 'textContent', '$' + (t.symbol || '???'));
        setEl('tokenCreator', 'textContent', this.truncateAddress(t.creator));
        setEl('tokenMcap', 'textContent', this.formatUSD(t.reserve));
        setEl('tokenPrice', 'textContent', price.toFixed(8) + ' ETH');
        setEl('tokenSupply', 'textContent', this.formatNumber(supply));
        setEl('tokenHolders', 'textContent', t.holders || 0);
        const gradProgress = document.getElementById('graduationProgress');
        if (gradProgress) gradProgress.style.width = progress + '%';
        setEl('graduationPercent', 'textContent', progress.toFixed(1) + '%');
        const ethBtn = document.getElementById('etherscanBtn');
        if (ethBtn) ethBtn.href = 'https://etherscan.io/address/' + t.address;
    }
});
