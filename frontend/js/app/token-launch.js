Object.assign(App, {
    async launchToken(e) {
        e.preventDefault();
        if (!Wallet.address) return UI.showError('Connect wallet first');
        const name = document.getElementById('launchTokenName').value.trim();
        const symbol = document.getElementById('launchTokenSymbol').value.trim().toUpperCase();
        const desc = document.getElementById('launchTokenDesc')?.value.trim() || '';
        const twitter = document.getElementById('socialTwitter')?.value.trim() || '';
        const telegram = document.getElementById('socialTelegram')?.value.trim() || '';
        const discord = document.getElementById('socialDiscord')?.value.trim() || '';
        const website = document.getElementById('socialWebsite')?.value.trim() || '';
        if (!name || !symbol) return UI.showError('Name and symbol are required');
        if (symbol.length > 8) return UI.showError('Symbol must be 8 characters or less');
        try {
            const hasNFT = await Contracts.hasNFTPass(Wallet.address);
            if (!hasNFT) {
                const nox = new ethers.Contract(CONFIG.NOX_TOKEN, ABI.ERC20, Wallet.provider);
                const balance = await nox.balanceOf(Wallet.address);
                const creationFee = BigInt(CONFIG.CREATION_FEE);
                if (balance < creationFee) {
                    const needed = (creationFee - balance) / BigInt(1e18);
                    return UI.showError(`Need ${needed.toString()} more NOX tokens.`);
                }
            }
        } catch (err) {}
        const btn = document.getElementById('launchSubmitBtn');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Launching...';
        try {
            const metadata = { name, symbol, description: desc, image: this.tokenLogo || '', banner: this.tokenBanner || '', social: { twitter, telegram, discord, website } };
            let metadataUri = '';
            if (desc || twitter || telegram || discord || website || this.tokenLogo || this.tokenBanner) {
                try {
                    UI.showToast('Uploading metadata...', 'info');
                    const res = await fetch(CONFIG.API_URL + '/metadata', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(metadata) });
                    const data = await res.json();
                    metadataUri = data.uri || '';
                } catch (err) {}
            }
            UI.showToast('Deploying token...', 'info');
            const addr = await Contracts.createToken(name, symbol, metadataUri || desc);
            UI.showSuccess('Token launched successfully!');
            document.getElementById('launchForm').reset();
            this.tokenLogo = null;
            this.tokenBanner = null;
            this.showPage('home');
            setTimeout(() => Trading.selectTokenByAddress(addr), 500);
        } catch (err) {
            let errorMsg = 'Token launch failed';
            if (err.data?.includes('e450d38c')) errorMsg = 'Insufficient NOX balance';
            else if (err.reason) errorMsg = err.reason;
            else if (err.message) errorMsg = err.message;
            UI.showError(errorMsg);
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
});
