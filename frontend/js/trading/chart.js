Object.assign(Trading, {
    initChart() {
        const container = document.getElementById('tradingChart');
        if (!container) return;
        container.innerHTML = '';
        if (typeof LightweightCharts === 'undefined') {
            container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);">Loading chart...</div>';
            return;
        }
        try {
            this.chart = LightweightCharts.createChart(container, {
                width: container.clientWidth,
                height: container.clientHeight || 300,
                layout: { background: { type: 'solid', color: '#000000' }, textColor: '#9ca3af' },
                grid: { vertLines: { color: '#1a1a1a' }, horzLines: { color: '#1a1a1a' } },
                crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
                rightPriceScale: { borderColor: '#1a1a1a' },
                timeScale: { borderColor: '#1a1a1a', timeVisible: true }
            });
            this.chartSeries = this.chart.addAreaSeries({
                topColor: 'rgba(102, 255, 255, 0.4)',
                bottomColor: 'rgba(102, 255, 255, 0.0)',
                lineColor: '#66FFFF',
                lineWidth: 2
            });
            const resizeObserver = new ResizeObserver(entries => {
                if (this.chart && entries[0]) {
                    const { width, height } = entries[0].contentRect;
                    this.chart.applyOptions({ width, height: height || 300 });
                }
            });
            resizeObserver.observe(container);
        } catch (err) {
            container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);">Chart unavailable</div>';
        }
    },

    setChartType(type) {},

    openEtherscan() {
        if (this.selectedToken) {
            window.open(`https://etherscan.io/address/${this.selectedToken.address}`, '_blank');
        }
    },

    shareToken() {
        if (!this.selectedToken) return;
        const url = `${window.location.origin}/#/token/${this.selectedToken.address}`;
        if (navigator.share) {
            navigator.share({ title: `${this.selectedToken.name} (${this.selectedToken.symbol}) on 0xNOX`, url: url });
        } else {
            navigator.clipboard.writeText(url);
            UI.showSuccess('Link copied!');
        }
    }
});
