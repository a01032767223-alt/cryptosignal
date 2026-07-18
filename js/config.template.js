/* ============================================
   CryptoSignal - API Configuration Template
   Rename this file to config.js and add your keys
   ============================================ */

// Copy this file to config.js and fill in your API keys
// DO NOT commit config.js to GitHub (add to .gitignore)

const API_KEYS = {
    // Glassnode: https://glassnode.com (Free tier: 30 calls/day)
    // Provides: NUPL, MVRV, SOPR, Exchange Reserves, Puell Multiple, MPI, SSR
    glassnode: '',

    // CryptoQuant: https://cryptoquant.com (Free tier: limited)
    // Provides: Exchange Flows, Miner Data, Market Data
    cryptoquant: '',

    // Coinglass: https://coinglass.com (Free tier: limited)
    // Provides: Funding Rate, Open Interest, Liquidation Data
    coinglass: '',

    // CoinMarketCap: https://coinmarketcap.com/api (Free tier: 15,000 calls/month)
    // Provides: Fear & Greed Index, Altcoin Season Index (alternative to current sources)
    coinmarketcap: '',

    // Whale Alert: https://whale-alert.io (Free tier: limited)
    // Provides: Large transaction alerts
    whalealert: ''
};

// Feature flags - enable/disable data sources
const FEATURES = {
    useGlassnode: false,      // Set to true when API key added
    useCryptoQuant: false,    // Set to true when API key added
    useCoinglass: false,      // Set to true when API key added
    useCoinMarketCap: false,  // Set to true when API key added
    useWhaleAlert: false      // Set to true when API key added
};
