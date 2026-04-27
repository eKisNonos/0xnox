Object.assign(Bridge, {
    async bridgeToCell(e) {
        e && e.preventDefault();
        const amountInput = document.getElementById("bridgeAmount");
        const cfInput = document.getElementById("cfAddress");
        const btn = document.querySelector(".bridge-btn");
        if (!Wallet.address) { UI.showError("Connect wallet"); return; }
        const amount = parseFloat(amountInput?.value || 0);
        const cfAddress = cfInput?.value?.trim() || "";
        if (amount < 100) { UI.showError("Min 100 NOX"); return; }
        if (cfAddress.length < 50) { UI.showError("Invalid CF address"); return; }
        const originalText = btn?.textContent;
        try {
            if (btn) { btn.disabled = true; btn.textContent = "Processing..."; }
            const amountWei = ethers.parseUnits(amount.toString(), 18);
            const allowance = await this.checkAllowance(Wallet.address);
            if (allowance < amountWei) {
                if (btn) btn.textContent = "Approving...";
                UI.showInfo("Approve NOX in wallet");
                const approveTx = await this.approve();
                await approveTx.wait();
                UI.showSuccess("Approved!");
                await new Promise(r => setTimeout(r, 2000));
            }
            await this.registerAddress(Wallet.address, cfAddress);
            if (btn) btn.textContent = "Bridging...";
            UI.showInfo("Confirm bridge in wallet");
            const bridgeData = this.encodeBridgeCall(amountWei, cfAddress);
            const tx = await this.sendTx(CONFIG.NOX_BRIDGE, bridgeData);
            if (btn) btn.textContent = "Confirming...";
            await tx.wait();
            UI.showSuccess("Bridge successful! " + tx.hash.slice(0, 16) + "...");
            setTimeout(() => this.loadData(), 3000);
        } catch (err) {
            UI.showError(err.message || "Failed");
        } finally {
            if (btn) { btn.disabled = false; btn.textContent = originalText; }
        }
    }
});
