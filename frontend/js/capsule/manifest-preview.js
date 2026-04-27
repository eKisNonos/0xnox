Object.assign(CapsuleDev, {
    previewManifest() {
        const manifest = this.buildManifest();
        const json = JSON.stringify(manifest, null, 2);
        const modal = document.createElement('div');
        modal.className = 'modal-overlay show';
        modal.innerHTML = `
            <div class="modal" style="max-width: 600px">
                <div class="modal-header">
                    <h2>Manifest JSON Preview</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <pre style="background: var(--bg-tertiary); padding: 16px; overflow: auto; max-height: 400px; font-size: 0.8rem;">${this.escapeHtml(json)}</pre>
                    <button class="btn btn-full" onclick="navigator.clipboard.writeText(JSON.stringify(${this.escapeHtml(json)}, null, 2)); this.textContent = 'Copied!'">Copy to Clipboard</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
});
