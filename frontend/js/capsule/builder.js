Object.assign(CapsuleDev, {
    async buildNoxc() {
        try {
            if (!this.elfData) {
                if (typeof UI !== 'undefined') UI.showError('Please upload an ELF binary first');
                return;
            }
            const keyIndex = document.getElementById('signingKeySelect')?.value;
            if (keyIndex === '' || keyIndex === undefined) {
                if (typeof UI !== 'undefined') UI.showError('Please select a signing key');
                return;
            }
            const key = this.keys[parseInt(keyIndex)];
            if (!key) {
                if (typeof UI !== 'undefined') UI.showError('Invalid signing key');
                return;
            }
            if (typeof UI !== 'undefined') UI.showToast('Building capsule...', 'info');
            const manifest = this.buildManifest();
            const manifestJson = JSON.stringify(manifest);
            const manifestBytes = new TextEncoder().encode(manifestJson);
            const manifestOffset = this.HEADER_SIZE;
            const manifestSize = manifestBytes.length;
            const binaryOffset = manifestOffset + manifestSize;
            const binarySize = this.elfData.data.length;
            const assetsOffset = binaryOffset + binarySize;
            const assetsSize = this.assetsData ? this.assetsData.data.length : 0;
            const sigOffset = assetsOffset + assetsSize;
            const totalSize = sigOffset + this.SIGNATURE_SIZE;
            const header = new ArrayBuffer(this.HEADER_SIZE);
            const headerView = new DataView(header);
            headerView.setUint32(0, this.NOXC_MAGIC, true);
            headerView.setUint16(4, this.NOXC_VERSION, true);
            headerView.setUint16(6, 0, true);
            headerView.setUint32(8, manifestOffset, true);
            headerView.setUint32(12, manifestSize, true);
            headerView.setUint32(16, binaryOffset, true);
            headerView.setUint32(20, binarySize, true);
            headerView.setUint32(24, assetsOffset, true);
            headerView.setUint32(28, assetsSize, true);
            headerView.setUint32(32, sigOffset, true);
            const contentSize = sigOffset;
            const content = new Uint8Array(contentSize);
            content.set(new Uint8Array(header), 0);
            content.set(manifestBytes, manifestOffset);
            content.set(this.elfData.data, binaryOffset);
            if (this.assetsData) content.set(this.assetsData.data, assetsOffset);
            const privateKey = this.base64ToBytes(key.privateKey);
            const signature = await this.ed25519Sign(content, privateKey);
            const capsule = new Uint8Array(totalSize);
            capsule.set(content, 0);
            capsule.set(signature, sigOffset);
            const manifestHashBuffer = await crypto.subtle.digest('SHA-256', manifestBytes);
            const manifestHash = Array.from(new Uint8Array(manifestHashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
            this.builtCapsule = {
                data: capsule,
                name: manifest.name.replace(/\./g, '-').replace(/[^a-zA-Z0-9-]/g, '') + '-v' + manifest.version + '.noxc',
                size: totalSize,
                manifestHash: manifestHash,
                signature: this.bytesToHex(signature)
            };
            this.displayBuildOutput();
        } catch (e) {
            if (typeof UI !== 'undefined') UI.showError('Build failed: ' + e.message);
        }
    }
});
