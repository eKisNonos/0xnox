Object.assign(Bridge, {
    renderTx(tx) {
        const isToCell = tx.direction === 0;
        const statusConfig = {
            0: { name: 'Pending', class: 'pending', icon: '⏳' },
            1: { name: 'Confirming', class: 'confirming', icon: '🔄' },
            2: { name: 'Completed', class: 'completed', icon: '✅' },
            3: { name: 'Failed', class: 'failed', icon: '❌' },
            4: { name: 'Refunded', class: 'refunded', icon: '↩️' }
        };
        const status = statusConfig[tx.status] || statusConfig[0];
        const amount = tx.amount_formatted || this.formatNOX(tx.amount || '0');
        const fee = tx.fee_formatted || this.formatNOX(tx.fee || '0');
        const net = tx.net_formatted || this.formatNOX(tx.net_amount || '0');
        const cfAddr = tx.cf_address || '';
        const cfShort = cfAddr.length > 20 ? cfAddr.slice(0, 16) + '...' + cfAddr.slice(-8) : cfAddr;
        const ethAddr = tx.eth_address || '';
        const ethShort = ethAddr.slice(0, 8) + '...' + ethAddr.slice(-6);
        const time = tx.created_at ? this.formatTime(tx.created_at) : '';
        const confirmText = tx.status === 2 ? 'Confirmed' : `${tx.confirmations || 0}/3`;
        const ethTxHash = tx.eth_tx_hash || tx.tx_id;
        const ethLink = ethTxHash ? `https://etherscan.io/tx/0x${ethTxHash.replace('0x', '')}` : '';
        const cfTxHash = tx.cf_tx_hash;
        return `<div class="bridge-tx-card">
            <div class="tx-header">
                <div class="tx-type ${isToCell ? 'to-cell' : 'to-eth'}"><span class="tx-icon">${isToCell ? '→' : '←'}</span><span>${isToCell ? 'To Cellframe' : 'To Ethereum'}</span></div>
                <div class="tx-status ${status.class}"><span>${status.icon}</span><span>${status.name}</span></div>
            </div>
            <div class="tx-amounts">
                <div class="tx-main-amount"><span class="amount-value">${net}</span><span class="amount-token">NOX</span></div>
                <div class="tx-fee-info">Sent: ${amount} NOX • Fee: ${fee} NOX (0.5%)</div>
            </div>
            <div class="tx-addresses">
                <div class="tx-address-row"><span class="addr-label">From ETH:</span><span class="addr-value" title="${ethAddr}">${ethShort}</span><button class="copy-btn" onclick="Bridge.copyText('${ethAddr}')">📋</button></div>
                <div class="tx-address-row"><span class="addr-label">To CF:</span><span class="addr-value" title="${cfAddr}">${cfShort}</span><button class="copy-btn" onclick="Bridge.copyText('${cfAddr}')">📋</button></div>
            </div>
            <div class="tx-meta"><div class="tx-confirms">${confirmText}</div><div class="tx-time">${time}</div></div>
            <div class="tx-links">${ethLink ? `<a href="${ethLink}" target="_blank" class="tx-link eth-link">View on Etherscan ↗</a>` : ''}${cfTxHash ? `<span class="tx-link cf-link" title="${cfTxHash}">CF: ${cfTxHash.slice(0,16)}...</span>` : ''}</div>
        </div>`;
    }
});
