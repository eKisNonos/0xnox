Object.assign(App, {
    async createToken(e) {
        e.preventDefault();
        if (!Wallet.address) return UI.showError('Connect wallet first');
        const name = document.getElementById('tokenNameInput').value.trim();
        const symbol = document.getElementById('tokenSymbolInput').value.trim().toUpperCase();
        const description = document.getElementById('tokenDescription')?.value?.trim() || '';
        const twitter = document.getElementById('tokenTwitter')?.value?.trim() || '';
        const discord = document.getElementById('tokenDiscord')?.value?.trim() || '';
        const telegram = document.getElementById('tokenTelegram')?.value?.trim() || '';
        const website = document.getElementById('tokenWebsite')?.value?.trim() || '';
        if (!name || !symbol) return UI.showError('Name and symbol are required');
        if (symbol.length > 8) return UI.showError('Symbol must be 8 characters or less');
        const metadata = {
            name, symbol, description,
            image: this.tokenLogo || '',
            banner: this.tokenBanner || '',
            external_url: website,
            social: { twitter, discord, telegram, website },
            created_at: Date.now()
        };
        const btn = document.querySelector('.btn-create');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Creating...';
        try {
            let metadataUri = '';
            if (Object.values(metadata.social).some(v => v) || metadata.description || metadata.image) {
                UI.showToast('Uploading metadata...', 'info');
                try {
                    const res = await fetch(CONFIG.API_URL + '/metadata', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(metadata)
                    });
                    const data = await res.json();
                    metadataUri = data.uri || '';
                } catch (err) {}
            }
            UI.showToast('Creating token...', 'info');
            const addr = await Contracts.createToken(name, symbol, metadataUri);
            UI.showSuccess('Token created successfully!');
            this.resetCreateForm();
            this.viewToken(addr);
        } catch (err) {
            UI.showError(err.reason || err.message || 'Token creation failed');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    },

    resetCreateForm() {
        this.tokenLogo = null;
        this.tokenBanner = null;
        document.getElementById('createForm')?.reset();
        const logoPreview = document.getElementById('logoPreview');
        const bannerPreview = document.getElementById('bannerPreview');
        if (logoPreview) logoPreview.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><span>Logo</span>';
        if (bannerPreview) bannerPreview.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="8" cy="10" r="2"/><path d="M22 15l-6-6-8 10"/></svg><span>Banner</span>';
        document.getElementById('logoUpload')?.classList.remove('has-image');
        document.getElementById('bannerUpload')?.classList.remove('has-image');
    }
});
