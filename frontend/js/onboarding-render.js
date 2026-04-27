Object.assign(Onboarding, {
    createOverlay() {
        const overlay = document.createElement("div");
        overlay.className = "onboarding-overlay";
        overlay.id = "onboardingOverlay";

        overlay.innerHTML = `
            <div class="onboarding-container">
                <div class="onboarding-timer"><div class="timer-bar" id="timerBar"></div></div>
                <div class="onboarding-progress" id="onboardingProgress"></div>
                <div id="onboardingSlides"></div>
                <div class="onboarding-actions">
                    <button class="btn btn-skip" onclick="Onboarding.complete()">Skip Tour</button>
                    <button class="btn" id="onboardingNext" onclick="Onboarding.next()">Next</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        this.renderProgress();
        this.renderSlides();
    },

    renderProgress() {
        const container = document.getElementById("onboardingProgress");
        if (!container) return;
        container.innerHTML = this.slides.map((_, i) =>
            `<div class="progress-dot" data-slide="${i}"></div>`
        ).join("");
    },

    renderSlides() {
        const container = document.getElementById("onboardingSlides");
        if (!container) return;
        container.innerHTML = this.slides.map((slide, i) => `
            <div class="onboarding-slide" data-slide="${i}">
                <div class="onboarding-icon">${this.logo}</div>
                <h2 class="onboarding-title">${slide.title}</h2>
                <p class="onboarding-desc">${slide.desc}</p>
                <div class="onboarding-visual">
                    <div class="onboarding-features">
                        ${slide.features.map(f => `<div class="feature-tag">${f}</div>`).join("")}
                    </div>
                </div>
            </div>
        `).join("");
    }
});
