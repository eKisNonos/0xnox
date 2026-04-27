// Clear WalletConnect garbage first
(function() {
    let cleared = 0;
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.includes('wc') || key.includes('wallet') || key.includes('WC'))) {
            if (!key.includes('0xnox')) {
                localStorage.removeItem(key);
                cleared++;
            }
        }
    }
    if (cleared > 0) console.log('[Debug] Cleared', cleared, 'stale WC items');
})();

console.log('=== 0xNOX Debug ===');
console.log('ethers:', typeof ethers !== 'undefined' ? 'OK' : 'MISSING');
console.log('Wallet:', typeof Wallet !== 'undefined' ? 'OK' : 'MISSING');
console.log('Bridge:', typeof Bridge !== 'undefined' ? 'OK' : 'MISSING');
console.log('CONFIG:', typeof CONFIG !== 'undefined' ? 'OK' : 'MISSING');
if (typeof CONFIG !== 'undefined') {
    console.log('  NOX_TOKEN:', CONFIG.NOX_TOKEN);
    console.log('  RPC_URL:', CONFIG.RPC_URL);
}

window.testConnect = async function() {
    console.log('--- Testing Connection ---');
    console.log('window.ethereum:', !!window.ethereum);
    if (!window.ethereum) {
        console.log('No MetaMask detected. Use WalletConnect or open in wallet browser.');
        return;
    }
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log('Connected account:', accounts[0]);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const nox = new ethers.Contract(CONFIG.NOX_TOKEN, ['function balanceOf(address) view returns (uint256)'], provider);
        const bal = await nox.balanceOf(accounts[0]);
        console.log('NOX Balance:', ethers.formatEther(bal), 'NOX');
    } catch(e) {
        console.error('Test failed:', e.message);
    }
};
console.log('Type testConnect() to test wallet');
