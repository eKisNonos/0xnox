const UI = {
    ETH_PRICE: 2000,
    GRADUATION_MCAP: 69420,

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    },

    formatNumber(n) {
        const num = parseFloat(n) || 0;
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
        return num.toFixed(2);
    },

    weiToEth(wei) { return parseFloat(wei || 0) / 1e18; },
    formatUSD(wei) { return '$' + this.formatNumber(this.weiToEth(wei) * this.ETH_PRICE); },
    formatETH(wei) { return this.weiToEth(wei).toFixed(6) + ' ETH'; },
    truncateAddress(addr) { if (!addr) return 'Unknown'; return addr.slice(0, 6) + '...' + addr.slice(-4); },

    showLoading(id) {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '<div class="loading-state"><div class="spinner"></div>Loading...</div>';
    },

    showEmpty(id, msg, showCTA) {
        const el = document.getElementById(id);
        if (!el) return;
        if (showCTA) {
            el.innerHTML = '<div class="empty-state-hero"><h3>No Tokens Yet</h3><p>' + msg + '</p>' +
                '<button class="btn" onclick="document.getElementById(\'tokenNameInput\')?.focus()">Launch First Token</button></div>';
        } else {
            el.innerHTML = '<div class="empty-state">' + msg + '</div>';
        }
    },

    showToast(msg, type) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = msg;
        toast.className = 'toast ' + type + ' show';
        setTimeout(() => toast.classList.remove('show'), 4000);
    },

    showError(msg) { this.showToast(msg, 'error'); },
    showSuccess(msg) { this.showToast(msg, 'success'); },
    showInfo(msg) { this.showToast(msg, 'info'); }
};
