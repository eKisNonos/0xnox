Object.assign(App, {
    renderLeaderboardItem(token, index, type) {
        const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
        const symbol = (token.symbol || '?').charAt(0);
        const name = token.name || 'Unknown';
        const symText = token.symbol || '???';
        let valueHtml = '';
        if (type === 'volume') {
            const volume = token.volume_24h ? UI.formatNumber(token.volume_24h) : '0';
            valueHtml = `<div class="leaderboard-amount">${volume} ETH</div><div class="leaderboard-subvalue">24h Volume</div>`;
        } else if (type === 'holders') {
            valueHtml = `<div class="leaderboard-amount">${token.holders || 0}</div><div class="leaderboard-subvalue">Holders</div>`;
        }
        return `<div class="leaderboard-item" onclick="App.viewToken('${token.address}')">
            <div class="leaderboard-rank ${rankClass}">${index + 1}</div>
            <div class="leaderboard-token">
                <div class="leaderboard-icon">${symbol}</div>
                <div class="leaderboard-info">
                    <div class="leaderboard-name">${name}</div>
                    <div class="leaderboard-symbol">$${symText}</div>
                </div>
            </div>
            <div class="leaderboard-value">${valueHtml}</div>
        </div>`;
    },

    renderCreatorItem(creator, index) {
        const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
        const addr = UI.truncateAddress(creator.address);
        const tokensCreated = creator.tokens_created || 0;
        const totalVolume = UI.formatNumber(UI.weiToEth(creator.total_volume || 0));
        return `<div class="creator-item">
            <div class="leaderboard-rank ${rankClass}">${index + 1}</div>
            <div class="creator-avatar">C</div>
            <div class="creator-info">
                <div class="creator-address">${addr}</div>
                <div class="creator-stats">${tokensCreated} tokens created</div>
            </div>
            <div class="creator-value">
                <div class="leaderboard-amount">${totalVolume} ETH</div>
                <div class="leaderboard-subvalue">Total Volume</div>
            </div>
        </div>`;
    }
});
