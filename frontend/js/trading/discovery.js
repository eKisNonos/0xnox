Object.assign(Trading, {
    bindDiscoveryEvents() {
        const noxSearch = document.getElementById('noxSearch');
        if (noxSearch) {
            noxSearch.addEventListener('input', (e) => this.searchTokens(e.target.value));
        }
        document.querySelectorAll('.nox-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.nox-filter').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.loadTokenGrid(e.target.dataset.filter);
            });
        });
    },

    async loadDiscoveryPage() {
        await Promise.all([
            this.loadTrendingCarousel(),
            this.loadTokenGrid('trending')
        ]);
    }
});
