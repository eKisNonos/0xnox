Object.assign(Trading, {
    bindEvents() {
        const searchInput = document.getElementById('tokenSearch');
        if (searchInput) searchInput.addEventListener('input', (e) => this.filterTokens(e.target.value));
        document.querySelectorAll('.sidebar-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.sidebar-filter').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.loadTokens(e.target.dataset.filter);
            });
        });
        document.querySelectorAll('.trade-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.trade-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.tradeType = e.target.dataset.action;
                this.updateTradeUI();
            });
        });
        const tradeAmount = document.getElementById('tradeAmount');
        if (tradeAmount) tradeAmount.addEventListener('input', () => this.updateEstimate());
        document.querySelectorAll('.chart-tf').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.chart-tf').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.loadChartData(e.target.dataset.tf);
            });
        });
        document.querySelectorAll('.chart-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.chart-type-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.setChartType(e.target.dataset.type);
            });
        });
    },

    async selectTokenByAddress(address) {
        try {
            const res = await fetch(`${CONFIG.API_URL}/tokens/${address}`);
            const token = await res.json();
            if (token && token.address) this.selectToken(token);
        } catch (err) {}
    },

    selectToken(token) {
        this.selectedToken = token;
        this.updateTokenDisplay(token);
        this.updateTradeUI();
        this.initChart();
        this.loadChartData('1h');
        this.loadRecentTrades(token.address);
        this.loadComments();
        this.initCommentInput();
        document.querySelectorAll('.token-list-item').forEach(item => {
            item.classList.toggle('active', item.onclick?.toString().includes(token.address));
        });
    },

    filterTokens(query) {
        const items = document.querySelectorAll('.token-list-item');
        const q = query.toLowerCase();
        items.forEach(item => {
            const name = item.querySelector('.token-list-name')?.textContent.toLowerCase() || '';
            const symbol = item.querySelector('.token-list-symbol')?.textContent.toLowerCase() || '';
            item.style.display = (name.includes(q) || symbol.includes(q)) ? 'flex' : 'none';
        });
    }
});
