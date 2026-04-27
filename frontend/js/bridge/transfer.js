Object.assign(Bridge, {
    updateEstimate() {
        const amount = parseFloat(document.getElementById('bridgeAmount').value) || 0;
        const fee = amount * 0.005;
        const receive = amount - fee;
        document.getElementById('bridgeFee').textContent = fee.toFixed(4) + ' NOX';
        document.getElementById('bridgeReceive').textContent = receive.toFixed(4) + ' NOX';
    },

    async setMaxAmount() {
        if (!Wallet.address) { UI.showError('Connect wallet first'); return; }
        try {
            // Use direct RPC call for balance
            const addrPadded = Wallet.address.toLowerCase().replace('0x', '').padStart(64, '0');
            const callData = '0x70a08231' + addrPadded;
            const result = await this.contractCall(CONFIG.NOX_TOKEN, callData);
            const balance = BigInt(result);
            document.getElementById('bridgeAmount').value = ethers.formatEther(balance);
            this.updateEstimate();
        } catch (e) { console.error('[Bridge] Max amount error:', e); UI.showError('Failed to get balance'); }
    },

    isValidCellframeAddress(address) {
        if (!address || typeof address !== 'string') return false;
        address = address.trim();
        return address.length >= 90 && address.length <= 120 && /^[A-Za-z][A-Za-z0-9]{89,119}$/.test(address);
    },

    hashCellframeAddress(cfAddress) {
        return ethers.keccak256(new TextEncoder().encode(cfAddress));
    },

    useActiveWallet() {
        if (!CellframeWallet.activeWallet) {
            CellframeWallet.showCreateModal();
            return;
        }
        document.getElementById('cfAddress').value = CellframeWallet.activeWallet.address;
        UI.showSuccess('Wallet address set');
    },

    syncFromCellframeWallet() {
        if (CellframeWallet.activeWallet && this.isValidCellframeAddress(CellframeWallet.activeWallet.address)) {
            const input = document.getElementById('cfAddress');
            if (input && !input.value) input.value = CellframeWallet.activeWallet.address;
        }
    },

    async registerAddressWithBackend(ethAddress, cfAddress, addressHash) {
        const response = await fetch(CONFIG.API_URL + '/bridge/register-address', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eth_address: ethAddress.toLowerCase(), cf_address: cfAddress, address_hash: addressHash })
        });
        if (!response.ok) throw new Error((await response.json()).detail || 'Registration failed');
        return response.json();
    }
});
