Object.assign(App, {
    async handleSearch(query) {
        const results = document.getElementById('searchResults');
        if (!results) return;
        if (!query || query.length < 2) {
            results.style.display = 'none';
            return;
        }
        try {
            const res = await fetch(CONFIG.API_URL + '/search?q=' + encodeURIComponent(query));
            const data = await res.json();
            if (data.tokens && data.tokens.length > 0) {
                results.innerHTML = data.tokens.map(t => {
                    const name = UI.escapeHtml(t.name || 'Unknown');
                    const symbol = UI.escapeHtml(t.symbol || '???');
                    return '<div class="search-result-item" onclick="App.viewToken(\'' + t.address + '\')">' +
                        '<div class="token-icon">' + symbol.charAt(0) + '</div>' +
                        '<div><strong>' + name + '</strong> <span style="color:var(--accent)">$' + symbol + '</span></div>' +
                        '</div>';
                }).join('');
                results.style.display = 'block';
            } else {
                results.innerHTML = '<div class="search-result-item">No tokens found</div>';
                results.style.display = 'block';
            }
        } catch (e) {
            results.style.display = 'none';
        }
    },

    hideSearchResults() {
        const results = document.getElementById('searchResults');
        if (results) results.style.display = 'none';
    }
});
