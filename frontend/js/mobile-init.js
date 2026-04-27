(function() {
    var doc = document.documentElement;
    var body = document.body;
    
    function setVH() {
        var vh = window.innerHeight * 0.01;
        doc.style.setProperty('--vh', vh + 'px');
    }
    
    function detectBrowser() {
        var ua = navigator.userAgent.toLowerCase();
        if (ua.includes('telegram')) {
            body.classList.add('telegram-webapp');
            if (window.Telegram && window.Telegram.WebApp) {
                window.Telegram.WebApp.ready();
                window.Telegram.WebApp.expand();
            }
        }
        if (ua.includes('metamask')) body.classList.add('metamask-browser');
        if (ua.includes('trust')) body.classList.add('trust-browser');
        if (ua.includes('coinbase')) body.classList.add('coinbase-browser');
        if (/iphone|ipad|ipod/.test(ua)) body.classList.add('ios-device');
        if (/android/.test(ua)) body.classList.add('android-device');
        body.classList.add('no-pull-refresh');
    }
    
    function fixIOSScroll() {
        if (!body.classList.contains('ios-device')) return;
        document.addEventListener('touchmove', function(e) {
            if (e.target.closest('.nox-sidebar, .nox-filters, #trendingCarousel')) {
                return;
            }
        }, { passive: true });
    }
    
    function init() {
        setVH();
        detectBrowser();
        fixIOSScroll();
        window.addEventListener('resize', setVH);
        window.addEventListener('orientationchange', function() {
            setTimeout(setVH, 100);
        });
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
