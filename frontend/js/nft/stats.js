Object.assign(NFTDashboard, {
    async loadNFTStats() {
        try {
            const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
            const nftContract = new ethers.Contract(CONFIG.NFT_PASS, ABI.ERC721, provider);

            try {
                const totalSupply = await nftContract.totalSupply();
                document.getElementById('nftTotalSupply').textContent = this.formatNumber(Number(totalSupply));
            } catch (e) {
                document.getElementById('nftTotalSupply').textContent = '1,000';
            }

            await this.loadOpenSeaData();

            if (CONFIG.REVENUE_SPLITTER) {
                try {
                    const splitter = new ethers.Contract(CONFIG.REVENUE_SPLITTER, ABI.REVENUE_SPLITTER, provider);
                    const totalDistributed = await splitter.totalDistributed();
                    document.getElementById('nftTotalRevenue').textContent = this.formatNOX(totalDistributed) + ' NOX';
                } catch (e) {
                    try {
                        const res = await fetch(CONFIG.API_URL + '/api/v1/nft/stats');
                        const data = await res.json();
                        document.getElementById('nftTotalRevenue').textContent = this.formatNOX(ethers.parseEther(String(data.total_distributed || 0))) + ' NOX';
                    } catch {
                        document.getElementById('nftTotalRevenue').textContent = '--';
                    }
                }
            }
        } catch (e) {}
    },

    async loadOpenSeaData() {
        try {
            const res = await fetch('https://api.opensea.io/api/v2/collections/zerostate-pass/stats', {
                headers: { 'Accept': 'application/json' }
            });

            if (res.ok) {
                const data = await res.json();

                if (data.total && data.total.floor_price) {
                    document.getElementById('nftFloorPrice').textContent = data.total.floor_price.toFixed(3) + ' ETH';
                } else if (data.floor_price) {
                    document.getElementById('nftFloorPrice').textContent = data.floor_price.toFixed(3) + ' ETH';
                }

                if (data.total && data.total.num_owners) {
                    document.getElementById('nftHolders').textContent = this.formatNumber(data.total.num_owners);
                } else if (data.num_owners) {
                    document.getElementById('nftHolders').textContent = this.formatNumber(data.num_owners);
                }
            }
        } catch (e) {
            try {
                const res = await fetch(CONFIG.API_URL + '/api/v1/nft/stats');
                const data = await res.json();
                if (data.floor_price) {
                    document.getElementById('nftFloorPrice').textContent = data.floor_price + ' ETH';
                }
                if (data.holders) {
                    document.getElementById('nftHolders').textContent = this.formatNumber(data.holders);
                }
            } catch {}
        }
    }
});
