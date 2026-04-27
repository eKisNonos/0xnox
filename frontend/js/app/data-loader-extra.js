Object.assign(App, {
    async loadPortfolio() {
        if (!Wallet.address) {
            UI.showEmpty('holdingsList', 'Connect wallet to see portfolio');
            return;
        }
        try {
            const res = await fetch(CONFIG.API_URL + '/users/' + Wallet.address + '/holdings');
            const data = await res.json();
            UI.renderHoldings(data.holdings || []);
            const trades = await fetch(CONFIG.API_URL + '/users/' + Wallet.address + '/trades');
            const tdata = await trades.json();
            UI.renderTrades(tdata.trades || []);
        } catch (e) {
            UI.showEmpty('holdingsList', 'No holdings found');
        }
    },

    async loadCreatorDashboard() {
        if (!Wallet.address) {
            UI.showEmpty('createdTokensList', 'Connect wallet to see your tokens');
            return;
        }
        try {
            const res = await fetch(CONFIG.API_URL + '/tokens?creator=' + Wallet.address);
            const data = await res.json();
            UI.renderCreatedTokens(data.tokens || []);
        } catch (e) {
            UI.showEmpty('createdTokensList', 'No tokens created yet');
        }
    },

    async loadNetworkInfo() {
        try {
            if (Wallet.provider) {
                const feeData = await Wallet.provider.getFeeData();
                const gasGwei = Math.round(Number(feeData.gasPrice) / 1e9);
                document.getElementById('gasPrice').textContent = gasGwei + ' gwei';
            }
            document.getElementById('ethPrice').textContent = '$' + UI.ETH_PRICE.toLocaleString();
        } catch (e) {}
    },

    async loadActivityFeed() {
        try {
            const res = await fetch(CONFIG.API_URL + '/activity?limit=10');
            const data = await res.json();
            this.renderActivityFeed(data.activities || []);
        } catch (e) {}
    },

    renderActivityFeed(activities) {
        const el = document.getElementById('activityFeed');
        if (!activities.length) {
            el.innerHTML = '<div class="empty-state">No activity yet. Be the first to launch a token.</div>';
            return;
        }
        el.innerHTML = activities.map(a => {
            const iconClass = a.type || 'create';
            const iconText = a.type === 'buy' ? 'B' : a.type === 'sell' ? 'S' : 'N';
            return '<div class="activity-item">' +
                '<div class="activity-icon ' + iconClass + '">' + iconText + '</div>' +
                '<div class="activity-info"><div class="activity-title">' + (a.title || 'Activity') + '</div>' +
                '<div class="activity-meta">' + UI.truncateAddress(a.user || '') + '</div></div>' +
                '<div class="activity-amount"><div class="amount">' + (a.amount || '') + '</div>' +
                '<div class="time">' + (a.time || '') + '</div></div></div>';
        }).join('');
    }
});
