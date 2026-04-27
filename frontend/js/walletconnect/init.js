(function() {
    "use strict";

    function showMobileModal() {
        closeMobileModal();
        const m = document.createElement("div");
        m.id = "wcMobileModal";
        m.className = "modal-overlay show";
        m.innerHTML = `<div class="modal" style="max-width:400px">
            <div class="modal-header"><h2>Connect Mobile Wallet</h2>
            <button class="modal-close" onclick="closeMobileModal()">&times;</button></div>
            <div class="modal-body" style="text-align:center;padding:1.5rem">
            <div style="margin-bottom:24px">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5">
            <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01" stroke-width="2"/></svg></div>
            <h3 style="margin-bottom:12px;color:var(--text-primary)">Open in Wallet Browser</h3>
            <p style="color:var(--text-secondary);margin-bottom:24px;line-height:1.6">
            Open <strong style="color:var(--accent)">0xnox.com</strong> in your wallet app</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">
            <a href="https://metamask.app.link/dapp/0xnox.com" class="btn btn-primary" style="padding:14px 12px;font-size:0.9rem;display:flex;align-items:center;justify-content:center">
            <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" width="22" height="22" style="margin-right:8px" alt="">MetaMask</a>
            <a href="https://link.trustwallet.com/open_url?url=https://0xnox.com" class="btn btn-primary" style="padding:14px 12px;font-size:0.9rem;display:flex;align-items:center;justify-content:center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="margin-right:8px"><path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z"/></svg>Trust</a></div>
            <div style="border-top:1px solid var(--border);padding-top:16px">
            <p style="font-size:0.85rem;color:var(--text-muted);margin:0 0 12px">Or copy link:</p>
            <button onclick="copyWalletLink()" class="btn btn-outline" style="width:100%;display:flex;align-items:center;justify-content:center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px">
            <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy Link</button></div></div></div>`;
        document.body.appendChild(m);
        m.addEventListener("click", (e) => { if (e.target === m) closeMobileModal(); });
    }

    function closeMobileModal() {
        const m = document.getElementById("wcMobileModal");
        if (m) m.remove();
    }

    function copyWalletLink() {
        const link = "https://0xnox.com";
        if (navigator.clipboard) {
            navigator.clipboard.writeText(link).then(() => {
                if (typeof UI !== "undefined" && UI.showSuccess) UI.showSuccess("Link copied!");
            });
        } else {
            const ta = document.createElement("textarea");
            ta.value = link;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
            if (typeof UI !== "undefined" && UI.showSuccess) UI.showSuccess("Link copied!");
        }
    }

    window.closeMobileModal = closeMobileModal;
    window.showMobileModal = showMobileModal;
    window.copyWalletLink = copyWalletLink;

    // Only set fallback if appKit doesn't exist or doesn't have proper WC setup
    if (!window.appKit || !window.WCSimple) {
        window.appKitFallback = {
            isOpen: false,
            open: function() { showMobileModal(); this.isOpen = true; },
            close: function() { closeMobileModal(); this.isOpen = false; },
            disconnect: function() { this.isOpen = false; },
            getWalletProvider: function() { return null; }
        };
        // Only use fallback if WCSimple doesn't exist
        if (!window.WCSimple) {
            window.appKit = window.appKitFallback;
        }
    }
})();
