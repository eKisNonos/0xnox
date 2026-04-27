Object.assign(CapsuleDev, {
    loadKeys() {
        try { this.keys = JSON.parse(localStorage.getItem('nonos_dev_keys')) || []; }
        catch (e) { this.keys = []; }
        this.renderKeysList();
    },

    saveKeys() {
        try { localStorage.setItem('nonos_dev_keys', JSON.stringify(this.keys)); } catch (e) {}
        this.updateKeySelect();
    },

    async generateKeyPair() {
        try {
            const seed = crypto.getRandomValues(new Uint8Array(32));
            const publicKey = await this.ed25519GetPublic(seed);
            this.keys.push({
                name: 'key-' + Date.now().toString(36),
                publicKey: this.bytesToBase64(publicKey),
                privateKey: this.bytesToBase64(seed),
                createdAt: Date.now()
            });
            this.saveKeys();
            this.renderKeysList();
            if (typeof UI !== 'undefined') UI.showSuccess('Ed25519 keypair generated');
        } catch (e) {
            if (typeof UI !== 'undefined') UI.showError('Failed to generate keypair: ' + e.message);
        }
    },

    async ed25519GetPublic(seed) {
        if (typeof nacl === 'undefined') throw new Error('TweetNaCl not loaded');
        return nacl.sign.keyPair.fromSeed(seed).publicKey;
    },

    async ed25519Sign(message, seed) {
        if (typeof nacl === 'undefined') throw new Error('TweetNaCl not loaded');
        const kp = nacl.sign.keyPair.fromSeed(seed);
        return nacl.sign.detached(new Uint8Array(message), kp.secretKey);
    },

    renderKeysList() {
        const list = document.getElementById('keysList');
        if (!list) return;
        if (this.keys.length === 0) {
            list.innerHTML = '<div class="empty-state">No keys generated yet.</div>';
            return;
        }
        list.innerHTML = this.keys.map((k, i) => `<div class="key-card">
            <div class="key-header"><span class="key-name">${this.escapeHtml(k.name)}</span>
            <span class="key-date">${new Date(k.createdAt).toLocaleDateString()}</span></div>
            <div class="key-details"><div class="key-row"><span>Public Key:</span>
            <code class="key-value">${k.publicKey.substring(0,20)}...${k.publicKey.slice(-8)}</code>
            <button class="btn btn-outline btn-xs" onclick="CapsuleDev.copyToClipboard('${k.publicKey}')">Copy</button></div></div>
            <div class="key-actions">
            <button class="btn btn-outline btn-sm" onclick="CapsuleDev.exportKey(${i})">Export</button>
            <button class="btn btn-outline btn-sm" onclick="CapsuleDev.renameKey(${i})">Rename</button>
            <button class="btn btn-outline btn-sm danger" onclick="CapsuleDev.deleteKey(${i})">Delete</button>
            </div></div>`).join('');
    },

    updateKeySelect() {
        const s = document.getElementById('signingKeySelect');
        if (!s) return;
        s.innerHTML = '<option value="">Select Ed25519 key...</option>' +
            this.keys.map((k, i) => `<option value="${i}">${this.escapeHtml(k.name)}</option>`).join('');
        this.updateBuildButton();
    }
});
