Object.assign(Wallet, {
    async sendTransaction(params) {
        if (!this.address) throw new Error('Wallet not connected');
        await this.ensureCorrectAccount();

        const txParams = {
            from: this.address,
            to: params.to,
            data: params.data || '0x',
            value: params.value || '0x0'
        };

        if (typeof WCSimple !== 'undefined' && WCSimple.session && WCSimple.address === this.address) {
            try {
                const hash = await WCSimple.sendTransaction(txParams);
                return { hash, wait: () => this.waitForTx(hash) };
            } catch (e) {}
        }

        if (window.ethereum) {
            try {
                const hash = await window.ethereum.request({ method: 'eth_sendTransaction', params: [txParams] });
                return { hash, wait: () => this.waitForTx(hash) };
            } catch (e) {
                if (e.code === 4001) throw new Error('Transaction rejected');
                throw e;
            }
        }

        if (this.signer) {
            const tx = await this.signer.sendTransaction({
                to: params.to,
                data: params.data,
                value: params.value ? BigInt(params.value) : 0n
            });
            return tx;
        }

        throw new Error('No wallet available');
    },

    async waitForTx(hash) {
        const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
        for (let i = 0; i < 120; i++) {
            await new Promise(r => setTimeout(r, 2000));
            try {
                const receipt = await provider.getTransactionReceipt(hash);
                if (receipt) {
                    if (receipt.status === 0) throw new Error('Transaction reverted');
                    return receipt;
                }
            } catch (e) {
                if (e.message.includes('reverted')) throw e;
            }
        }
        throw new Error('Transaction timeout');
    },

    async getTokenBalance(tokenAddress) {
        try {
            const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
            const token = new ethers.Contract(tokenAddress, ABI.ERC20, provider);
            const bal = await token.balanceOf(this.address);
            return ethers.formatEther(bal);
        } catch (e) { return '0'; }
    }
});
