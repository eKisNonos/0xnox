Object.assign(CapsuleDev, {
    async uploadToIpfs() {
        const gateway = document.getElementById('ipfsGateway')?.value;
        if (gateway === 'manual') {
            const cid = document.getElementById('manualCid')?.value.trim();
            if (!cid || (!cid.startsWith('Qm') && !cid.startsWith('bafy'))) {
                if (typeof UI !== 'undefined') UI.showError('Please enter a valid IPFS CID');
                return;
            }
            this.ipfsCid = cid;
            this.showIpfsResult(cid);
            return;
        }
        if (!this.builtCapsule) {
            if (typeof UI !== 'undefined') UI.showError('Please build a capsule first');
            return;
        }
        if (gateway === 'pinata') {
            await this.uploadToPinata();
        } else {
            if (typeof UI !== 'undefined') UI.showError('Gateway not yet supported. Use Pinata or enter CID manually.');
        }
    },

    async uploadToPinata() {
        const apiKey = document.getElementById('pinataApiKey')?.value.trim();
        const secretKey = document.getElementById('pinataSecret')?.value.trim();
        if (!apiKey || !secretKey) {
            if (typeof UI !== 'undefined') UI.showError('Please enter Pinata API credentials');
            return;
        }
        try {
            if (typeof UI !== 'undefined') UI.showToast('Uploading to Pinata...', 'info');
            const formData = new FormData();
            const blob = new Blob([this.builtCapsule.data], { type: 'application/octet-stream' });
            formData.append('file', blob, this.builtCapsule.name);
            const metadata = JSON.stringify({
                name: this.builtCapsule.name,
                keyvalues: { type: 'nonos-capsule', version: '1' }
            });
            formData.append('pinataMetadata', metadata);
            const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
                method: 'POST',
                headers: {
                    'pinata_api_key': apiKey,
                    'pinata_secret_api_key': secretKey
                },
                body: formData
            });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error('Pinata upload failed: ' + (errText || res.statusText));
            }
            const data = await res.json();
            this.ipfsCid = data.IpfsHash;
            this.showIpfsResult(data.IpfsHash);
            if (typeof UI !== 'undefined') UI.showSuccess('Uploaded to IPFS!');
        } catch (e) {
            if (typeof UI !== 'undefined') UI.showError('Upload failed: ' + e.message);
        }
    },

    showIpfsResult(cid) {
        this.ipfsCid = cid;
        const ipfsResult = document.getElementById('ipfsResult');
        const ipfsCidEl = document.getElementById('ipfsCid');
        const ipfsUrl = document.getElementById('ipfsUrl');
        const publishBtn = document.getElementById('publishRegistryBtn');
        if (ipfsResult) ipfsResult.style.display = 'block';
        if (ipfsCidEl) ipfsCidEl.textContent = cid;
        if (ipfsUrl) {
            ipfsUrl.href = 'https://gateway.pinata.cloud/ipfs/' + cid;
            ipfsUrl.textContent = 'https://gateway.pinata.cloud/ipfs/' + cid.substring(0, 12) + '...';
        }
        if (publishBtn) publishBtn.disabled = false;
    }
});
