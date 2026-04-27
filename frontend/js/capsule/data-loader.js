Object.assign(CapsuleDev, {
    async loadStats() {
        const devCapsules = document.getElementById('devCapsules');
        const devDownloads = document.getElementById('devDownloads');
        const devRevenue = document.getElementById('devRevenue');
        const devUnlocks = document.getElementById('devUnlocks');
        if (!devCapsules) return;
        if (typeof Wallet === 'undefined' || !Wallet.address) {
            if (devCapsules) devCapsules.textContent = '0';
            if (devDownloads) devDownloads.textContent = '0';
            if (devRevenue) devRevenue.textContent = '0 NOX';
            if (devUnlocks) devUnlocks.textContent = '0';
            return;
        }
        try {
            const res = await fetch(CONFIG.API_URL + '/capsules/developer/' + Wallet.address + '/stats');
            if (!res.ok) throw new Error('Failed to fetch');
            const stats = await res.json();
            if (devCapsules) devCapsules.textContent = stats.total_capsules || 0;
            if (devDownloads) devDownloads.textContent = this.formatNumber(stats.total_downloads || 0);
            if (devRevenue) devRevenue.textContent = this.formatNOX(stats.total_revenue || 0) + ' NOX';
            if (devUnlocks) devUnlocks.textContent = this.formatNumber(stats.total_unlocks || 0);
        } catch (e) {}
    },

    async loadCapsules() {
        const list = document.getElementById('devCapsulesList');
        if (!list) return;
        if (typeof Wallet === 'undefined' || !Wallet.address) {
            list.innerHTML = '<div class="empty-state">Connect wallet to view your capsules</div>';
            return;
        }
        list.innerHTML = '<div class="empty-state">Loading...</div>';
        try {
            const res = await fetch(CONFIG.API_URL + '/capsules/developer/' + Wallet.address);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            this.capsules = data.capsules || [];
            if (this.capsules.length === 0) {
                list.innerHTML = '<div class="empty-state">No capsules published yet. Use the Capsule Builder to create one!</div>';
                return;
            }
            list.innerHTML = this.capsules.map((c, i) => this.renderCapsuleCard(c, i)).join('');
        } catch (e) {
            list.innerHTML = '<div class="empty-state">No capsules found</div>';
        }
    }
});
