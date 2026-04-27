Object.assign(Bridge, {
    RPC_ENDPOINTS: ["https://ethereum-rpc.publicnode.com", "https://eth.llamarpc.com", "https://1rpc.io/eth"],

    async rpcCall(method, params = []) {
        for (const rpc of this.RPC_ENDPOINTS) {
            try {
                const res = await fetch(rpc, { method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ jsonrpc: "2.0", method, params, id: 1 }) });
                const data = await res.json();
                if (!data.error) return data.result;
            } catch { continue; }
        }
        throw new Error("RPC failed");
    },

    async contractCall(to, data) {
        return this.rpcCall("eth_call", [{ to, data }, "latest"]);
    },

    async loadStats() {
        try {
            const res = await fetch(CONFIG.API_URL + "/bridge/stats");
            const apiStats = await res.json();
            const contractData = await this.contractCall(CONFIG.NOX_BRIDGE, "0xc59d4847");
            const decoded = ethers.AbiCoder.defaultAbiCoder().decode(["uint256", "uint256", "uint256", "uint256", "uint256"], contractData);
            const el1 = document.getElementById("bridgedToCell");
            const el2 = document.getElementById("bridgedToEth");
            const el3 = document.getElementById("bridgeLiquidity");
            const el4 = document.getElementById("bridgePending");
            if (el1) el1.textContent = apiStats.bridged_to_cell_formatted || this.formatNOX(decoded[0]);
            if (el2) el2.textContent = apiStats.bridged_to_eth_formatted || this.formatNOX(decoded[1]);
            if (el3) el3.textContent = this.formatNOX(decoded[4]);
            if (el4) el4.textContent = apiStats.pending_count || 0;
        } catch {}
    },

    async loadNOXBalance() {
        const el = document.getElementById("noxBalance");
        if (!el) return;
        if (!Wallet.address) { el.textContent = "0 NOX"; return; }
        try {
            const data = "0x70a08231" + Wallet.address.slice(2).toLowerCase().padStart(64, "0");
            const result = await this.contractCall(CONFIG.NOX_TOKEN, data);
            el.textContent = this.formatNOX(BigInt(result)) + " NOX";
        } catch { el.textContent = "0 NOX"; }
    },

    async loadHistory() {
        const el = document.getElementById("bridgeHistory");
        if (!el) return;
        if (!Wallet.address) { el.innerHTML = '<div class="empty-state">Connect wallet to see history</div>'; return; }
        try {
            const res = await fetch(CONFIG.API_URL + "/bridge/user/" + Wallet.address.toLowerCase());
            const data = await res.json();
            this.transactions = data.transactions || [];
            if (this.transactions.length === 0) { el.innerHTML = '<div class="empty-state">No bridge transactions</div>'; return; }
            this.renderHistory();
        } catch { el.innerHTML = '<div class="empty-state">Error loading history</div>'; }
    },

    formatNOX(wei) {
        try {
            const val = typeof wei === "bigint" ? wei : BigInt(wei || 0);
            const num = Number(val) / 1e18;
            if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
            if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
            return num.toFixed(2);
        } catch { return "0"; }
    }
});
