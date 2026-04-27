Object.assign(CellframeWallet, {
    // Generate wallet - returns file but does NOT store it
    async generateWallet(name = null) {
        try {
            const body = {};
            if (typeof Wallet !== 'undefined' && Wallet.address) body.eth_address = Wallet.address;
            const response = await fetch(CONFIG.API_URL + '/bridge/wallet/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!response.ok) throw new Error((await response.json()).detail || 'Wallet creation failed');
            const data = await response.json();
            if (!data.address || data.address.length < 90) throw new Error('Invalid wallet address');

            // Return wallet data for download - DO NOT STORE
            return { 
                wallet: {
                    name: name || data.wallet_name || 'Cellframe Wallet',
                    address: data.address,
                    network: data.network || 'Backbone',
                    walletName: data.wallet_name
                },
                walletFile: data.wallet_file, 
                walletFilename: data.wallet_filename 
            };
        } catch (e) {
            throw e;
        }
    },

    // Register address with backend for bridge tracking
    async registerWithBackend(cfAddress) {
        if (!Wallet.address) return;
        try {
            const hash = ethers.keccak256(new TextEncoder().encode(cfAddress));
            await fetch(CONFIG.API_URL + '/bridge/register-address', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eth_address: Wallet.address.toLowerCase(), cf_address: cfAddress, address_hash: hash })
            });
        } catch (e) {}
    },

    // Import existing address - this DOES store locally for convenience
    async importWallet(cfAddress, name = null) {
        if (!cfAddress || cfAddress.length < 90 || cfAddress.length > 120) throw new Error('Invalid address');
        if (!/^[A-Za-z][A-Za-z0-9]{89,119}$/.test(cfAddress)) throw new Error('Invalid format');
        const existing = this.wallets.find(w => w.address === cfAddress);
        if (existing) {
            this.activeWallet = existing;
            this.saveWallets();
            this.updateUI();
            return existing;
        }
        const wallet = {
            name: name || 'Imported Wallet ' + (this.wallets.length + 1),
            address: cfAddress,
            network: 'Backbone',
            createdAt: Date.now(),
            balance: '0',
            imported: true
        };
        this.wallets.push(wallet);
        this.activeWallet = wallet;
        this.saveWallets();
        this.updateUI();
        await this.registerWithBackend(cfAddress);
        return wallet;
    },

    isValidAddress(address) {
        if (!address || typeof address !== 'string') return false;
        address = address.trim();
        return address.length >= 90 && address.length <= 120 && /^[A-Za-z][A-Za-z0-9]{89,119}$/.test(address);
    }
});
