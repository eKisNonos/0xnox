Object.assign(CapsuleDev, {
    async publishToRegistry() {
        if (typeof Wallet === 'undefined' || !Wallet.address || !Wallet.signer) {
            if (typeof UI !== 'undefined') UI.showError('Please connect wallet first');
            return;
        }
        if (!this.ipfsCid) {
            if (typeof UI !== 'undefined') UI.showError('Please upload to IPFS first');
            return;
        }
        const manifest = this.buildManifest();
        const priceInput = document.getElementById('manifestPrice');
        const price = priceInput?.value || '0';
        let priceWei;
        try { priceWei = ethers.parseEther(price); }
        catch (e) { priceWei = 0n; }
        try {
            if (typeof UI !== 'undefined') UI.showToast('Publishing to registry...', 'info');
            const registry = new ethers.Contract(CONFIG.CAPSULE_REGISTRY, ABI.CAPSULE_REGISTRY, Wallet.signer);
            const tx = await registry.createCapsule(CONFIG.NOX_TOKEN, manifest.name, this.ipfsCid, priceWei);
            if (typeof UI !== 'undefined') UI.showToast('Transaction submitted, waiting for confirmation...', 'info');
            const receipt = await tx.wait();
            let capsuleId = null;
            for (const log of receipt.logs) {
                try {
                    const iface = new ethers.Interface(ABI.CAPSULE_REGISTRY);
                    const parsed = iface.parseLog(log);
                    if (parsed?.name === 'CapsuleCreated') { capsuleId = parsed.args[0].toString(); break; }
                } catch {}
            }
            try {
                await fetch(CONFIG.API_URL + '/capsules', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ capsule_id: capsuleId, ...manifest, ipfs_cid: this.ipfsCid, developer: Wallet.address })
                });
            } catch {}
            if (typeof UI !== 'undefined') UI.showSuccess('Capsule published successfully! ID: ' + capsuleId);
            await this.loadData();
            this.switchTab('dashboard');
        } catch (e) {
            if (typeof UI !== 'undefined') UI.showError(e.reason || e.message || 'Publication failed');
        }
    }
});
