Object.assign(Bridge, {
    async getCFBalance(addr) {
        try {
            const res = await fetch(CONFIG.API_URL + "/bridge/wallet/" + encodeURIComponent(addr) + "/balance");
            const data = await res.json();
            return parseFloat(data.balance || "0") / 1e18;
        } catch { return 0; }
    },

    async bridgeToEth(e) {
        if (e) e.preventDefault();
        const cfAddr = document.getElementById("reverseCfWalletSelect")?.value;
        const ethAddr = document.getElementById("reverseEthAddrInput")?.value;
        const amount = parseFloat(document.getElementById("bridgeAmountReverse")?.value);
        if (!cfAddr) { if (typeof UI !== "undefined") UI.showError("Select a Cellframe wallet"); return; }
        if (!ethAddr || !ethAddr.startsWith("0x")) { if (typeof UI !== "undefined") UI.showError("Enter valid Ethereum address"); return; }
        if (!amount || amount < 100) { if (typeof UI !== "undefined") UI.showError("Minimum 100 NOX"); return; }
        const btn = document.querySelector("#bridgeFormReverse .bridge-btn");
        const btnText = btn?.querySelector(".btn-text");
        const btnLoad = btn?.querySelector(".btn-loading");
        if (btnText) btnText.style.display = "none";
        if (btnLoad) btnLoad.style.display = "flex";
        if (btn) btn.disabled = true;
        try {
            const res = await fetch(CONFIG.API_URL + "/bridge/to-eth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cf_address: cfAddr, eth_address: ethAddr, amount: (amount * 1e18).toString() })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Bridge request failed");
            if (typeof UI !== "undefined") UI.showSuccess("Bridge request submitted! TX: " + (data.tx_id || "").slice(0, 12) + "...");
            document.getElementById("bridgeAmountReverse").value = "";
            this.updateEstimateReverse();
            this.loadData();
        } catch (e) {
            if (typeof UI !== "undefined") UI.showError(e.message || "Bridge failed");
        } finally {
            if (btnText) btnText.style.display = "inline";
            if (btnLoad) btnLoad.style.display = "none";
            if (btn) btn.disabled = false;
        }
    }
});
