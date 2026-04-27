Object.assign(App, {
    bindLeaderboardTabs() {
        document.querySelectorAll('.leaderboard-tab').forEach(tab => {
            tab.onclick = (e) => {
                const type = e.target.dataset.type;
                document.querySelectorAll('.leaderboard-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById('volumeLeaderboard').style.display = type === 'volume' ? 'block' : 'none';
                document.getElementById('holdersLeaderboard').style.display = type === 'holders' ? 'block' : 'none';
                document.getElementById('creatorsLeaderboard').style.display = type === 'creators' ? 'block' : 'none';
            };
        });
    },

    async loadLeaderboards() {
        await Promise.all([
            this.loadVolumeLeaderboard(),
            this.loadHoldersLeaderboard(),
            this.loadCreatorsLeaderboard()
        ]);
    }
});
