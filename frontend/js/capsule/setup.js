Object.assign(CapsuleDev, {
    setupCapabilityListeners() {
        document.querySelectorAll('input[name="cap"]').forEach(cb => {
            cb.addEventListener('change', () => this.updateCapsBitmap());
        });
    },

    setupIpfsGatewayListener() {
        const s = document.getElementById('ipfsGateway');
        if (s) {
            s.addEventListener('change', () => {
                const v = s.value;
                const pa = document.getElementById('pinataApiGroup');
                const ps = document.getElementById('pinataSecretGroup');
                const mc = document.getElementById('manualCidGroup');
                if (pa) pa.style.display = v === 'pinata' ? 'block' : 'none';
                if (ps) ps.style.display = v === 'pinata' ? 'block' : 'none';
                if (mc) mc.style.display = v === 'manual' ? 'block' : 'none';
            });
        }
    },

    updateCapsBitmap() {
        const cbs = document.querySelectorAll('input[name="cap"]:checked');
        let bm = BigInt(0);
        cbs.forEach(cb => { bm |= BigInt(1) << BigInt(parseInt(cb.value)); });
        const d = document.getElementById('capsBitmap');
        if (d) d.textContent = '0x' + bm.toString(16).padStart(16, '0').toUpperCase();
        this.updateBuildButton();
    },

    getCapsBitmap() {
        const cbs = document.querySelectorAll('input[name="cap"]:checked');
        let bm = BigInt(0);
        cbs.forEach(cb => { bm |= BigInt(1) << BigInt(parseInt(cb.value)); });
        return bm;
    }
});
