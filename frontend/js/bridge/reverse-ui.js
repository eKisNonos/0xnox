Object.assign(Bridge, {
    direction: "toCell",

    setDirection(dir) {
        this.direction = dir;
        document.querySelectorAll(".bridge-dir-tab").forEach(t => {
            const isActive = t.dataset.dir === dir;
            t.classList.toggle("btn-outline", !isActive);
            if (isActive) t.classList.remove("btn-outline");
        });
        const formEthToCf = document.getElementById("bridgeForm");
        const formCfToEth = document.getElementById("bridgeFormReverse");
        const connectPrompt = document.getElementById("bridgeConnectPrompt");
        if (dir === "toCell") {
            if (formEthToCf) formEthToCf.style.display = "block";
            if (formCfToEth) formCfToEth.style.display = "none";
            if (connectPrompt) connectPrompt.style.display = Wallet.address ? "none" : "block";
        } else {
            if (formEthToCf) formEthToCf.style.display = "none";
            if (formCfToEth) formCfToEth.style.display = "block";
            if (connectPrompt) connectPrompt.style.display = "none";
            this.loadCFWalletsToSelect();
        }
        const arrow = document.querySelector(".bridge-arrow svg");
        if (arrow) arrow.style.transform = dir === "toEth" ? "rotate(180deg)" : "";
        this.updateChainLabels(dir);
    },

    updateChainLabels(dir) {
        const chainFrom = document.getElementById("chainFrom");
        const chainTo = document.getElementById("chainTo");
        if (!chainFrom || !chainTo) return;
        const cfHtml = '<div class="chain-icon cf"><img src="https://coin-images.coingecko.com/coins/images/14465/small/cellframe-coingecko.png" alt="CF" width="32" height="32"></div><span>Cellframe</span>';
        const ethHtml = '<div class="chain-icon eth"><img src="https://coin-images.coingecko.com/coins/images/279/small/ethereum.png" alt="ETH" width="32" height="32"></div><span>Ethereum</span>';
        chainFrom.innerHTML = dir === "toEth" ? cfHtml : ethHtml;
        chainTo.innerHTML = dir === "toEth" ? ethHtml : cfHtml;
    },

    updateEstimateReverse() {
        const amount = parseFloat(document.getElementById("bridgeAmountReverse")?.value) || 0;
        const fee = amount * 0.005;
        const receive = amount - fee;
        const feeEl = document.getElementById("bridgeFeeReverse");
        const recEl = document.getElementById("bridgeReceiveReverse");
        if (feeEl) feeEl.textContent = fee.toFixed(4) + " NOX";
        if (recEl) recEl.textContent = receive.toFixed(4) + " NOX";
    },

    async loadCFWalletsToSelect() {
        const select = document.getElementById("reverseCfWalletSelect");
        if (!select) return;
        let wallets = [];
        if (typeof CellframeWallet !== "undefined" && CellframeWallet.wallets) wallets = CellframeWallet.wallets;
        select.innerHTML = '<option value="">Select wallet...</option>';
        wallets.forEach(w => {
            const opt = document.createElement("option");
            opt.value = w.address;
            opt.textContent = (w.name || "Wallet") + " - " + w.address.slice(0, 12) + "...";
            select.appendChild(opt);
        });
        if (CellframeWallet?.activeWallet?.address) {
            select.value = CellframeWallet.activeWallet.address;
            this.onCFWalletSelect(CellframeWallet.activeWallet.address);
        }
    },

    async onCFWalletSelect(addr) {
        if (!addr) { document.getElementById("cfNoxBalanceReverse").textContent = "0 NOX"; return; }
        try {
            const balance = await this.getCFBalance(addr);
            document.getElementById("cfNoxBalanceReverse").textContent = balance.toFixed(4) + " NOX";
        } catch { document.getElementById("cfNoxBalanceReverse").textContent = "Error"; }
    },

    async setMaxAmountReverse() {
        const addr = document.getElementById("reverseCfWalletSelect")?.value;
        if (!addr) { if (typeof UI !== "undefined") UI.showError("Select a Cellframe wallet first"); return; }
        try {
            const balance = await this.getCFBalance(addr);
            document.getElementById("bridgeAmountReverse").value = balance;
            this.updateEstimateReverse();
        } catch { if (typeof UI !== "undefined") UI.showError("Failed to get CF balance"); }
    }
});
