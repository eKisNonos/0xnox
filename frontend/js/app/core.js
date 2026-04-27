const App = {
    currentToken: null,
    currentFilter: 'trending',
    currentPage: 'home',
    tokens: [],
    generatedWallet: null,
    ws: null,
    wsReconnectTimer: null,
    buySlippage: 1,
    sellSlippage: 1,
    tokenLogo: null,
    tokenBanner: null,
    currentCapsuleFilter: 'all',

    async init() {
        this.fixMobileViewport();
        window.addEventListener('resize', () => this.fixMobileViewport());
        Contracts.init();
        this.bindEvents();
        await this.loadData();
        this.connectWebSocket();
        setInterval(() => {
            if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
                this.loadData();
            }
        }, 30000);
    },

    fixMobileViewport() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    },

    connectWebSocket() {
        const wsUrl = CONFIG.API_URL.replace('http', 'ws') + '/ws';
        try {
            this.ws = new WebSocket(wsUrl);
            this.ws.onopen = () => {};
            this.ws.onmessage = (e) => this.handleWsMessage(JSON.parse(e.data));
            this.ws.onclose = () => {
                clearTimeout(this.wsReconnectTimer);
                this.wsReconnectTimer = setTimeout(() => this.connectWebSocket(), 5000);
            };
            this.ws.onerror = () => this.ws.close();
        } catch (e) {}
    },

    handleWsMessage(msg) {
        if (msg.type === 'stats') UI.renderStats(msg.data);
        if (msg.type === 'king') UI.renderKing(msg.data);
        if (msg.type === 'token' && this.currentToken) {
            if (msg.data.address === this.currentToken) UI.renderTokenPage(msg.data);
        }
        if (msg.type === 'trade' && this.currentPage === 'home') this.loadTokens();
    },

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const diff = Math.floor((Date.now() - date.getTime()) / 1000);
        if (diff < 60) return 'Just now';
        if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
        if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
        return Math.floor(diff / 86400) + 'd ago';
    }
};
