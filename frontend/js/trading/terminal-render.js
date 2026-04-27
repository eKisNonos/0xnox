Object.assign(Trading, {
    async loadTokens(filter = 'trending') {
        const c = document.getElementById('tokenListScroll');
        if (!c) return;
        if (c.children.length === 0 || c.querySelector('.empty-state')) {
            c.innerHTML = '<div class="loading-state"><div class="spinner"></div></div>';
        }
        try {
            let url;
            if (filter === 'trending') url = `${CONFIG.API_URL}/trending?limit=50`;
            else if (filter === 'graduating') url = `${CONFIG.API_URL}/tokens/graduating?limit=50`;
            else if (filter === 'new') url = `${CONFIG.API_URL}/tokens?limit=50&sort=new`;
            else url = `${CONFIG.API_URL}/tokens?limit=50`;
            const res = await fetch(url);
            const data = await res.json();
            if (!data.tokens || data.tokens.length === 0) {
                c.innerHTML = '<div class="empty-state" style="padding:40px 20px;text-align:center"><p style="color:var(--text-muted);margin-bottom:16px">No tokens yet</p><button class="btn btn-sm" onclick="App.showPage(\'launch\')">Launch First Token</button></div>';
                return;
            }
            c.innerHTML = data.tokens.map(t => this.renderTokenListItem(t)).join('');
            if (!this.selectedToken && data.tokens.length > 0) this.selectToken(data.tokens[0]);
        } catch (err) {
            if (c.children.length === 0) c.innerHTML = '<div class="empty-state" style="padding:20px;text-align:center;color:var(--text-muted)">Failed to load tokens</div>';
        }
    },

    renderTokenListItem(t) {
        const mcap = this.formatMcap(t.market_cap || t.reserve || 0);
        const symbol = (t.symbol || '???').substring(0, 4);
        const isActive = this.selectedToken?.address === t.address;
        const change = t.change_24h || 0;
        return `<div class="token-list-item ${isActive ? 'active' : ''}" onclick="Trading.selectTokenByAddress('${t.address}')">
            <div class="token-list-icon">${t.icon ? `<img src="${t.icon}" alt="" onerror="this.parentElement.textContent='${symbol}'">` : symbol}</div>
            <div class="token-list-info"><div class="token-list-name">${t.name || 'Unknown'}</div>
            <div class="token-list-symbol">${t.symbol || '???'}</div></div>
            <div class="token-list-price"><div class="token-list-mcap">${mcap}</div>
            <div class="token-list-change ${change >= 0 ? 'green' : 'red'}">${change !== 0 ? (change >= 0 ? '+' : '') + change.toFixed(1) + '%' : '--'}</div></div></div>`;
    },

    updateTokenDisplay(t) {
        const iconEl = document.getElementById('selectedTokenIcon');
        const nameEl = document.getElementById('selectedTokenName');
        const creatorEl = document.getElementById('selectedTokenCreator');
        const priceEl = document.getElementById('headerPrice');
        const mcapEl = document.getElementById('headerMcap');
        const volumeEl = document.getElementById('headerVolume');
        const holdersEl = document.getElementById('headerHolders');
        const gradPctEl = document.getElementById('gradPercent');
        const gradBarEl = document.getElementById('gradProgress');
        if (iconEl) iconEl.innerHTML = t.icon ? `<img src="${t.icon}" alt="">` : (t.symbol || '???').substring(0, 3);
        if (nameEl) nameEl.innerHTML = `${t.name || 'Unknown'} <span class="symbol">${t.symbol || '???'}</span>`;
        if (creatorEl) creatorEl.textContent = `Created by ${(t.creator || '').substring(0, 6)}...${(t.creator || '').slice(-4)}`;
        const price = this.calculatePrice(t);
        if (priceEl) priceEl.textContent = price + ' ETH';
        if (mcapEl) mcapEl.textContent = this.formatMcap(t.market_cap || t.reserve || 0);
        if (volumeEl) volumeEl.textContent = this.formatMcap(t.volume_24h || 0);
        if (holdersEl) holdersEl.textContent = t.holders || 0;
        const mcapNum = parseFloat(t.market_cap || 0) / 1e18;
        const pct = Math.min((mcapNum / 69420) * 100, 100);
        if (gradPctEl) gradPctEl.textContent = pct.toFixed(1) + '%';
        if (gradBarEl) gradBarEl.style.width = pct + '%';
    }
});
