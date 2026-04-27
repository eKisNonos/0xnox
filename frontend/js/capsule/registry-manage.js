Object.assign(CapsuleDev, {
    async toggleActive(index) {
        const capsule = this.capsules[index];
        if (!capsule || typeof Wallet === 'undefined' || !Wallet.signer) return;
        try {
            const registry = new ethers.Contract(CONFIG.CAPSULE_REGISTRY, ABI.CAPSULE_REGISTRY, Wallet.signer);
            if (capsule.active !== false) {
                if (typeof UI !== 'undefined') UI.showToast('Deactivating capsule...', 'info');
                const tx = await registry.deactivateCapsule(capsule.capsule_id);
                await tx.wait();
                if (typeof UI !== 'undefined') UI.showSuccess('Capsule deactivated');
            } else {
                if (typeof UI !== 'undefined') UI.showToast('Activating capsule...', 'info');
                const tx = await registry.activateCapsule(capsule.capsule_id);
                await tx.wait();
                if (typeof UI !== 'undefined') UI.showSuccess('Capsule activated');
            }
            await this.loadCapsules();
        } catch (e) {
            if (typeof UI !== 'undefined') UI.showError(e.reason || e.message || 'Failed to toggle capsule status');
        }
    },

    editCapsule(index) {
        const capsule = this.capsules[index];
        if (!capsule) return;
        if (typeof UI !== 'undefined') UI.showToast('Edit feature coming soon', 'info');
    },

    viewAnalytics(index) {
        const capsule = this.capsules[index];
        if (!capsule) return;
        const unlocks = capsule.total_unlocks || 0;
        const revenue = this.formatNOX(capsule.total_revenue || 0);
        if (typeof UI !== 'undefined') UI.showToast(`${capsule.name}: ${unlocks} unlocks, ${revenue} NOX revenue`, 'info');
    }
});
