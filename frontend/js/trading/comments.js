Object.assign(Trading, {
    async loadComments() {
        if (!this.selectedToken) return;
        const container = document.getElementById('commentsList');
        const countEl = document.getElementById('commentsCount');
        if (!container) return;
        try {
            const res = await fetch(`${CONFIG.API_URL}/tokens/${this.selectedToken.address}/comments`);
            if (!res.ok) throw new Error('Failed to load comments');
            const data = await res.json();
            const comments = data.comments || [];
            if (countEl) countEl.textContent = comments.length;
            if (comments.length === 0) {
                container.innerHTML = '<div class="empty-state">No comments yet. Be the first!</div>';
                return;
            }
            container.innerHTML = comments.map(c => this.renderComment(c)).join('');
        } catch (err) {
            container.innerHTML = '<div class="empty-state">Failed to load comments</div>';
        }
    },

    renderComment(comment) {
        const addr = comment.author || '0x0000...0000';
        const shortAddr = addr.slice(0, 6) + '...' + addr.slice(-4);
        const time = comment.created_at ? this.formatTime(comment.created_at) : '';
        return `
            <div class="comment-item" data-id="${comment.id}">
                <div class="comment-header">
                    <span class="comment-author">${shortAddr}</span>
                    <span class="comment-time">${time}</span>
                </div>
                <div class="comment-content">${this.escapeHtml(comment.content)}</div>
                <div class="comment-actions">
                    <button class="comment-action" onclick="Trading.likeComment(${comment.id})">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        ${comment.likes || 0}
                    </button>
                    <button class="comment-action" onclick="Trading.toggleReplyForm(${comment.id})">Reply</button>
                </div>
                ${comment.reply_count > 0 ? `<div class="comment-replies" id="replies-${comment.id}"></div>` : ''}
            </div>
        `;
    }
});
