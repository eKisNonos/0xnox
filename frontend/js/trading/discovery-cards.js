Object.assign(Trading, {
    renderTrendingCard(token) {
        const mcap = this.formatMcap(token.market_cap || token.reserve || 0);
        const symbol = (token.symbol || '???').substring(0, 6);
        const initial = symbol.charAt(0).toUpperCase();
        return `
            <div class="trending-card" onclick="Trading.openToken('${token.address}')">
                <div class="trending-card-image">
                    ${token.image ? `<img src="${token.image}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span class="token-initial" style="display:none">${initial}</span>` : `<span class="token-initial">${initial}</span>`}
                    <div class="trending-card-overlay">
                        <div class="trending-card-mcap">${mcap}</div>
                        <div class="trending-card-name">${token.name} <span>${token.symbol}</span></div>
                    </div>
                </div>
                <div class="trending-card-desc">${token.description || 'No description'}</div>
            </div>
        `;
    },

    renderTokenCard(token) {
        const mcap = this.formatMcap(token.market_cap || token.reserve || 0);
        const symbol = (token.symbol || '???').substring(0, 6);
        const initial = symbol.charAt(0).toUpperCase();
        const creator = token.creator ? token.creator.slice(0, 6) + '...' + token.creator.slice(-4) : '???';
        const progress = Math.min(100, (parseFloat(token.reserve || 0) / 1e18 / 2.5) * 100);
        const timeAgo = token.created_at ? this.formatTimeShort(token.created_at) : '';
        return `
            <div class="token-card" onclick="Trading.openToken('${token.address}')">
                <div class="token-card-inner">
                    <div class="token-card-image">
                        ${token.image ? `<img src="${token.image}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span class="token-initial" style="display:none">${initial}</span>` : `<span class="token-initial">${initial}</span>`}
                    </div>
                    <div class="token-card-content">
                        <div class="token-card-header">
                            <div>
                                <div class="token-card-name">${token.name || 'Unknown'}</div>
                                <div class="token-card-symbol">${token.symbol || '???'}</div>
                            </div>
                        </div>
                        <div class="token-card-creator">${creator} ${timeAgo ? '&bull; ' + timeAgo : ''}</div>
                        <div class="token-card-stats">
                            <div class="token-card-stat">
                                <div class="token-card-stat-label">MC</div>
                                <div class="token-card-stat-value">${mcap}</div>
                            </div>
                            <div class="token-card-stat">
                                <div class="token-card-stat-label">Holders</div>
                                <div class="token-card-stat-value">${token.holders || 0}</div>
                            </div>
                        </div>
                        <div class="token-card-progress">
                            <div class="token-card-progress-bar" style="width: ${progress}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
});
