Object.assign(Trading, {
    formatMcap(value) {
        const num = parseFloat(value) / 1e18;
        if (num >= 1000000) return '$' + (num / 1000000).toFixed(2) + 'M';
        if (num >= 1000) return '$' + (num / 1000).toFixed(2) + 'K';
        if (num >= 1) return '$' + num.toFixed(2);
        return '$' + num.toFixed(4);
    },

    formatNumber(num) {
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
        return num.toFixed(2);
    },

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = (now - date) / 1000;
        if (diff < 60) return 'just now';
        if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
        if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
        return Math.floor(diff / 86400) + 'd ago';
    },

    formatTimeShort(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = (now - date) / 1000;
        if (diff < 60) return Math.floor(diff) + 's';
        if (diff < 3600) return Math.floor(diff / 60) + 'm';
        if (diff < 86400) return Math.floor(diff / 3600) + 'h';
        return Math.floor(diff / 86400) + 'd';
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    calculatePrice(token) {
        const supply = parseFloat(token.supply || 0) / 1e18;
        const reserve = parseFloat(token.reserve || 0) / 1e18;
        if (supply === 0) return '0.00000001';
        const price = reserve / supply;
        if (price < 0.00000001) return '0.00000001';
        if (price < 0.0001) return price.toExponential(2);
        return price.toFixed(8);
    }
});
