Object.assign(CapsuleDev, {
    exportKey(i) {
        const k = this.keys[i];
        if (!k) return;
        const data = { name: k.name, publicKey: k.publicKey, privateKey: k.privateKey, createdAt: k.createdAt, format: 'nonos-ed25519-v1' };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${k.name}.json`;
        a.click();
        URL.revokeObjectURL(url);
        if (typeof UI !== 'undefined') UI.showSuccess('Key exported');
    },

    renameKey(i) {
        const k = this.keys[i];
        if (!k) return;
        const name = prompt('Enter new key name:', k.name);
        if (name && name.trim()) {
            this.keys[i].name = name.trim();
            this.saveKeys();
            this.renderKeysList();
        }
    },

    deleteKey(i) {
        if (!confirm('Delete this key? This cannot be undone.')) return;
        this.keys.splice(i, 1);
        this.saveKeys();
        this.renderKeysList();
        if (typeof UI !== 'undefined') UI.showSuccess('Key deleted');
    },

    async importKey() {
        const keyInput = document.getElementById('importKeyInput');
        const nameInput = document.getElementById('importKeyName');
        if (!keyInput) return;
        const val = keyInput.value.trim();
        const name = nameInput?.value.trim() || 'imported-' + Date.now().toString(36);
        if (!val) { if (typeof UI !== 'undefined') UI.showError('Enter a private key'); return; }
        try {
            let pk;
            if (val.startsWith('{')) {
                pk = this.base64ToBytes(JSON.parse(val).privateKey);
            } else if (val.length === 64 && /^[0-9a-fA-F]+$/.test(val)) {
                pk = this.hexToBytes(val);
            } else {
                pk = this.base64ToBytes(val);
            }
            const pub = await this.ed25519GetPublic(pk);
            this.keys.push({ name, publicKey: this.bytesToBase64(pub), privateKey: this.bytesToBase64(pk), createdAt: Date.now() });
            this.saveKeys();
            this.renderKeysList();
            keyInput.value = '';
            if (nameInput) nameInput.value = '';
            if (typeof UI !== 'undefined') UI.showSuccess('Key imported');
        } catch (e) { if (typeof UI !== 'undefined') UI.showError('Invalid key format'); }
    }
});
