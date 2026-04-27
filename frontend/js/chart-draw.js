Object.assign(Chart, {
    draw() {
        if (!this.ctx || !this.data.length) return;
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        const pad = { top: 20, right: 60, bottom: 30, left: 10 };
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, w, h);
        const prices = this.data.map(d => d.price);
        const minP = Math.min(...prices) * 0.95;
        const maxP = Math.max(...prices) * 1.05;
        const minT = this.data[0].time;
        const maxT = this.data[this.data.length - 1].time;
        const scaleX = (t) => pad.left + (t - minT) / (maxT - minT) * (w - pad.left - pad.right);
        const scaleY = (p) => h - pad.bottom - (p - minP) / (maxP - minP) * (h - pad.top - pad.bottom);
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = pad.top + i * (h - pad.top - pad.bottom) / 4;
            ctx.beginPath();
            ctx.moveTo(pad.left, y);
            ctx.lineTo(w - pad.right, y);
            ctx.stroke();
            const price = maxP - i * (maxP - minP) / 4;
            ctx.fillStyle = '#6b7280';
            ctx.font = '10px -apple-system, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(price.toFixed(8), w - pad.right + 5, y + 3);
        }
        ctx.beginPath();
        ctx.moveTo(scaleX(this.data[0].time), h - pad.bottom);
        this.data.forEach((d) => { ctx.lineTo(scaleX(d.time), scaleY(d.price)); });
        ctx.lineTo(scaleX(this.data[this.data.length - 1].time), h - pad.bottom);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, 'rgba(102, 255, 255, 0.3)');
        grad.addColorStop(1, 'rgba(102, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.beginPath();
        ctx.strokeStyle = '#66FFFF';
        ctx.lineWidth = 2;
        this.data.forEach((d, i) => {
            const x = scaleX(d.time);
            const y = scaleY(d.price);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
        const last = this.data[this.data.length - 1];
        const lx = scaleX(last.time);
        const ly = scaleY(last.price);
        ctx.beginPath();
        ctx.arc(lx, ly, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#66FFFF';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(lx, ly, 8, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(102, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#6b7280';
        ctx.font = '10px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        const tRange = maxT - minT;
        for (let i = 0; i <= 4; i++) {
            const time = minT + i * tRange / 4;
            const x = scaleX(time);
            const d = new Date(time);
            ctx.fillText(d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'), x, h - 10);
        }
    }
});
