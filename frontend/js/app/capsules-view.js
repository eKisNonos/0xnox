Object.assign(App, {
    async viewCapsule(id) {
        try {
            const res = await fetch(CONFIG.API_URL + '/capsules/' + id);
            const capsule = await res.json();
            const modal = document.createElement('div');
            modal.className = 'modal-overlay show';
            modal.id = 'capsuleModal';
            modal.innerHTML = `<div class="modal capsule-detail-modal">
                <div class="modal-header">
                    <h2>${capsule.name || 'Capsule'}</h2>
                    <button class="modal-close" onclick="document.getElementById('capsuleModal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <p class="capsule-desc">${capsule.description || 'No description'}</p>
                    <div class="capsule-detail-stats">
                        <div><span>Price</span><strong>${UI.formatNumber(UI.weiToEth(capsule.price_nox || 0))} NOX</strong></div>
                        <div><span>Downloads</span><strong>${capsule.total_unlocks || 0}</strong></div>
                        <div><span>Version</span><strong>v${capsule.version || '1.0.0'}</strong></div>
                    </div>
                    <button class="btn btn-full" onclick="App.unlockCapsule('${id}')">Unlock Capsule</button>
                </div>
            </div>`;
            document.body.appendChild(modal);
            modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        } catch (e) {
            UI.showError('Failed to load capsule details');
        }
    },

    async unlockCapsule(id) {
        if (!Wallet.address) {
            UI.showError('Connect wallet first');
            return;
        }
        try {
            const registry = new ethers.Contract(CONFIG.CAPSULE_REGISTRY, ABI.CAPSULE_REGISTRY, Wallet.signer);
            const capsule = await registry.getCapsule(id);
            const nox = new ethers.Contract(CONFIG.NOX_TOKEN, ABI.ERC20, Wallet.signer);
            const allowance = await nox.allowance(Wallet.address, CONFIG.CAPSULE_REGISTRY);
            if (allowance < capsule.priceNox) {
                UI.showToast('Approving NOX...', 'info');
                const approveTx = await nox.approve(CONFIG.CAPSULE_REGISTRY, ethers.MaxUint256);
                await approveTx.wait();
            }
            UI.showToast('Unlocking capsule...', 'info');
            const tx = await registry.unlock(id);
            await tx.wait();
            UI.showSuccess('Capsule unlocked!');
            document.getElementById('capsuleModal')?.remove();
        } catch (e) {
            UI.showError(e.reason || e.message || 'Unlock failed');
        }
    }
});
