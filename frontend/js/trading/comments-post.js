Object.assign(Trading, {
    async postComment() {
        if (!this.selectedToken || !Wallet.address) {
            UI.showError('Connect wallet to comment');
            return;
        }
        const input = document.getElementById('commentInput');
        const content = input?.value.trim();
        if (!content) {
            UI.showError('Please enter a comment');
            return;
        }
        const btn = document.getElementById('postCommentBtn');
        if (btn) btn.disabled = true;
        try {
            const res = await fetch(`${CONFIG.API_URL}/tokens/${this.selectedToken.address}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ author: Wallet.address, content: content })
            });
            if (!res.ok) throw new Error('Failed to post comment');
            input.value = '';
            document.getElementById('commentCharCount').textContent = '0';
            UI.showSuccess('Comment posted!');
            this.loadComments();
        } catch (err) {
            UI.showError('Failed to post comment');
        } finally {
            if (btn) btn.disabled = !Wallet.address;
        }
    },

    async likeComment(commentId) {
        if (!Wallet.address) {
            UI.showError('Connect wallet to like');
            return;
        }
        try {
            await fetch(`${CONFIG.API_URL}/comments/${commentId}/like?user_address=${Wallet.address}`, { method: 'POST' });
            this.loadComments();
        } catch (err) {}
    },

    toggleReplyForm(commentId) {
        UI.showInfo('Reply feature coming soon!');
    },

    initCommentInput() {
        const input = document.getElementById('commentInput');
        const charCount = document.getElementById('commentCharCount');
        const postBtn = document.getElementById('postCommentBtn');
        if (input && charCount) {
            input.addEventListener('input', () => {
                charCount.textContent = input.value.length;
                if (postBtn) {
                    postBtn.disabled = !Wallet.address || input.value.trim().length === 0;
                }
            });
        }
        if (postBtn) {
            postBtn.disabled = !Wallet.address;
        }
    }
});
