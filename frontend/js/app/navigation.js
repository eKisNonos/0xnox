Object.assign(App, {
    showPage(page) {
        this.currentPage = page;
        this.closeMobileMenu();
        const pages = ['homePage', 'launchPage', 'capsulesPage', 'capsule-devPage', 'portfolioPage', 'creatorPage', 'detailPage', 'bridgePage', 'stakingPage', 'docsPage', 'tokenomicsPage'];
        pages.forEach(p => {
            const el = document.getElementById(p);
            if (el) el.style.display = 'none';
        });
        const pageEl = document.getElementById(page + 'Page');
        if (pageEl) pageEl.style.display = 'block';
        document.querySelectorAll('.nav-links a').forEach(a => {
            a.classList.toggle('active', a.dataset.page === page);
        });
        if (page === 'portfolio') this.loadPortfolio();
        if (page === 'creator') this.loadCreatorDashboard();
        if (page === 'capsules') this.loadCapsules();
        if (page === 'capsule-dev') CapsuleDev.init();
        if (page === 'bridge') Bridge.init();
        if (page === 'nft-dashboard') NFTDashboard.init();
    },

    switchDashboardTab(tab) {
        document.querySelectorAll('.dashboard-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
        document.getElementById('holdingsTab').style.display = tab === 'holdings' ? 'block' : 'none';
        document.getElementById('tradesTab').style.display = tab === 'trades' ? 'block' : 'none';
    }
});
