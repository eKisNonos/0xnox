Object.assign(App, {
    bindEvents() {
        document.getElementById('connectBtn').onclick = () => this.handleConnectClick();
        const createForm = document.getElementById('createForm');
        if (createForm) createForm.onsubmit = (e) => this.createToken(e);
        document.getElementById('buyForm').onsubmit = (e) => this.buyTokens(e);
        document.getElementById('sellForm').onsubmit = (e) => this.sellTokens(e);
        document.getElementById('backBtn').onclick = () => this.showPage('home');
        document.getElementById('buyAmount').oninput = (e) => this.estimateBuy(e.target.value);
        document.getElementById('sellAmount').oninput = (e) => this.estimateSell(e.target.value);
        document.querySelectorAll('.tab').forEach(t => t.onclick = (e) => this.setFilter(e.target.dataset.filter));
        document.querySelectorAll('.nav-links a[data-page]').forEach(a => {
            a.onclick = (e) => { e.preventDefault(); this.showPage(a.dataset.page); };
        });
        document.querySelectorAll('.dashboard-tab').forEach(t => {
            t.onclick = (e) => this.switchDashboardTab(e.target.dataset.tab);
        });
        document.getElementById('walletModal').onclick = (e) => {
            if (e.target.id === 'walletModal') this.closeWalletModal();
        };
        document.querySelectorAll('#searchInput').forEach(input => {
            input.oninput = (e) => this.handleSearch(e.target.value);
            input.onblur = () => setTimeout(() => this.hideSearchResults(), 200);
        });
        const quickForm = document.getElementById('quickCreateForm');
        if (quickForm) quickForm.onsubmit = (e) => this.quickCreateToken(e);
        const launchForm = document.getElementById('launchForm');
        if (launchForm) launchForm.onsubmit = (e) => this.launchToken(e);
        this.bindImageUploads();
    },

    handleConnectClick() {
        if (Wallet.address) {
            WalletSidebar.toggle();
        } else {
            this.openWalletModal();
        }
    },

    toggleMobileMenu() {
        const navLinks = document.getElementById('navLinks');
        const navToggle = document.getElementById('navToggle');
        navLinks.classList.toggle('show');
        navToggle.classList.toggle('active');
    },

    closeMobileMenu() {
        const navLinks = document.getElementById('navLinks');
        const navToggle = document.getElementById('navToggle');
        if (navLinks) navLinks.classList.remove('show');
        if (navToggle) navToggle.classList.remove('active');
    }
});
