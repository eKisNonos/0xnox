const PlatformStats = {
    async init() {
        await this.loadStats();
        setInterval(() => this.loadStats(), 60000);
    },

    async loadStats() {
        try {
            const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);

            if (!CONFIG.FACTORY_ADDRESS) {
                this.showZeros();
                return;
            }

            const factory = new ethers.Contract(CONFIG.FACTORY_ADDRESS, [
                'function getTokenCount() view returns (uint256)'
            ], provider);

            const tokenCount = await factory.getTokenCount();
            const total = Number(tokenCount);

            this.setText('statTotalTokens', total.toLocaleString());

            let graduated = 0;
            let totalVolume = 0;

            if (total > 0) {
                const tokenABI = ['function graduated() view returns (bool)', 'function reserveBalance() view returns (uint256)'];
                const factoryFull = new ethers.Contract(CONFIG.FACTORY_ADDRESS, [
                    'function getTokenByIndex(uint256) view returns (address)'
                ], provider);

                const checkCount = Math.min(total, 20);
                for (let i = 0; i < checkCount; i++) {
                    try {
                        const addr = await factoryFull.getTokenByIndex(i);
                        const token = new ethers.Contract(addr, tokenABI, provider);
                        const [isGraduated, reserve] = await Promise.all([token.graduated(), token.reserveBalance()]);
                        if (isGraduated) graduated++;
                        totalVolume += parseFloat(ethers.formatEther(reserve));
                    } catch {}
                }
            }

            this.setText('statTotalVolume', totalVolume.toFixed(2) + ' ETH');
            this.setText('statGraduated', graduated.toString());
            this.setText('statActiveUsers', '--');

        } catch (e) {
            console.error('[Platform Stats]', e);
            this.showZeros();
        }
    },

    showZeros() {
        this.setText('statTotalTokens', '0');
        this.setText('statTotalVolume', '0 ETH');
        this.setText('statGraduated', '0');
        this.setText('statActiveUsers', '--');
    },

    setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => PlatformStats.init(), 500);
});
