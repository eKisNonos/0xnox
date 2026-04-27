Object.assign(CapsuleDev, {
    async handleAssetsUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        try {
            if (file.size > 100 * 1024 * 1024) {
                if (typeof UI !== 'undefined') UI.showError('Assets too large. Max 100MB.');
                return;
            }
            const buffer = await file.arrayBuffer();
            this.assetsData = { name: file.name, size: file.size, data: new Uint8Array(buffer) };
            const ua = document.getElementById('assetsUploadArea');
            const fi = document.getElementById('assetsFileInfo');
            const fn = document.getElementById('assetsFileName');
            const fs = document.getElementById('assetsFileSize');
            if (ua) ua.style.display = 'none';
            if (fi) fi.style.display = 'block';
            if (fn) fn.textContent = file.name;
            if (fs) fs.textContent = this.formatBytes(file.size);
            if (typeof UI !== 'undefined') UI.showSuccess('Assets loaded');
        } catch (e) {
            if (typeof UI !== 'undefined') UI.showError('Failed to load assets');
        }
    },

    clearAssets() {
        this.assetsData = null;
        const ua = document.getElementById('assetsUploadArea');
        const fi = document.getElementById('assetsFileInfo');
        const inp = document.getElementById('assetsFileInput');
        if (ua) ua.style.display = 'block';
        if (fi) fi.style.display = 'none';
        if (inp) inp.value = '';
    },

    updateBuildButton() {
        const btn = document.getElementById('buildNoxcBtn');
        if (!btn) return;
        const nameInput = document.getElementById('manifestName');
        const keySelect = document.getElementById('signingKeySelect');
        const hasName = nameInput?.value.trim();
        const hasElf = this.elfData !== null;
        const hasKey = keySelect?.value !== '';
        btn.disabled = !(hasName && hasElf && hasKey);
    }
});
