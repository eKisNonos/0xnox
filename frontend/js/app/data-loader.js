Object.assign(App, {
    setFilter(f) {
        this.currentFilter = f;
        document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.filter === f));
        this.loadTokens();
    },

    async loadData() {
        await Promise.all([
            this.loadStats(),
            this.loadKing(),
            this.loadTokens(),
            this.loadNetworkInfo(),
            this.loadActivityFeed(),
            this.loadLeaderboards()
        ]);
        this.bindLeaderboardTabs();
    },

    async loadStats() {
        try {
            const res = await fetch(CONFIG.API_URL + '/stats');
            const stats = await res.json();
            UI.renderStats(stats);
        } catch (e) {}
    },

    async loadKing() {
        try {
            const res = await fetch(CONFIG.API_URL + '/king');
            const data = await res.json();
            UI.renderKing(data.king);
        } catch (e) { UI.renderKing(null); }
    },

    async loadTokens() {
        UI.showLoading('tokenList');
        try {
            let endpoint = '/tokens?limit=20';
            if (this.currentFilter === 'new') endpoint += '&sort=new';
            else if (this.currentFilter === 'graduating') endpoint = '/tokens/graduating?limit=20';
            const res = await fetch(CONFIG.API_URL + endpoint);
            const data = await res.json();
            this.tokens = data.tokens || [];
            UI.renderTokenList(this.tokens, 'tokenList');
        } catch (e) {
            UI.showEmpty('tokenList', 'Connect backend to see tokens');
        }
    }
});
