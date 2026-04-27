Object.assign(CapsuleDev, {
    renderCapsuleCard(capsule, index) {
        const icon = (capsule.name || 'C').charAt(0).toUpperCase();
        const name = capsule.name || 'Unnamed';
        const desc = capsule.description || 'No description';
        const version = capsule.version || '1.0.0';
        const downloads = this.formatNumber(capsule.total_unlocks || 0);
        const revenue = this.formatNOX(capsule.total_revenue || 0);
        const price = this.formatNOX(capsule.price_nox || 0);
        const pricingModel = capsule.pricing_model || 'per_session';
        const appType = capsule.app_type || 'utility';
        const active = capsule.active !== false;
        return `<div class="dev-capsule-card ${active ? '' : 'inactive'}">
            <div class="dev-capsule-icon">${icon}</div>
            <div class="dev-capsule-info">
                <div class="dev-capsule-header">
                    <span class="dev-capsule-name">${this.escapeHtml(name)}</span>
                    <span class="dev-capsule-version">v${version}</span>
                    <span class="dev-capsule-badge ${appType}">${appType}</span>
                </div>
                <div class="dev-capsule-desc">${this.escapeHtml(desc)}</div>
                <div class="dev-capsule-stats">
                    <span class="dev-capsule-stat">Unlocks: <span>${downloads}</span></span>
                    <span class="dev-capsule-stat">Revenue: <span class="accent">${revenue} NOX</span></span>
                    <span class="dev-capsule-stat">Price: <span>${price} NOX/${pricingModel.replace('per_', '')}</span></span>
                </div>
            </div>
            <div class="dev-capsule-actions">
                <button class="btn btn-outline btn-sm" onclick="CapsuleDev.editCapsule(${index})">Edit</button>
                <button class="btn btn-outline btn-sm" onclick="CapsuleDev.viewAnalytics(${index})">Stats</button>
                <button class="btn btn-outline btn-sm" onclick="CapsuleDev.toggleActive(${index})">${active ? 'Deactivate' : 'Activate'}</button>
            </div>
        </div>`;
    }
});
