const CapsuleDev = {
    capsules: [],
    keys: [],
    elfData: null,
    assetsData: null,
    builtCapsule: null,
    ipfsCid: null,
    NOXC_MAGIC: 0x43584F4E,
    NOXC_VERSION: 0x0001,
    HEADER_SIZE: 64,
    SIGNATURE_SIZE: 64,

    async init() {
        this.loadKeys();
        this.setupEventListeners();
        this.updateKeySelect();
        await this.loadData();
        this.updateDevAddress();
        this.setupCapabilityListeners();
        this.setupIpfsGatewayListener();
        this.setupTabListeners();
        this.setupManifestInputListeners();
    },

    setupTabListeners() {
        document.querySelectorAll('.dev-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
    },

    switchTab(tabId) {
        document.querySelectorAll('.dev-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`.dev-tab[data-tab="${tabId}"]`)?.classList.add('active');
        document.querySelectorAll('.dev-tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(tabId + 'Tab')?.classList.add('active');
    },

    updateDevAddress() {
        const addr = document.getElementById('manifestDevAddr');
        if (addr && typeof Wallet !== 'undefined' && Wallet.address) addr.value = Wallet.address;
    },

    async loadData() { await Promise.all([this.loadStats(), this.loadCapsules()]); },

    setupManifestInputListeners() {
        const n = document.getElementById('manifestName');
        const v = document.getElementById('manifestVersion');
        if (n) n.addEventListener('input', () => this.updateManifestId());
        if (v) v.addEventListener('input', () => this.updateManifestId());
    }
};
