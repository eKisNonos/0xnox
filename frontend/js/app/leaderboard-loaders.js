Object.assign(App, {
    async loadVolumeLeaderboard() {
        const list = document.getElementById('volumeList');
        if (!list) return;
        try {
            const res = await fetch(CONFIG.API_URL + '/leaderboard/volume?limit=10');
            const data = await res.json();
            const tokens = data.tokens || [];
            if (tokens.length === 0) {
                list.innerHTML = '<div class="empty-state">No data yet</div>';
                return;
            }
            list.innerHTML = tokens.map((t, i) => this.renderLeaderboardItem(t, i, 'volume')).join('');
        } catch (e) {
            const mockTokens = this.tokens.slice(0, 5).map((t, i) => ({ ...t, volume_24h: Math.random() * 10 * (5 - i) }));
            if (mockTokens.length > 0) {
                list.innerHTML = mockTokens.map((t, i) => this.renderLeaderboardItem(t, i, 'volume')).join('');
            } else {
                list.innerHTML = '<div class="empty-state">No tokens yet</div>';
            }
        }
    },

    async loadHoldersLeaderboard() {
        const list = document.getElementById('holdersList2');
        if (!list) return;
        try {
            const res = await fetch(CONFIG.API_URL + '/leaderboard/holders?limit=10');
            const data = await res.json();
            const tokens = data.tokens || [];
            if (tokens.length === 0) {
                list.innerHTML = '<div class="empty-state">No data yet</div>';
                return;
            }
            list.innerHTML = tokens.map((t, i) => this.renderLeaderboardItem(t, i, 'holders')).join('');
        } catch (e) {
            const mockTokens = this.tokens.slice(0, 5).sort((a, b) => (b.holders || 0) - (a.holders || 0));
            if (mockTokens.length > 0) {
                list.innerHTML = mockTokens.map((t, i) => this.renderLeaderboardItem(t, i, 'holders')).join('');
            } else {
                list.innerHTML = '<div class="empty-state">No tokens yet</div>';
            }
        }
    },

    async loadCreatorsLeaderboard() {
        const list = document.getElementById('creatorsList');
        if (!list) return;
        try {
            const res = await fetch(CONFIG.API_URL + '/leaderboard/creators?limit=10');
            const data = await res.json();
            const creators = data.creators || [];
            if (creators.length === 0) {
                list.innerHTML = '<div class="empty-state">No data yet</div>';
                return;
            }
            list.innerHTML = creators.map((c, i) => this.renderCreatorItem(c, i)).join('');
        } catch (e) {
            list.innerHTML = '<div class="empty-state">No creators yet</div>';
        }
    }
});
