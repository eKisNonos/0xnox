Object.assign(Bridge, {
    currentFilter: 'all',

    setFilter(filter) {
        this.currentFilter = filter;
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === filter));
        this.renderHistory();
    },

    renderHistory() {
        const el = document.getElementById('bridgeHistory');
        if (!el) return;
        let filtered = this.transactions || [];
        if (this.currentFilter === 'pending') filtered = filtered.filter(tx => tx.status < 2);
        else if (this.currentFilter === 'completed') filtered = filtered.filter(tx => tx.status === 2);
        if (filtered.length === 0) {
            el.innerHTML = '<div class="empty-state"><i class="icon-inbox"></i><p>No transactions found</p></div>';
            return;
        }
        el.innerHTML = filtered.map(tx => this.renderTx(tx)).join('');
    },

    formatTime(dateStr) {
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const diff = now - date;
            if (diff < 60000) return 'Just now';
            if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
            if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
            if (diff < 604800000) return Math.floor(diff / 86400000) + 'd ago';
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch { return dateStr; }
    },

    copyText(text) {
        navigator.clipboard.writeText(text).then(() => UI.showSuccess('Copied!')).catch(() => UI.showError('Copy failed'));
    }
});
