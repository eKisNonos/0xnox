(function() {
    var routes = {
        "home": "homePage",
        "tokens": "homePage",
        "launch": "launchPage",
        "capsules": "capsulesPage",
        "capsule-dev": "capsule-devPage",
        "dev-portal": "capsule-devPage",
        "portfolio": "portfolioPage",
        "bridge": "bridgePage",
        "docs": "docsPage",
        "tokenomics": "tokenomicsPage",
        "nft": "nft-dashboardPage",
        "nft-dashboard": "nft-dashboardPage"
    };

    var pageToHash = {
        "home": "",
        "launch": "launch",
        "capsules": "capsules",
        "capsule-dev": "dev-portal",
        "portfolio": "portfolio",
        "bridge": "bridge",
        "docs": "docs",
        "tokenomics": "tokenomics",
        "nft-dashboard": "nft"
    };

    function updateURL(page) {
        var hash = pageToHash[page];
        if (hash === undefined) hash = page;
        if (hash) {
            if (location.hash !== "#" + hash) {
                history.pushState(null, "", "#" + hash);
            }
        } else {
            if (location.hash) {
                history.pushState(null, "", location.pathname);
            }
        }
    }

    function handleRoute() {
        var hash = location.hash.replace(/^#\/?/, "");
        if (!hash) return;
        var pageId = routes[hash];
        if (pageId && window.App && App.showPage) {
            var page = pageId.replace("Page", "");
            App.showPage(page);
        }
    }

    var patched = false;
    function patchApp() {
        if (patched || !window.App || !App.showPage) return;
        patched = true;
        var orig = App.showPage;
        App.showPage = function(page) {
            orig.call(App, page);
            updateURL(page);
        };
    }

    function init() {
        patchApp();
        handleRoute();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function() {
            setTimeout(init, 100);
            setTimeout(patchApp, 500);
            setTimeout(patchApp, 1000);
        });
    } else {
        setTimeout(init, 100);
        setTimeout(patchApp, 500);
    }

    window.addEventListener("load", function() {
        patchApp();
        setTimeout(handleRoute, 100);
    });

    window.addEventListener("popstate", handleRoute);
})();
