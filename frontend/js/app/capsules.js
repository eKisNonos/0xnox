Object.assign(App, {
    async loadCapsules() {
        await Promise.all([this.loadCapsulesStats(), this.loadCapsulesList()]);
        this.bindCapsuleFilters();
    },

    bindCapsuleFilters() {
        document.querySelectorAll('.capsule-filter').forEach(f => {
            f.onclick = (e) => {
                this.currentCapsuleFilter = e.target.dataset.type;
                document.querySelectorAll('.capsule-filter').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.loadCapsulesList();
            };
        });
    },

    async loadCapsulesStats() {
        try {
            const res = await fetch(CONFIG.API_URL + '/capsules/stats');
            const stats = await res.json();
            UI.renderCapsulesStats(stats);
        } catch (e) {}
    },

    async loadCapsulesList() {
        UI.showLoading('capsulesList');
        try {
            let endpoint = '/capsules?limit=20';
            if (this.currentCapsuleFilter !== 'all') {
                endpoint += '&app_type=' + this.currentCapsuleFilter;
            }
            const res = await fetch(CONFIG.API_URL + endpoint);
            const data = await res.json();
            UI.renderCapsulesList(data.capsules || [], 'capsulesList');
        } catch (e) {
            UI.showEmpty('capsulesList', 'Failed to load capsules');
        }
    }
});
