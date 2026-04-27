Object.assign(CapsuleDev, {
    updateManifestId() {
        const nameInput = document.getElementById('manifestName');
        const versionInput = document.getElementById('manifestVersion');
        const idInput = document.getElementById('manifestId');
        const name = nameInput?.value.trim() || '';
        const version = versionInput?.value.trim() || '1.0.0';
        if (name && idInput) {
            const combined = name + ':' + version;
            try {
                const id = ethers.keccak256(ethers.toUtf8Bytes(combined));
                idInput.value = id;
            } catch (e) {
                idInput.value = '0x' + this.simpleHash(combined);
            }
        } else if (idInput) {
            idInput.value = '';
        }
        this.updateBuildButton();
    },

    simpleHash(str) {
        let hash = 0n;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5n) - hash) + BigInt(str.charCodeAt(i));
            hash = hash & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFn;
        }
        return hash.toString(16).padStart(64, '0');
    },

    buildManifest() {
        const keyIndex = document.getElementById('signingKeySelect')?.value;
        const key = keyIndex !== '' ? this.keys[parseInt(keyIndex)] : null;
        const priceInput = document.getElementById('manifestPrice');
        const priceValue = priceInput?.value || '0';
        let priceWei;
        try { priceWei = ethers.parseEther(priceValue).toString(); }
        catch (e) { priceWei = '0'; }
        return {
            id: document.getElementById('manifestId')?.value || '',
            name: document.getElementById('manifestName')?.value.trim() || '',
            version: document.getElementById('manifestVersion')?.value.trim() || '1.0.0',
            description: document.getElementById('manifestDesc')?.value.trim() || '',
            dev_addr: (typeof Wallet !== 'undefined' ? Wallet.address : '') || '',
            dev_pubkey: key ? key.publicKey : '',
            caps: '0x' + this.getCapsBitmap().toString(16).padStart(16, '0'),
            mem_min: parseInt(document.getElementById('manifestMemMin')?.value) || 16,
            mem_max: parseInt(document.getElementById('manifestMemMax')?.value) || 256,
            price: priceWei,
            category: document.getElementById('manifestCategory')?.value || 'utility',
            binary_sha256: this.elfData?.sha256 || '',
            created_at: Date.now()
        };
    }
});
