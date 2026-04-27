Object.assign(window.Launchpad = window.Launchpad || {}, {
    analyticsInitialized: false,

    async initAnalytics() {
        if (this.analyticsInitialized) return;

        const container = document.querySelector('.launchpad-analytics');
        if (!container) return;

        this.analyticsInitialized = true;

        container.innerHTML = `
            <div class="launchpad-metrics">
                <div class="metric-card">
                    <div class="metric-card-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>
                    <div class="metric-card-value" id="lpTotalLaunches">...</div>
                    <div class="metric-card-label">Total Launches</div>
                </div>
                <div class="metric-card">
                    <div class="metric-card-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
                    <div class="metric-card-value" id="lpTotalRaised">...</div>
                    <div class="metric-card-label">Total Raised</div>
                </div>
                <div class="metric-card">
                    <div class="metric-card-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>
                    <div class="metric-card-value" id="lpGraduated">...</div>
                    <div class="metric-card-label">Graduated</div>
                </div>
                <div class="metric-card">
                    <div class="metric-card-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></div>
                    <div class="metric-card-value" id="lpSuccessRate">...</div>
                    <div class="metric-card-label">Success Rate</div>
                </div>
            </div>
        `;

        await this.loadContractData();
    },

    async loadContractData() {
        try {
            const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);

            if (!CONFIG.FACTORY_ADDRESS) {
                this.showZeros();
                return;
            }

            const factory = new ethers.Contract(CONFIG.FACTORY_ADDRESS, [
                'function getTokenCount() view returns (uint256)',
                'function getTokenByIndex(uint256) view returns (address)'
            ], provider);

            const tokenCount = await factory.getTokenCount();
            const total = Number(tokenCount);

            document.getElementById('lpTotalLaunches').textContent = total.toLocaleString();

            let graduated = 0;
            let totalRaised = 0;
            const tokenABI = ['function graduated() view returns (bool)', 'function reserveBalance() view returns (uint256)'];

            const checkCount = Math.min(total, 15);
            for (let i = 0; i < checkCount; i++) {
                try {
                    const addr = await factory.getTokenByIndex(i);
                    const token = new ethers.Contract(addr, tokenABI, provider);
                    const [isGraduated, reserve] = await Promise.all([token.graduated(), token.reserveBalance()]);
                    if (isGraduated) graduated++;
                    totalRaised += parseFloat(ethers.formatEther(reserve));
                } catch {}
            }

            document.getElementById('lpTotalRaised').textContent = totalRaised.toFixed(4) + ' ETH';
            document.getElementById('lpGraduated').textContent = graduated.toString();
            document.getElementById('lpSuccessRate').textContent = checkCount > 0 ? ((graduated / checkCount) * 100).toFixed(0) + '%' : '0%';

        } catch (e) {
            console.error('[Launchpad Analytics]', e);
            this.showZeros();
        }
    },

    showZeros() {
        document.getElementById('lpTotalLaunches').textContent = '0';
        document.getElementById('lpTotalRaised').textContent = '0 ETH';
        document.getElementById('lpGraduated').textContent = '0';
        document.getElementById('lpSuccessRate').textContent = '0%';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const check = () => {
        const page = document.getElementById('launchPage');
        if (page && page.style.display !== 'none' && !Launchpad.analyticsInitialized) {
            Launchpad.initAnalytics();
        }
    };

    new MutationObserver(check).observe(document.body, { attributes: true, subtree: true, attributeFilter: ['style'] });
    setTimeout(check, 1000);
});
