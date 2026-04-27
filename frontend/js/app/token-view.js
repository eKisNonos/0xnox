Object.assign(App, {
    async viewToken(address) {
        this.currentToken = address;
        this.showPage('detail');
        try {
            const res = await fetch(CONFIG.API_URL + '/tokens/' + address);
            const token = await res.json();
            UI.renderTokenPage(token);
            this.loadTokenExtras(address, token);
        } catch (e) { UI.showError('Failed to load token'); }
        if (Wallet.address) {
            try {
                const bal = await Contracts.getBalance(address, Wallet.address);
                document.getElementById('userBalance').textContent = UI.formatNumber(UI.weiToEth(bal));
            } catch (e) { document.getElementById('userBalance').textContent = '0'; }
        }
    },

    async loadTokenExtras(address, token) {
        Chart.init('priceChart');
        const currentPrice = token.supply > 0 ? UI.weiToEth(token.reserve) / UI.weiToEth(token.supply) : 0;
        Chart.generateMockData(currentPrice || 0.00000001);
        this.loadTradeHistory(address);
        this.loadHolders(address);
        const descSection = document.getElementById('tokenDescription');
        const descText = document.getElementById('tokenDescText');
        if (token.metadata?.description) {
            descText.textContent = token.metadata.description;
            descSection.style.display = 'block';
        } else { descSection.style.display = 'none'; }
        this.renderSocialLinks(token);
        this.bindChartTimeframes(currentPrice);
    },

    renderSocialLinks(token) {
        const s = document.getElementById('tokenSocial');
        if (!token.metadata?.social) { s.innerHTML = ''; return; }
        const links = [];
        if (token.metadata.social.twitter) links.push(`<a href="${token.metadata.social.twitter}" target="_blank" title="Twitter"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>`);
        if (token.metadata.social.telegram) links.push(`<a href="${token.metadata.social.telegram}" target="_blank" title="Telegram"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg></a>`);
        if (token.metadata.social.website) links.push(`<a href="${token.metadata.social.website}" target="_blank" title="Website"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></a>`);
        s.innerHTML = links.join('');
    },

    bindChartTimeframes(currentPrice) {
        document.querySelectorAll('.chart-timeframe').forEach(btn => {
            btn.onclick = (e) => {
                document.querySelectorAll('.chart-timeframe').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                Chart.generateMockData(currentPrice || 0.00000001);
            };
        });
    }
});

// Graduation handling
Object.assign(App, {
    async checkGraduation(tokenAddress) {
        try {
            const graduated = await Contracts.isGraduated(tokenAddress);
            const progress = await Contracts.getGraduationProgress(tokenAddress);
            const ready = await Contracts.isReadyToGraduate(tokenAddress);
            
            const container = document.getElementById('graduationStatus');
            if (!container) return;
            
            if (graduated) {
                container.innerHTML = '<div class="graduation-badge graduated"><span>🎓</span> Graduated to Uniswap</div>';
            } else if (ready) {
                container.innerHTML = '<div class="graduation-ready"><div class="progress-text">Ready to Graduate!</div><button class="btn-graduate" onclick="App.graduateToken()">🚀 Graduate to Uniswap</button></div>';
            } else {
                const pct = Number(progress) / 100;
                container.innerHTML = '<div class="graduation-progress"><div class="progress-label">Graduation Progress</div><div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%"></div></div><div class="progress-text">' + pct.toFixed(1) + '% to Uniswap</div></div>';
            }
        } catch (e) {
            console.log('[App] Graduation check error:', e);
        }
    },

    async graduateToken() {
        if (!Wallet.address) {
            UI.showError('Connect wallet first');
            return;
        }
        
        const btn = document.querySelector('.btn-graduate');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner"></span> Graduating...';
        }
        
        try {
            const result = await Contracts.graduateToken(this.currentToken);
            UI.showSuccess('Token graduated to Uniswap! 🎉');
            
            // Refresh page
            setTimeout(() => this.viewToken(this.currentToken), 3000);
        } catch (e) {
            UI.showError(e.message || 'Graduation failed');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '🚀 Graduate to Uniswap';
            }
        }
    }
});

console.log('[App] Graduation UI loaded');
