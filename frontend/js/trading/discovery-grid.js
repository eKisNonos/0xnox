Object.assign(Trading, {
    async loadTrendingCarousel() {
        const container = document.getElementById('trendingCarousel');
        if (!container) return;
        try {
            const res = await fetch(CONFIG.API_URL + '/trending?limit=10');
            const data = await res.json();
            const tokens = data.tokens || [];
            if (tokens.length === 0) {
                container.innerHTML = '<div class="nox-token-empty">No trending tokens yet</div>';
                return;
            }
            container.innerHTML = tokens.map(t => this.renderTrendingCard(t)).join('');
        } catch (err) {
            container.innerHTML = '<div class="nox-token-empty">No trending tokens yet</div>';
        }
    },

    async loadTokenGrid(filter) {
        const container = document.getElementById('tokenGrid');
        if (!container) return;
        container.innerHTML = '<div class="nox-token-empty"><div class="spinner"></div></div>';
        try {
            let url = CONFIG.API_URL;
            if (filter === 'trending') url += '/trending?limit=50';
            else if (filter === 'graduating') url += '/tokens/graduating?limit=50';
            else if (filter === 'new') url += '/tokens?limit=50&sort=new';
            else if (filter === 'mcap') url += '/tokens?limit=50&sort=mcap';
            else url += '/tokens?limit=50';
            const res = await fetch(url);
            const data = await res.json();
            const tokens = data.tokens || [];
            if (tokens.length === 0) {
                container.innerHTML = '<div class="nox-token-empty"><h3>No Tokens Yet</h3><p>Be the first to launch!</p><button class="btn" onclick="App.showPage(\'launch\')">Create Token</button></div>';
                return;
            }
            container.innerHTML = tokens.map(t => this.renderTokenCard(t)).join('');
        } catch (err) {
            container.innerHTML = '<div class="nox-token-empty">Failed to load tokens</div>';
        }
    },

    async searchTokens(query) {
        if (!query || query.length < 2) {
            this.loadTokenGrid('trending');
            return;
        }
        const container = document.getElementById('tokenGrid');
        if (!container) return;
        try {
            const res = await fetch(CONFIG.API_URL + '/search?q=' + encodeURIComponent(query) + '&limit=20');
            const data = await res.json();
            const tokens = data.tokens || [];
            if (tokens.length === 0) {
                container.innerHTML = '<div class="nox-token-empty">No tokens found</div>';
                return;
            }
            container.innerHTML = tokens.map(t => this.renderTokenCard(t)).join('');
        } catch (err) {}
    }
});
