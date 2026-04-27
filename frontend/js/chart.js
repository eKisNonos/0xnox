const Chart = {
    canvas: null,
    ctx: null,
    data: [],
    width: 0,
    height: 0,

    init(containerId) {
        const c = document.getElementById(containerId);
        if (!c) return;
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'price-chart-canvas';
        c.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    },

    resize() {
        if (!this.canvas) return;
        const r = this.canvas.parentElement.getBoundingClientRect();
        this.width = r.width;
        this.height = 200;
        this.canvas.width = this.width * 2;
        this.canvas.height = this.height * 2;
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
        this.ctx.scale(2, 2);
        this.draw();
    },

    setData(trades) {
        this.data = trades.map(t => ({
            time: new Date(t.timestamp || t.created_at).getTime(),
            price: parseFloat(t.price) || 0,
            volume: parseFloat(t.eth_amount || t.volume) || 0,
            isBuy: t.is_buy || t.type === 'buy'
        })).sort((a, b) => a.time - b.time);
        this.draw();
    },

    generateMockData(currentPrice) {
        const now = Date.now();
        const pts = 50;
        this.data = [];
        let price = currentPrice * 0.5;
        for (let i = 0; i < pts; i++) {
            const time = now - (pts - i) * 300000;
            price = price * (1 + (Math.random() - 0.45) * 0.1);
            price = Math.max(price, currentPrice * 0.1);
            price = Math.min(price, currentPrice * 1.5);
            this.data.push({ time, price, volume: Math.random() * 0.5, isBuy: Math.random() > 0.5 });
        }
        this.data.push({ time: now, price: currentPrice, volume: 0.1, isBuy: true });
        this.draw();
    }
};
