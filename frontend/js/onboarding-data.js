const Onboarding = {
    SLIDE_DURATION: 3500,
    currentSlide: 0,
    timerInterval: null,

    logo: `<svg class="slide-icon" viewBox="0 0 450 500" fill="currentColor"><path d="M370 0C414.183 0 450 35.8172 450 80V420C450 464.183 414.183 500 370 500H80C35.8172 500 0 464.183 0 420V80C0 35.8173 35.8173 0 80 0H370ZM223.15 147C203.516 147 186.849 151.338 173.15 160.014C159.452 168.689 148.996 180.744 141.781 196.178C134.658 211.611 131.096 229.465 131.096 249.739C131.096 270.013 134.658 287.868 141.781 303.302C143.839 307.704 146.162 311.83 148.747 315.683L130 336.315L147.397 351.932L164.499 333.18C167.223 335.441 170.106 337.538 173.15 339.466C186.849 348.142 203.516 352.479 223.15 352.479C242.876 352.479 259.589 348.142 273.288 339.466C286.986 330.79 297.397 318.735 304.521 303.302C311.644 287.868 315.205 270.013 315.205 249.739C315.205 229.465 311.644 211.611 304.521 196.178C302.836 192.528 300.965 189.068 298.912 185.796L319.041 163.575L301.644 147.959L283.659 167.779C280.441 164.945 276.985 162.355 273.288 160.014C259.589 151.338 242.876 147 223.15 147Z"/></svg>`,

    slides: [
        {
            title: "Welcome to <span>0xNOX</span>",
            desc: "The complete token launchpad and app marketplace for NONOS. Launch tokens, build apps, and trade seamlessly.",
            features: ["Token Launchpad", "Capsule Apps", "Bridge", "Dev Portal"]
        },
        {
            title: "<span>Token</span> Launchpad",
            desc: "Create tokens with automatic bonding curves. Fair launch with no presale. Tokens graduate to Uniswap at $69,420 market cap.",
            features: ["Fair Launch", "Bonding Curve", "Auto Graduation", "Instant Trading"]
        },
        {
            title: "<span>Capsule</span> Marketplace",
            desc: "Browse and install NOXC capsules - sandboxed apps for NONOS. From utilities to games, all cryptographically signed.",
            features: ["Signed Apps", "Sandboxed", "Instant Install", "Token Gated"]
        },
        {
            title: "<span>Developer</span> Portal",
            desc: "Build and publish your own NOXC capsules. Complete toolkit with key management, binary signing, and marketplace integration.",
            features: ["Key Management", "Binary Builder", "IPFS Upload", "Contracts"]
        },
        {
            title: "<span>Cross-Chain</span> Bridge",
            desc: "Bridge your tokens between Ethereum and Cellframe networks. Secure, fast, and low-fee transfers.",
            features: ["ETH to Cellframe", "Secure", "Low Fees", "Fast"]
        },
        {
            title: "Ready to <span>Start</span>?",
            desc: "Connect your wallet to begin. Create tokens, explore capsules, or build your own apps!",
            features: ["Connect Wallet", "Explore", "Build", "Trade"]
        }
    ]
};
