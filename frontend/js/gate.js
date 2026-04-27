const TokenGate = {
    isUnlocked: true,
    minNOXBalance: 0n,

    async init() {
        // Auto-unlock - no gate required
        this.isUnlocked = true;
        sessionStorage.setItem("0xnox_unlocked", "true");
        this.hideGate();
        if (typeof App !== "undefined") App.init();
    },

    showGate() {
        // Gate disabled - do nothing
    },

    hideGate() {
        const gate = document.getElementById("tokenGate");
        const app = document.getElementById("appContent");
        if (gate) gate.style.display = "none";
        if (app) app.style.display = "block";
        document.body.classList.remove("gated");
    },

    async checkAccess(address) {
        return { hasAccess: true, type: "open" };
    },

    async checkNFT(address, provider) {
        return true;
    },

    async checkNOXBalance(address, provider) {
        return true;
    },

    async connectAndVerify() {
        this.grantAccess("open");
    },

    grantAccess(type) {
        this.isUnlocked = true;
        sessionStorage.setItem("0xnox_unlocked", "true");
        this.hideGate();
        if (typeof App !== "undefined") App.init();
        if (typeof UI !== "undefined" && UI.showSuccess) UI.showSuccess("Welcome to 0xNOX!");
    },

    denyAccess(reason) {
        // Auto-grant anyway
        this.grantAccess("open");
    },

    async onWalletConnected(address) {
        this.grantAccess("open");
    }
};

// Auto-init on load
document.addEventListener("DOMContentLoaded", () => TokenGate.init());
