Object.assign(Trading, {
    showTerminal() {
        this.currentView = 'terminal';
        const discovery = document.getElementById('discoveryPage');
        const terminal = document.getElementById('tradingTerminal');
        if (discovery) discovery.style.display = 'none';
        if (terminal) terminal.style.display = 'grid';
        document.querySelectorAll('.nox-sidebar-item').forEach(item => {
            item.classList.remove('active');
            if (item.textContent.includes('Terminal')) item.classList.add('active');
        });
        if (terminal && !this.chart) this.initChart();
        if (terminal) this.loadTokens('trending');
    },

    showDiscovery() {
        this.currentView = 'discovery';
        const discovery = document.getElementById('discoveryPage');
        const terminal = document.getElementById('tradingTerminal');
        if (discovery) discovery.style.display = 'flex';
        if (terminal) terminal.style.display = 'none';
        document.querySelectorAll('.nox-sidebar-item').forEach(item => {
            item.classList.remove('active');
            if (item.textContent.includes('Home')) item.classList.add('active');
        });
    }
});
