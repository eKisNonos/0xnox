Object.assign(App, {
    bindImageUploads() {
        const logoUpload = document.getElementById('logoUpload');
        const bannerUpload = document.getElementById('bannerUpload');
        const logoInput = document.getElementById('logoInput');
        const bannerInput = document.getElementById('bannerInput');
        if (logoUpload && logoInput) {
            logoUpload.onclick = () => logoInput.click();
            logoInput.onchange = (e) => this.handleImageUpload(e, 'logo');
        }
        if (bannerUpload && bannerInput) {
            bannerUpload.onclick = () => bannerInput.click();
            bannerInput.onchange = (e) => this.handleImageUpload(e, 'banner');
        }
    },

    handleImageUpload(e, type) {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            UI.showError('Please select an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            UI.showError('Image must be less than 5MB');
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            if (type === 'logo') {
                this.tokenLogo = ev.target.result;
                const preview = document.getElementById('logoPreview');
                preview.innerHTML = `<img src="${ev.target.result}" alt="Logo">`;
                document.getElementById('logoUpload').classList.add('has-image');
            } else {
                this.tokenBanner = ev.target.result;
                const preview = document.getElementById('bannerPreview');
                preview.innerHTML = `<img src="${ev.target.result}" alt="Banner">`;
                document.getElementById('bannerUpload').classList.add('has-image');
            }
        };
        reader.readAsDataURL(file);
    }
});
