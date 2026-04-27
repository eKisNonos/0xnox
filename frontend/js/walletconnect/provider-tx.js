Object.assign(WCSimple, {
    async sendTransaction(txParams) {
        if (!this.isConnected()) throw new Error('WalletConnect not connected. Please reconnect.');
        try {
            return await this.provider.request({ method: 'eth_sendTransaction', params: [txParams] });
        } catch (error) {
            if (error.code === 4001 || error.message?.includes('rejected')) throw new Error('Transaction rejected by user');
            if (error.message?.includes('session') || error.message?.includes('connect')) {
                this.clearStaleSessions();
                this.provider = null;
                if (typeof Wallet !== 'undefined') { Wallet.address = null; Wallet.signer = null; Wallet.provider = null; }
                if (typeof UI !== 'undefined' && UI.updateWallet) UI.updateWallet();
                throw new Error('Session expired. Please reconnect wallet.');
            }
            throw error;
        }
    }
});
