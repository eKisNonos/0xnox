Object.assign(App, {
    async quickCreateToken(e) {
        e.preventDefault();
        if (!Wallet.address) return UI.showError('Connect wallet first');
        const name = document.getElementById('qTokenName').value.trim();
        const symbol = document.getElementById('qTokenSymbol').value.trim().toUpperCase();
        if (!name || !symbol) return UI.showError('Name and symbol are required');
        if (symbol.length > 8) return UI.showError('Symbol must be 8 characters or less');
        const btn = document.querySelector('#quickCreateForm .btn');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Creating...';
        try {
            UI.showToast('Creating token...', 'info');
            const addr = await Contracts.createToken(name, symbol, '');
            UI.showSuccess('Token created successfully!');
            document.getElementById('quickCreateForm').reset();
            this.viewToken(addr);
        } catch (err) {
            UI.showError(err.reason || err.message || 'Token creation failed');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
});
