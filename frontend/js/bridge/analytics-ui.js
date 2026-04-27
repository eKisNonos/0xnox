Object.assign(Bridge, {
    analyticsData: { bridgeTVL: 0, bridgedToCell: 0, bridgedToEth: 0, txCount: 0, uniqueUsers: 0 },

    async initAnalytics() {
        const container = document.querySelector('.bridge-stats');
        if (!container) return;
        container.innerHTML = `
            <div class="analytics-grid">
                <div class="analytics-card main-stat">
                    <div class="stat-header"><span class="stat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></span><span class="stat-title">Bridge TVL</span></div>
                    <div class="stat-value" id="bridgeTVLMain">Loading...</div>
                    <div class="stat-sub">NOX locked in bridge</div>
                </div>
                <div class="analytics-card">
                    <div class="stat-header"><span class="stat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span><span class="stat-title">To Cellframe</span></div>
                    <div class="stat-value" id="bridgedToCellMain">Loading...</div>
                    <div class="stat-sub">Total bridged</div>
                </div>
                <div class="analytics-card">
                    <div class="stat-header"><span class="stat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></span><span class="stat-title">To Ethereum</span></div>
                    <div class="stat-value" id="bridgedToEthMain">Loading...</div>
                    <div class="stat-sub">Total bridged</div>
                </div>
                <div class="analytics-card">
                    <div class="stat-header"><span class="stat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg></span><span class="stat-title">Success Rate</span></div>
                    <div class="stat-value">99.2%</div>
                    <div class="stat-sub">All time</div>
                </div>
            </div>
            <div class="bridge-flow" style="margin-top:24px">
                <div class="flow-stat">
                    <div class="flow-icon eth"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1.75L5.75 12.25L12 16L18.25 12.25L12 1.75Z"/><path d="M12 22.25V16L5.75 12.25L12 22.25Z" opacity="0.6"/><path d="M12 22.25V16L18.25 12.25L12 22.25Z" opacity="0.6"/></svg></div>
                    <div class="flow-content"><span class="flow-label">Ethereum</span><span class="flow-value" id="flowEthBalance">Loading...</span></div>
                </div>
                <div class="flow-arrow"><svg width="48" height="24" viewBox="0 0 48 24" fill="none"><path d="M0 12h40M32 4l8 8-8 8" stroke="var(--accent)" stroke-width="2" stroke-linecap="round"/></svg></div>
                <div class="flow-stat">
                    <div class="flow-icon cf"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8" stroke="var(--bg)" stroke-width="2"/></svg></div>
                    <div class="flow-content"><span class="flow-label">Cellframe</span><span class="flow-value" id="flowCfBalance">Active</span></div>
                </div>
            </div>`;
        await this.loadContractData();
    },

    setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }
});
