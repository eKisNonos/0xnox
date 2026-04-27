Object.assign(Bridge, {
    async sendTx(to, data, value = "0x0") {
        const from = Wallet.address;
        if (!from) throw new Error("Wallet not connected");
        const txParams = { from, to, data, value };
        if (typeof WCSimple !== "undefined" && WCSimple.session) {
            try {
                const hash = await WCSimple.sendTransaction(txParams);
                return { hash, wait: () => this.waitForTx(hash) };
            } catch {}
        }
        if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            if (accounts.length) txParams.from = accounts[0];
            const hash = await window.ethereum.request({ method: "eth_sendTransaction", params: [txParams] });
            return { hash, wait: () => this.waitForTx(hash) };
        }
        throw new Error("No wallet");
    },

    async waitForTx(hash) {
        for (let i = 0; i < 120; i++) {
            await new Promise(r => setTimeout(r, 2000));
            const receipt = await this.rpcCall("eth_getTransactionReceipt", [hash]);
            if (receipt && receipt.blockNumber) {
                if (parseInt(receipt.status, 16) === 0) throw new Error("Transaction reverted");
                return receipt;
            }
        }
        throw new Error("Timeout");
    },

    async checkAllowance(owner) {
        const data = "0xdd62ed3e" + owner.slice(2).toLowerCase().padStart(64, "0") + CONFIG.NOX_BRIDGE.slice(2).toLowerCase().padStart(64, "0");
        const result = await this.contractCall(CONFIG.NOX_TOKEN, data);
        return BigInt(result || "0");
    },

    async approve() {
        const data = "0x095ea7b3" + CONFIG.NOX_BRIDGE.slice(2).toLowerCase().padStart(64, "0") + "f".repeat(64);
        return this.sendTx(CONFIG.NOX_TOKEN, "0x" + data.slice(2));
    },

    async registerAddress(eth, cf) {
        try {
            await fetch(CONFIG.API_URL + "/bridge/register-address", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ eth_address: eth.toLowerCase(), cf_address: cf })
            });
        } catch {}
    },

    encodeBridgeCall(amount, cfAddress) {
        const selector = "0x" + ethers.keccak256(ethers.toUtf8Bytes("bridgeToCell(uint256,bytes32)")).slice(2, 10);
        const amountHex = amount.toString(16).padStart(64, "0");
        const cfHash = ethers.keccak256(ethers.toUtf8Bytes(cfAddress)).slice(2);
        return selector + amountHex + cfHash;
    }
});
