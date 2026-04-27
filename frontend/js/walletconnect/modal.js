const WCModal = {
    PROJECT_ID: 'f6660eeed931e1739a01b78e47a5dacd',

    create() {
        const e = document.getElementById('wcQRModal');
        if (e) e.remove();
        const m = document.createElement('div');
        m.id = 'wcQRModal';
        m.className = 'modal-overlay';
        m.innerHTML = `<div class="modal" style="max-width:400px">
            <div class="modal-header"><h2>WalletConnect</h2>
            <button class="modal-close" id="wcCloseBtn">&times;</button></div>
            <div class="modal-body" style="text-align:center">
            <div id="wcQRContainer" style="display:flex;justify-content:center;align-items:center;min-height:280px;background:#fff;border-radius:12px;margin-bottom:16px">
            <div id="wcQRLoading" style="color:#666">Initializing...</div>
            <img id="wcQRImage" style="display:none;max-width:256px;border-radius:8px" alt="QR"></div>
            <p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:16px">Scan with mobile wallet</p>
            <div id="wcCopyUri" style="display:none;margin-bottom:16px">
            <button class="btn btn-outline btn-full" id="wcCopyBtn">Copy Link</button></div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">
            <a href="https://metamask.io/download/" target="_blank" class="btn btn-outline" style="font-size:0.75rem">MetaMask</a>
            <a href="https://trustwallet.com/download" target="_blank" class="btn btn-outline" style="font-size:0.75rem">Trust</a>
            </div></div></div>`;
        document.body.appendChild(m);
        document.getElementById('wcCloseBtn').onclick = () => this.close();
        m.onclick = (e) => { if (e.target === m) this.close(); };
        return m;
    },

    close() {
        const m = document.getElementById('wcQRModal');
        if (m) { m.classList.remove('show'); setTimeout(() => m.remove(), 300); }
        if (window.WCSimple && window.WCSimple.provider) {
            try { window.WCSimple.provider.disconnect(); } catch (e) {}
        }
    },

    showQR(uri) {
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(uri)}&bgcolor=ffffff&color=000000&margin=10`;
        const img = document.getElementById('wcQRImage');
        const loading = document.getElementById('wcQRLoading');
        img.onload = () => { img.style.display = 'block'; loading.style.display = 'none'; };
        img.onerror = () => { loading.innerHTML = 'QR unavailable. Use copy button.'; };
        img.src = url;
        const copyC = document.getElementById('wcCopyUri');
        const copyB = document.getElementById('wcCopyBtn');
        if (copyC && copyB) {
            copyC.style.display = 'block';
            copyB.onclick = () => {
                navigator.clipboard.writeText(uri).then(() => {
                    copyB.textContent = 'Copied!';
                    setTimeout(() => copyB.textContent = 'Copy Link', 2000);
                });
            };
        }
    }
};
