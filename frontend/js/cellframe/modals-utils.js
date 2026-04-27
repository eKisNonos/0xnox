Object.assign(CellframeWallet, {
    closeModal(id) {
        const m = document.getElementById(id);
        if (m) m.remove();
    },

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            UI.showSuccess('Copied');
        }).catch(() => {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            UI.showSuccess('Copied');
        });
    },

    formatBalance(wei) {
        const num = parseFloat(wei || 0) / 1e18;
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
        return num.toFixed(2);
    },

    truncateAddress(address) {
        if (!address) return '';
        return address.slice(0, 12) + '...' + address.slice(-6);
    }
});
