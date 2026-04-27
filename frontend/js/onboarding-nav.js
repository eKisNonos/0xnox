Object.assign(Onboarding, {
    init() {
        if (document.getElementById("onboardingOverlay")) return;
        this.createOverlay();
        setTimeout(() => this.show(), 300);
    },

    complete() { this.hide(); },

    show() {
        const overlay = document.getElementById("onboardingOverlay");
        if (overlay) overlay.classList.add("active");
        this.goToSlide(0);
        this.startTimer();
    },

    hide() {
        this.stopTimer();
        const overlay = document.getElementById("onboardingOverlay");
        if (overlay) {
            overlay.classList.remove("active");
            setTimeout(() => overlay.remove(), 400);
        }
    },

    goToSlide(index) {
        this.currentSlide = index;

        document.querySelectorAll(".onboarding-slide").forEach((el, i) => {
            el.classList.toggle("active", i === index);
        });

        document.querySelectorAll(".progress-dot").forEach((el, i) => {
            el.classList.remove("active", "completed");
            if (i < index) el.classList.add("completed");
            if (i === index) el.classList.add("active");
        });

        const btn = document.getElementById("onboardingNext");
        if (btn) btn.textContent = index === this.slides.length - 1 ? "Get Started" : "Next";

        const timerBar = document.getElementById("timerBar");
        if (timerBar) timerBar.style.width = "0%";
    },

    next() {
        if (this.currentSlide < this.slides.length - 1) {
            this.goToSlide(this.currentSlide + 1);
            this.resetTimer();
        } else {
            this.complete();
        }
    },

    startTimer() {
        let elapsed = 0;
        const step = 50;

        this.timerInterval = setInterval(() => {
            elapsed += step;
            const progress = (elapsed / this.SLIDE_DURATION) * 100;
            const timerBar = document.getElementById("timerBar");
            if (timerBar) timerBar.style.width = progress + "%";

            if (elapsed >= this.SLIDE_DURATION) {
                this.next();
                elapsed = 0;
            }
        }, step);
    },

    resetTimer() { this.stopTimer(); this.startTimer(); },

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
});

window.addEventListener("load", function() { setTimeout(function() { Onboarding.init(); }, 500); });
window.Onboarding = Onboarding;
