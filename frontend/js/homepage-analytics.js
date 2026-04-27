const HomepageAnalytics = {
    initialized: false,

    async init() {
        if (this.initialized) return;

        const trending = document.querySelector('.trending-section');
        if (!trending) return;

        this.initialized = true;

        let container = document.getElementById('homepageAnalytics');
        if (!container) {
            container = document.createElement('div');
            container.id = 'homepageAnalytics';
            container.className = 'token-analytics-grid';
            container.style.cssText = 'margin-bottom:24px;padding:0 16px;';
            trending.parentNode.insertBefore(container, trending);
        }

        container.innerHTML = `
            <div class="token-stat-card"><div class="token-stat-value" id="haTotalTokens">...</div><div class="token-stat-label">Tokens Created</div></div>
            <div class="token-stat-card"><div class="token-stat-value" id="haTotalVolume">...</div><div class="token-stat-label">Total Volume</div></div>
            <div class="token-stat-card"><div class="token-stat-value" id="haGraduated">...</div><div class="token-stat-label">Graduated</div></div>
            <div class="token-stat-card"><div class="token-stat-value" id="haAvgReserve">...</div><div class="token-stat-label">Avg Reserve</div></div>
            <div class="token-stat-card"><div class="token-stat-value" id="haTopGainer" style="color:#00ff88;">...</div><div class="token-stat-label">Top Gainer</div></div>
        `;

        await this.loadData();
    },

    async loadData() {
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

            document.getElementById('haTotalTokens').textContent = total.toLocaleString();

            let graduated = 0;
            let totalReserve = 0;
            let topGain = 0;

            const tokenABI = ['function graduated() view returns (bool)', 'function reserveBalance() view returns (uint256)'];
            const checkCount = Math.min(total, 10);

            for (let i = Math.max(0, total - checkCount); i < total; i++) {
                try {
                    const addr = await factory.getTokenByIndex(i);
                    const token = new ethers.Contract(addr, tokenABI, provider);
                    const [isGraduated, reserve] = await Promise.all([token.graduated(), token.reserveBalance()]);

                    if (isGraduated) graduated++;

                    const reserveEth = parseFloat(ethers.formatEther(reserve));
                    totalReserve += reserveEth;

                    if (reserveEth > 0.001) {
                        const gain = ((reserveEth / 0.001) - 1) * 100;
                        if (gain > topGain) topGain = gain;
                    }
                } catch {}
            }

            document.getElementById('haTotalVolume').textContent = totalReserve.toFixed(4) + ' ETH';
            document.getElementById('haGraduated').textContent = graduated.toString();
            document.getElementById('haAvgReserve').textContent = (checkCount > 0 ? totalReserve / checkCount : 0).toFixed(4) + ' ETH';
            document.getElementById('haTopGainer').textContent = '+' + topGain.toFixed(1) + '%';

        } catch (e) {
            console.error('[Homepage Analytics]', e);
            this.showZeros();
        }
    },

    showZeros() {
        document.getElementById('haTotalTokens').textContent = '0';
        document.getElementById('haTotalVolume').textContent = '0 ETH';
        document.getElementById('haGraduated').textContent = '0';
        document.getElementById('haAvgReserve').textContent = '0 ETH';
        document.getElementById('haTopGainer').textContent = '+0%';
    }
};

document.addEventListener('DOMContentLoaded', () => setTimeout(() => HomepageAnalytics.init(), 500));
