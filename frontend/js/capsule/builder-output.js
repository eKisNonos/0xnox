Object.assign(CapsuleDev, {
    displayBuildOutput() {
        const buildOutput = document.getElementById('buildOutput');
        const builtFileName = document.getElementById('builtFileName');
        const builtFileSize = document.getElementById('builtFileSize');
        const builtManifestHash = document.getElementById('builtManifestHash');
        const builtSignature = document.getElementById('builtSignature');
        const uploadIpfsBtn = document.getElementById('uploadIpfsBtn');
        if (buildOutput) buildOutput.style.display = 'block';
        if (builtFileName) builtFileName.textContent = this.builtCapsule.name;
        if (builtFileSize) builtFileSize.textContent = this.formatBytes(this.builtCapsule.size);
        if (builtManifestHash) builtManifestHash.textContent = '0x' + this.builtCapsule.manifestHash.substring(0, 16) + '...';
        if (builtSignature) builtSignature.textContent = this.builtCapsule.signature.substring(0, 32) + '...';
        if (uploadIpfsBtn) uploadIpfsBtn.disabled = false;
        if (typeof UI !== 'undefined') UI.showSuccess('Capsule built successfully!');
    },

    downloadNoxc() {
        if (!this.builtCapsule) {
            if (typeof UI !== 'undefined') UI.showError('No capsule built yet');
            return;
        }
        const blob = new Blob([this.builtCapsule.data], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.builtCapsule.name;
        a.click();
        URL.revokeObjectURL(url);
        if (typeof UI !== 'undefined') UI.showSuccess('Download started');
    }
});
