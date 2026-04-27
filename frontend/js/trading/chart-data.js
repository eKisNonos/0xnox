Object.assign(Trading, {
    async loadChartData(timeframe) {
        if (!this.chartSeries || !this.selectedToken) return;
        try {
            const res = await fetch(`${CONFIG.API_URL}/tokens/${this.selectedToken.address}/chart?tf=${timeframe}`);
            const data = await res.json();
            if (data.prices && data.prices.length > 0) {
                const chartData = data.prices.map(p => ({
                    time: Math.floor(new Date(p.time).getTime() / 1000),
                    value: parseFloat(p.price)
                }));
                this.chartSeries.setData(chartData);
                this.chart.timeScale().fitContent();
            } else {
                this.generatePlaceholderChart(timeframe);
            }
        } catch (err) {
            this.generatePlaceholderChart(timeframe);
        }
    },

    generatePlaceholderChart(timeframe) {
        if (!this.chartSeries || !this.selectedToken) return;
        const price = parseFloat(this.calculatePrice(this.selectedToken));
        const now = Math.floor(Date.now() / 1000);
        const points = 50;
        let interval = 60;
        if (timeframe === '5m') interval = 300;
        if (timeframe === '15m') interval = 900;
        if (timeframe === '1h') interval = 3600;
        if (timeframe === '4h') interval = 14400;
        if (timeframe === '1d') interval = 86400;
        const data = [];
        for (let i = points; i >= 0; i--) {
            const variance = (Math.random() - 0.5) * price * 0.1;
            data.push({
                time: now - (i * interval),
                value: Math.max(0.00000001, price + variance)
            });
        }
        this.chartSeries.setData(data);
        this.chart.timeScale().fitContent();
    }
});
