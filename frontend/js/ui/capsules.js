Object.assign(UI, {
    renderCapsulesStats(s) {
        document.getElementById('totalCapsules').textContent = s.total_capsules || 0;
        document.getElementById('totalDownloads').textContent = this.formatNumber(s.total_downloads || 0);
        document.getElementById('totalCreators').textContent = s.total_creators || 0;
    },

    renderCapsuleCard(c) {
        const icons = { wallet: 'W', defi: 'D', utility: 'U', game: 'G' };
        const icon = icons[c.app_type] || 'C';
        return '<div class="capsule-card" onclick="App.viewCapsule(' + c.id + ')">' +
            '<span class="capsule-type">' + (c.app_type || 'utility') + '</span>' +
            '<div class="capsule-card-header">' +
            '<div class="capsule-icon">' + icon + '</div>' +
            '<div class="capsule-info"><h3>' + (c.name || 'Unknown') + '</h3>' +
            '<span class="capsule-version">v' + (c.version || '1.0.0') + '</span></div></div>' +
            '<p class="capsule-description">' + (c.description || 'No description') + '</p>' +
            '<div class="capsule-token">' + this.truncateAddress(c.token_address) + '</div>' +
            '<div class="capsule-footer">' +
            '<span class="capsule-downloads">' + this.formatNumber(c.downloads || 0) + ' downloads</span>' +
            '<span class="capsule-rating">' + (c.rating || 0).toFixed(1) + ' rating</span>' +
            '</div></div>';
    },

    renderCapsulesList(capsules, id) {
        const el = document.getElementById(id);
        if (!capsules || !capsules.length) {
            el.innerHTML = '<div class="empty-state">No capsules found</div>';
            return;
        }
        el.innerHTML = capsules.map(c => this.renderCapsuleCard(c)).join('');
    }
});
