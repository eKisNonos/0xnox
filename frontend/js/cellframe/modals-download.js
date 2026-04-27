Object.assign(CellframeWallet, {
    _pendingWalletFile: null,
    _pendingWalletFilename: null,
    _pendingAddress: null,

    showDownloadModal(result) {
        this._pendingWalletFile = result.walletFile;
        this._pendingWalletFilename = result.walletFilename;
        this._pendingAddress = result.wallet.address;

        const m = document.createElement('div');
        m.className = 'modal-overlay show';
        m.id = 'cfDownloadModal';

        m.innerHTML = '<div class="modal cf-modal">' +
            '<div class="modal-header">' +
                '<h2>Wallet Created - Download Required</h2>' +
                '<button class="modal-close" onclick="CellframeWallet.closeDownloadModal()">&times;</button>' +
            '</div>' +
            '<div class="modal-body">' +
                '<div class="cf-backup-warning" style="background:rgba(239,68,68,0.1);border:1px solid var(--error);border-radius:8px;padding:12px;margin-bottom:16px">' +
                    '<span style="color:var(--error);font-weight:600">This wallet is NOT saved. Download NOW to keep it!</span>' +
                '</div>' +
                '<button class="btn btn-full" onclick="CellframeWallet.downloadWalletFile()" style="margin-bottom:12px;background:var(--accent);color:#000">Download Wallet File (.dwallet)</button>' +
                '<div class="cf-backup-field" style="margin-bottom:12px">' +
                    '<label>ADDRESS</label>' +
                    '<div class="cf-backup-value" style="word-break:break-all;font-size:11px">' + result.wallet.address + '</div>' +
                    '<button class="btn btn-sm btn-outline" onclick="CellframeWallet.copyToClipboard(\'' + result.wallet.address + '\')" style="margin-top:8px">Copy Address</button>' +
                '</div>' +
                '<p style="font-size:12px;color:var(--text-secondary);margin-bottom:12px">After downloading, use "Import Address" to add this wallet for bridging.</p>' +
                '<button class="btn btn-outline btn-full" onclick="CellframeWallet.closeDownloadModal()">Close</button>' +
            '</div>' +
        '</div>';

        document.body.appendChild(m);
    },

    closeDownloadModal() {
        this._pendingWalletFile = null;
        this._pendingWalletFilename = null;
        this._pendingAddress = null;
        this.closeModal('cfDownloadModal');
    },

    downloadWalletFile() {
        if (!this._pendingWalletFile || !this._pendingWalletFilename) {
            UI.showError('Wallet file not available');
            return;
        }

        try {
            const binaryString = atob(this._pendingWalletFile);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const blob = new Blob([bytes], { type: 'application/octet-stream' });

            if (navigator.canShare && navigator.canShare({ files: [new File([blob], this._pendingWalletFilename)] })) {
                const file = new File([blob], this._pendingWalletFilename, { type: 'application/octet-stream' });
                navigator.share({ files: [file], title: 'Cellframe Wallet', text: 'Save your wallet file securely' })
                    .then(() => UI.showSuccess('Wallet file saved!'))
                    .catch(err => { if (err.name !== 'AbortError') this.downloadFallback(blob); });
                return;
            }

            this.downloadFallback(blob);
        } catch (e) {
            UI.showError('Download failed');
        }
    },

    downloadFallback(blob) {
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = this._pendingWalletFilename;
        link.style.display = 'none';
        document.body.appendChild(link);

        setTimeout(() => {
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
        }, 100);

        UI.showSuccess('Downloading wallet file...');
    }
});
