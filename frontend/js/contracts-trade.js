Object.assign(Contracts, {
    async buy(tokenAddress, ethAmount, minTokens) {
        if (!Wallet.address) throw new Error('Wallet not connected');

        const iface = new ethers.Interface(ABI.TOKEN);
        const data = iface.encodeFunctionData('buy', [minTokens || 0n]);

        const tx = await Wallet.sendTransaction({
            to: tokenAddress,
            data: data,
            value: '0x' + BigInt(ethAmount).toString(16)
        });

        return tx.wait();
    },

    async sell(tokenAddress, tokenAmount, minEth) {
        if (!Wallet.address) throw new Error('Wallet not connected');

        const amountWei = ethers.parseEther(String(tokenAmount));
        const minEthWei = ethers.parseEther(String(minEth || '0'));

        const iface = new ethers.Interface(ABI.TOKEN);
        const data = iface.encodeFunctionData('sell', [amountWei, minEthWei]);

        const tx = await Wallet.sendTransaction({ to: tokenAddress, data: data });
        return tx.wait();
    },

    async getBuyPrice(tokenAddress, ethAmount) {
        const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
        const token = new ethers.Contract(tokenAddress, ABI.TOKEN, provider);
        try { return (await token.getBuyQuote(ethers.parseEther(String(ethAmount))))[0]; }
        catch { return 0n; }
    },

    async getSellPrice(tokenAddress, tokenAmount) {
        const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
        const token = new ethers.Contract(tokenAddress, ABI.TOKEN, provider);
        try { return (await token.getSellQuote(ethers.parseEther(String(tokenAmount))))[0]; }
        catch { return 0n; }
    }
});
