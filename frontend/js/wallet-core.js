const Wallet = {
    provider: null,
    signer: null,
    address: null,
    isGenerated: false,
    ethBalance: '0',
    noxBalance: '0',

    isValidAddress(address) { return address && /^0x[a-fA-F0-9]{40}$/i.test(address); },

    async connect() {
        if (!window.ethereum) throw new Error('No wallet found. Use WalletConnect.');
        try {
            this.provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (!accounts || accounts.length === 0) throw new Error('No accounts returned');

            const account = accounts[0];
            if (!this.isValidAddress(account)) throw new Error('Invalid account address');

            this.address = account;
            this.signer = await this.provider.getSigner();
            this.isGenerated = false;

            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            if (parseInt(chainId, 16) !== CONFIG.CHAIN_ID) await this.switchChain();

            window.ethereum.removeAllListeners('accountsChanged');
            window.ethereum.on('accountsChanged', (accs) => {
                this.address = accs[0] || null;
                if (this.address) {
                    this.provider = new ethers.BrowserProvider(window.ethereum);
                    this.provider.getSigner().then(s => this.signer = s);
                }
                UI.updateWallet();
                window.dispatchEvent(new CustomEvent('wallet-changed', { detail: { address: this.address } }));
            });

            window.ethereum.removeAllListeners('chainChanged');
            window.ethereum.on('chainChanged', () => location.reload());

            return this.address;
        } catch (err) {
            this.provider = null;
            this.signer = null;
            this.address = null;
            throw err;
        }
    },

    async getCurrentAccount() {
        if (!window.ethereum) return null;
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            return accounts[0] || null;
        } catch (e) { return null; }
    },

    async ensureCorrectAccount() {
        const current = await this.getCurrentAccount();
        if (current && current.toLowerCase() !== (this.address || '').toLowerCase()) {
            this.address = current;
            this.provider = new ethers.BrowserProvider(window.ethereum);
            this.signer = await this.provider.getSigner();
            UI.updateWallet();
        }
        return this.address;
    },

    useGenerated(wallet) {
        this.provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
        this.signer = wallet.connect(this.provider);
        this.address = wallet.address;
        this.isGenerated = true;
    },

    async switchChain() {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x' + CONFIG.CHAIN_ID.toString(16) }]
            });
        } catch (e) { throw new Error('Switch to Ethereum mainnet'); }
    },

    disconnect() {
        this.provider = null;
        this.signer = null;
        this.address = null;
        this.isGenerated = false;
    }
};
