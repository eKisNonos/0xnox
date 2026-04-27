/**
 * Auto-graduation - triggers graduation after buy if ready
 */
(function() {
    // Wait for Contracts to be defined
    const init = () => {
        if (typeof Contracts === 'undefined' || !Contracts.buy) {
            setTimeout(init, 100);
            return;
        }
        
        // Store original buy function
        const originalBuy = Contracts.buy.bind(Contracts);
        
        // Override buy with auto-graduation
        Contracts.buy = async function(tokenAddress, ethAmount, minTokens) {
            // Execute the original buy
            const receipt = await originalBuy(tokenAddress, ethAmount, minTokens);
            
            // Check if ready to graduate after buy
            try {
                const ready = await Contracts.isReadyToGraduate(tokenAddress);
                const graduated = await Contracts.isGraduated(tokenAddress);
                
                if (ready && !graduated) {
                    console.log('[Graduation] Token ready, auto-triggering...');
                    UI.showToast('Market cap reached! Graduating to Uniswap...', 'info');
                    
                    // Auto-graduate
                    const iface = new ethers.Interface(ABI.TOKEN);
                    const data = iface.encodeFunctionData('graduate', []);
                    
                    const tx = await Wallet.sendTransaction({
                        to: tokenAddress,
                        data: data
                    });
                    
                    await tx.wait();
                    UI.showSuccess('🎓 Token graduated to Uniswap!');
                }
            } catch (e) {
                // Graduation might fail if someone else did it, that's ok
                console.log('[Graduation] Auto-graduation:', e.message);
            }
            
            return receipt;
        };
        
        // Add helper functions
        Contracts.isReadyToGraduate = async function(tokenAddress) {
            const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
            const token = new ethers.Contract(tokenAddress, ABI.TOKEN, provider);
            try {
                return await token.isReadyToGraduate();
            } catch {
                return false;
            }
        };
        
        Contracts.graduateToken = async function(tokenAddress) {
            if (!Wallet.address) throw new Error('Wallet not connected');
            
            const ready = await this.isReadyToGraduate(tokenAddress);
            if (!ready) throw new Error('Token not ready to graduate');
            
            const graduated = await this.isGraduated(tokenAddress);
            if (graduated) throw new Error('Token already graduated');
            
            const iface = new ethers.Interface(ABI.TOKEN);
            const data = iface.encodeFunctionData('graduate', []);
            
            const tx = await Wallet.sendTransaction({
                to: tokenAddress,
                data: data
            });
            
            return tx.wait();
        };
        
        console.log('[Graduation] Auto-graduation enabled');
    };
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
