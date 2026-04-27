Object.assign(Contracts, {
    async createToken(name, symbol, uri) {
        if (!Wallet.address) throw new Error('Wallet not connected');

        const hasNFT = await this.hasNFTPass(Wallet.address);

        if (!hasNFT) {
            const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
            const nox = new ethers.Contract(CONFIG.NOX_TOKEN, ABI.ERC20, provider);
            const allowance = await nox.allowance(Wallet.address, CONFIG.FACTORY_ADDRESS);

            if (allowance < BigInt(CONFIG.CREATION_FEE)) {
                UI.showToast('Approving NOX...', 'info');
                const approveData = new ethers.Interface(ABI.ERC20).encodeFunctionData('approve', [
                    CONFIG.FACTORY_ADDRESS,
                    ethers.MaxUint256
                ]);
                const approveTx = await Wallet.sendTransaction({ to: CONFIG.NOX_TOKEN, data: approveData });
                await approveTx.wait();
            }
        }

        UI.showToast('Creating token...', 'info');
        const iface = new ethers.Interface(ABI.FACTORY);
        const data = iface.encodeFunctionData('createToken', [name, symbol, uri]);

        const tx = await Wallet.sendTransaction({ to: CONFIG.FACTORY_ADDRESS, data: data });
        const receipt = await tx.wait();

        const event = receipt.logs?.find(l => {
            try { return l.topics[0] === ethers.id("TokenCreated(address,address,string,string,uint256)"); }
            catch { return false; }
        });
        if (event) return "0x" + event.topics[1].slice(26);

        for (const log of (receipt.logs || [])) {
            try {
                const p = iface.parseLog(log);
                if (p?.name === 'TokenCreated') return p.args[0];
            } catch {}
        }

        throw new Error('Token created but address not found');
    },

    async getTokenInfo(address) {
        const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
        const token = new ethers.Contract(address, ABI.TOKEN, provider);
        const [name, symbol, supply, reserve, mcap, state] = await Promise.all([
            token.name(), token.symbol(), token.totalSupply(), token.reserve(), token.getMarketCap(), token.state()
        ]);
        return {
            address, name, symbol,
            supply: ethers.formatEther(supply),
            reserve: ethers.formatEther(reserve),
            mcap: ethers.formatEther(mcap),
            state
        };
    }
});
