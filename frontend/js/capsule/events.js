Object.assign(CapsuleDev, {
    setupEventListeners() {
        const elfInput = document.getElementById('elfFileInput');
        if (elfInput) elfInput.addEventListener('change', (e) => this.handleElfUpload(e));
        const assetsInput = document.getElementById('assetsFileInput');
        if (assetsInput) assetsInput.addEventListener('change', (e) => this.handleAssetsUpload(e));
        const elfArea = document.getElementById('elfUploadArea');
        if (elfArea) {
            elfArea.addEventListener('dragover', (e) => { e.preventDefault(); elfArea.classList.add('dragover'); });
            elfArea.addEventListener('dragleave', () => { elfArea.classList.remove('dragover'); });
            elfArea.addEventListener('drop', (e) => {
                e.preventDefault();
                elfArea.classList.remove('dragover');
                if (e.dataTransfer.files.length) this.processElfFile(e.dataTransfer.files[0]);
            });
        }
    },

    async handleElfUpload(e) { const f = e.target.files[0]; if (f) await this.processElfFile(f); },

    async processElfFile(file) {
        try {
            if (file.size > 50 * 1024 * 1024) { if (typeof UI !== 'undefined') UI.showError('File too large. Max 50MB.'); return; }
            const buffer = await file.arrayBuffer();
            const data = new Uint8Array(buffer);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
            this.elfData = { name: file.name, size: file.size, data, sha256: hashHex };
            const ua = document.getElementById('elfUploadArea');
            const fi = document.getElementById('elfFileInfo');
            if (ua) ua.style.display = 'none';
            if (fi) fi.style.display = 'block';
            const fn = document.getElementById('elfFileName');
            const fs = document.getElementById('elfFileSize');
            const fh = document.getElementById('elfFileSha');
            if (fn) fn.textContent = file.name;
            if (fs) fs.textContent = this.formatBytes(file.size);
            if (fh) fh.textContent = hashHex;
            this.updateBuildButton();
            if (typeof UI !== 'undefined') UI.showSuccess('ELF binary loaded');
        } catch (e) { if (typeof UI !== 'undefined') UI.showError('Failed to load ELF'); }
    },

    clearElf() {
        this.elfData = null;
        const ua = document.getElementById('elfUploadArea');
        const fi = document.getElementById('elfFileInfo');
        const inp = document.getElementById('elfFileInput');
        if (ua) ua.style.display = 'block';
        if (fi) fi.style.display = 'none';
        if (inp) inp.value = '';
        this.updateBuildButton();
    }
});
