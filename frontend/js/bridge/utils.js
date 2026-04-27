Object.assign(Bridge, {
    formatNOX(wei) {
        const num = parseFloat(ethers.formatEther(wei));
        if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
        return num.toFixed(2);
    },

    formatTime(timestamp) {
        const diff = Math.floor(Date.now() / 1000) - timestamp;
        if (diff < 60) return 'Just now';
        if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
        if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
        return Math.floor(diff / 86400) + 'd ago';
    },

    truncateAddress(addr) {
        if (!addr) return '';
        return addr.slice(0, 6) + '...' + addr.slice(-4);
    },

    truncateBytes32(bytes32) {
        if (!bytes32) return '';
        return bytes32.toString().slice(0, 10) + '...';
    }
});
