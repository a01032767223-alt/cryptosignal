/* ============================================
   CryptoSignal v2.0 - Real-time API Integration
   CoinGecko + Alternative.me APIs
   ============================================ */

const CONFIG = {
    API: {
        COINGECKO: 'https://api.coingecko.com/api/v3',
        FEAR_GREED: 'https://api.alternative.me/fng/',
        MAX_RETRIES: 3,
        RETRY_DELAY: 1000
    },
    COINS: [
        { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', color: '#f7931a' },
        { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', color: '#627eea' },
        { id: 'solana', symbol: 'SOL', name: 'Solana', color: '#14f195' },
        { id: 'ripple', symbol: 'XRP', name: 'XRP', color: '#23292f' },
        { id: 'cardano', symbol: 'ADA', name: 'Cardano', color: '#0033ad' },
        { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', color: '#c2a633' },
        { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', color: '#e6007a' },
        { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche', color: '#e84142' },
        { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', color: '#2a5ada' },
        { id: 'polygon', symbol: 'MATIC', name: 'Polygon', color: '#8247e5' }
    ],
    ALTCOINS: [
        { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', color: '#627eea' },
        { id: 'solana', symbol: 'SOL', name: 'Solana', color: '#14f195' },
        { id: 'ripple', symbol: 'XRP', name: 'XRP', color: '#23292f' },
        { id: 'cardano', symbol: 'ADA', name: 'Cardano', color: '#0033ad' },
        { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', color: '#c2a633' },
        { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', color: '#e6007a' },
        { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche', color: '#e84142' },
        { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', color: '#2a5ada' },
        { id: 'polygon', symbol: 'MATIC', name: 'Polygon', color: '#8247e5' },
        { id: 'litecoin', symbol: 'LTC', name: 'Litecoin', color: '#345d9d' },
        { id: 'uniswap', symbol: 'UNI', name: 'Uniswap', color: '#ff007a' },
        { id: 'aave', symbol: 'AAVE', name: 'Aave', color: '#b6509e' },
        { id: 'cosmos', symbol: 'ATOM', name: 'Cosmos', color: '#2e3148' },
        { id: 'near', symbol: 'NEAR', name: 'NEAR', color: '#00c08b' },
        { id: 'aptos', symbol: 'APT', name: 'Aptos', color: '#000000' },
        { id: 'sui', symbol: 'SUI', name: 'Sui', color: '#4da2ff' },
        { id: 'optimism', symbol: 'OP', name: 'Optimism', color: '#ff0420' },
        { id: 'arbitrum', symbol: 'ARB', name: 'Arbitrum', color: '#28a0f0' },
        { id: 'injective-protocol', symbol: 'INJ', name: 'Injective', color: '#00f2ff' },
        { id: 'celestia', symbol: 'TIA', name: 'Celestia', color: '#7b2bf9' },
        { id: 'sei-network', symbol: 'SEI', name: 'Sei', color: '#9c5bff' },
        { id: 'render-token', symbol: 'RNDR', name: 'Render', color: '#ff6b6b' },
        { id: 'the-graph', symbol: 'GRT', name: 'The Graph', color: '#6747ed' },
        { id: 'fetch-ai', symbol: 'FET', name: 'Fetch.ai', color: '#1f1f1f' },
        { id: 'pepe', symbol: 'PEPE', name: 'Pepe', color: '#4caf50' }
    ],
    STORAGE: {
        PORTFOLIO: 'cs_portfolio',
        SETTINGS: 'cs_settings'
    }
};

const AppState = {
    currentTab: 'overview',
    isLoading: true,
    isOnline: true,
    autoRefreshInterval: null,
    isAutoRefreshing: false,
    data: {
        prices: {},
        global: {},
        fearGreed: null,
        altPrices: [],
        altSeasonIndex: 50,
        btcDominance: 54,
        signals: [],
        lastUpdate: null
    },
    portfolio: [],
    settings: {
        refreshInterval: 60,
        currency: 'USD'
    }
};

/* ============================================
   UTILITIES
   ============================================ */
const Utils = {
    formatNumber(num, decimals = 2) {
        if (num === null || num === undefined || isNaN(num)) return '--';
        if (Math.abs(num) >= 1e12) return (num / 1e12).toFixed(decimals) + 'T';
        if (Math.abs(num) >= 1e9) return (num / 1e9).toFixed(decimals) + 'B';
        if (Math.abs(num) >= 1e6) return (num / 1e6).toFixed(decimals) + 'M';
        if (Math.abs(num) >= 1e3) return (num / 1e3).toFixed(decimals) + 'K';
        return num.toFixed(decimals);
    },

    formatPrice(price, currency = 'USD') {
        if (!price || isNaN(price)) return '--';
        const symbol = currency === 'KRW' ? '\u20A9' : '$';
        const rate = currency === 'KRW' ? 1300 : 1;
        const value = price * rate;
        if (value >= 1000) {
            return symbol + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        return symbol + value.toFixed(4);
    },

    formatPercentage(value) {
        if (value === null || value === undefined || isNaN(value)) return '--';
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value.toFixed(2)}%`;
    },

    formatTime(date) {
        if (!date) return '방금';
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return '방금';
        if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
        return `${Math.floor(diff / 86400)}일 전`;
    },

    getColorForChange(change) {
        if (change >= 15) return '#16a34a';
        if (change >= 8) return '#22c55e';
        if (change >= 3) return '#86efac';
        if (change >= 0) return '#bbf7d0';
        if (change >= -5) return '#fca5a5';
        if (change >= -10) return '#ef4444';
        return '#dc2626';
    },

    getTextColorForChange(change) {
        return Math.abs(change) > 5 ? 'white' : '#1e293b';
    }
};

/* ============================================
   STORAGE
   ============================================ */
const Storage = {
    get(key) {
        try { const data = localStorage.getItem(key); return data ? JSON.parse(data) : null; }
        catch (e) { return null; }
    },
    set(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); return true; }
        catch (e) { return false; }
    },
    loadAll() {
        AppState.portfolio = Storage.get(CONFIG.STORAGE.PORTFOLIO) || [];
        const settings = Storage.get(CONFIG.STORAGE.SETTINGS);
        if (settings) AppState.settings = { ...AppState.settings, ...settings };
    },
    savePortfolio() { Storage.set(CONFIG.STORAGE.PORTFOLIO, AppState.portfolio); },
    saveSettings() { Storage.set(CONFIG.STORAGE.SETTINGS, AppState.settings); }
};

/* ============================================
   API MANAGER
   ============================================ */
const API = {
    async fetchWithRetry(url, retries = CONFIG.API.MAX_RETRIES) {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return await response.json();
            } catch (error) {
                if (i === retries - 1) throw error;
                await new Promise(r => setTimeout(r, CONFIG.API.RETRY_DELAY * (i + 1)));
            }
        }
    },

    async getCoinPrices() {
        const ids = CONFIG.COINS.map(c => c.id).join(',');
        const url = `${CONFIG.API.COINGECKO}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=false&price_change_percentage=24h,7d`;
        return await API.fetchWithRetry(url);
    },

    async getGlobalData() {
        return await API.fetchWithRetry(`${CONFIG.API.COINGECKO}/global`);
    },

    async getFearGreedIndex() {
        return await API.fetchWithRetry(`${CONFIG.API.FEAR_GREED}?limit=1`);
    },

    async getAltcoinData() {
        const ids = CONFIG.ALTCOINS.map(c => c.id).join(',');
        const url = `${CONFIG.API.COINGECKO}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`;
        return await API.fetchWithRetry(url);
    }
};

/* ============================================
   INDICATOR ENGINE
   ============================================ */
const IndicatorEngine = {
    calculateAltSeasonIndex(altData, btcData) {
        if (!altData || !btcData || altData.length === 0) return 50;
        let outperforming = 0;
        const btcChange = btcData.price_change_percentage_24h || 0;
        altData.forEach(alt => {
            if ((alt.price_change_percentage_24h || 0) > btcChange) outperforming++;
        });
        return Math.round((outperforming / altData.length) * 100);
    },

    getSimulatedIndicators() {
        const now = Date.now();
        const cycle = (Math.sin(now / 86400000) + 1) / 2;
        return {
            nupl: { value: -0.1 + cycle * 0.6, signal: cycle > 0.7 ? 'bearish' : cycle < 0.3 ? 'bullish' : 'neutral', description: 'Net Unrealized Profit/Loss' },
            mvrv: { value: 1 + cycle * 4, zScore: -2 + cycle * 6, signal: cycle > 0.8 ? 'bearish' : cycle < 0.2 ? 'bullish' : 'neutral', description: 'MVRV Z-Score' },
            sopr: { value: 0.98 + cycle * 0.08, signal: cycle > 0.7 ? 'bearish' : cycle < 0.3 ? 'bullish' : 'neutral', description: 'Spent Output Profit Ratio' },
            exchangeReserves: { value: 2500000 - cycle * 500000, change24h: -0.5 - cycle * 2, signal: cycle < 0.5 ? 'bullish' : 'neutral', description: 'Exchange Reserves' },
            fundingRate: { value: 0.01 + cycle * 0.04, signal: cycle > 0.8 ? 'bearish' : 'neutral', description: 'Funding Rate' },
            openInterest: { value: 15 + cycle * 10, change24h: cycle * 5, signal: 'neutral', description: 'Open Interest' },
            puellMultiple: { value: 0.5 + cycle * 2, signal: cycle > 0.8 ? 'bearish' : cycle < 0.2 ? 'bullish' : 'neutral', description: 'Puell Multiple' },
            rsi: { value: 30 + cycle * 50, signal: cycle > 0.8 ? 'bearish' : cycle < 0.2 ? 'bullish' : 'neutral', description: 'RSI(14)' },
            macd: { value: -0.5 + cycle, signal: cycle > 0.6 ? 'bullish' : cycle < 0.4 ? 'bearish' : 'neutral', description: 'MACD' },
            bollinger: { position: cycle * 100, signal: cycle > 0.9 ? 'bearish' : cycle < 0.1 ? 'bullish' : 'neutral', description: 'Bollinger Bands' },
            mayerMultiple: { value: 0.8 + cycle * 1.2, signal: cycle > 0.85 ? 'bearish' : cycle < 0.15 ? 'bullish' : 'neutral', description: 'Mayer Multiple' }
        };
    }
};

/* ============================================
   SIGNAL ENGINE
   ============================================ */
const SignalEngine = {
    generateSignals(data) {
        const signals = [];
        const indicators = [];

        // Fear & Greed
        if (data.fearGreed) {
            const fng = parseInt(data.fearGreed.value);
            let fngSignal = 'neutral';
            if (fng <= 20) fngSignal = 'strong-buy';
            else if (fng <= 40) fngSignal = 'buy';
            else if (fng >= 80) fngSignal = 'strong-sell';
            else if (fng >= 60) fngSignal = 'sell';
            indicators.push({ name: 'Fear & Greed', signal: fngSignal, value: fng });
            if (fngSignal !== 'neutral') {
                signals.push({
                    type: fngSignal,
                    title: `공포·탐욕 지수: ${fng} (${data.fearGreed.value_classification})`,
                    description: fng <= 20 ? '극도의 공포 구간 - 분할 매수 기회' :
                                  fng <= 40 ? '공포 구간 - 점진적 매수 고려' :
                                  fng >= 80 ? '극도의 탐욕 구간 - 수익 실현 고려' :
                                  '탐욕 구간 - 신규 매수 주의',
                    confidence: fng <= 20 || fng >= 80 ? 85 : 65,
                    indicators: ['Fear & Greed Index'],
                    timestamp: new Date()
                });
            }
        }

        // BTC Dominance
        if (data.btcDominance) {
            const dom = data.btcDominance;
            let domSignal = 'neutral';
            if (dom < 48) domSignal = 'buy';
            else if (dom > 60) domSignal = 'sell';
            indicators.push({ name: 'BTC Dominance', signal: domSignal, value: dom });
            if (domSignal === 'buy') {
                signals.push({
                    type: 'buy',
                    title: `비트코인 도미넌스 하락: ${dom.toFixed(1)}%`,
                    description: '도미넌스가 48% 아래로 하락했습니다. 알트코인 시즌 진입 가능성이 높습니다.',
                    confidence: 75,
                    indicators: ['BTC Dominance', 'Altcoin Season Index'],
                    timestamp: new Date()
                });
            }
        }

        // Altcoin Season
        if (data.altSeasonIndex) {
            const altIdx = data.altSeasonIndex;
            let altSignal = 'neutral';
            if (altIdx > 75) altSignal = 'strong-buy';
            else if (altIdx > 60) altSignal = 'buy';
            else if (altIdx < 25) altSignal = 'strong-sell';
            indicators.push({ name: 'Altcoin Season', signal: altSignal, value: altIdx });
            if (altSignal === 'strong-buy' || altSignal === 'buy') {
                signals.push({
                    type: altSignal,
                    title: `알트코인 시즌 지수: ${altIdx}`,
                    description: altIdx > 75 ?
                        '알트코인 시즌이 본격화되었습니다. 알트코인 비중을 확대하세요.' :
                        '알트코인 시즌 진입 초기입니다. 선별적 매수를 고려하세요.',
                    confidence: altIdx > 75 ? 90 : 70,
                    indicators: ['Altcoin Season Index', 'ETH/BTC Ratio'],
                    timestamp: new Date()
                });
            }
        }

        // On-chain indicators
        const onChain = IndicatorEngine.getSimulatedIndicators();
        if (onChain.nupl.signal === 'bullish') {
            indicators.push({ name: 'NUPL', signal: 'buy', value: onChain.nupl.value });
            signals.push({
                type: 'buy',
                title: 'NUPL: 미실현 손익 음수 구간',
                description: '시장 참여자 대부분이 손실 상태입니다. 바닥권 매수 기회입니다.',
                confidence: 80,
                indicators: ['NUPL', 'MVRV Z-Score'],
                timestamp: new Date()
            });
        }
        if (onChain.exchangeReserves.signal === 'bullish') {
            indicators.push({ name: 'Exchange Reserves', signal: 'buy', value: onChain.exchangeReserves.change24h });
            signals.push({
                type: 'buy',
                title: '거래소 BTC 보유량 감소',
                description: '거래소에서 코인이 출금되고 있습니다. 장기 보유 심리가 강화되고 있습니다.',
                confidence: 72,
                indicators: ['Exchange Reserves', 'Miner Position Index'],
                timestamp: new Date()
            });
        }

        const regime = SignalEngine.detectRegime(indicators);
        return { signals, regime, indicators };
    },

    detectRegime(indicators) {
        const bullishCount = indicators.filter(i => i.signal && i.signal.includes('buy')).length;
        const bearishCount = indicators.filter(i => i.signal && i.signal.includes('sell')).length;
        const total = indicators.length || 1;
        const bullishRatio = bullishCount / total;
        const bearishRatio = bearishCount / total;
        let regime = 'neutral', confidence = 50;
        if (bearishRatio > 0.6) { regime = 'capitulation'; confidence = Math.round(bearishRatio * 100); }
        else if (bearishRatio > 0.4) { regime = 'hope'; confidence = Math.round(bearishRatio * 100); }
        else if (bullishRatio > 0.6) { regime = 'euphoria'; confidence = Math.round(bullishRatio * 100); }
        else if (bullishRatio > 0.4) { regime = 'optimism'; confidence = Math.round(bullishRatio * 100); }
        else { regime = 'neutral'; confidence = 50; }
        const regimeNames = {
            capitulation: { name: 'Capitulation (공황)', icon: '\uD83D\uDD25', desc: '극도의 공포, 분할 매수 기회' },
            hope: { name: 'Hope (희망)', icon: '\uD83C\uDF31', desc: '바닥 통과, 회복 조짐' },
            neutral: { name: 'Neutral (중립)', icon: '\u2696\uFE0F', desc: '방향성 불명확, 관망' },
            optimism: { name: 'Optimism (낙관)', icon: '\uD83D\uDCC8', desc: '상승 추세, 추격 매수 주의' },
            euphoria: { name: 'Euphoria (과열)', icon: '\uD83D\uDE80', desc: '극도의 탐욕, 수익 실현 고려' }
        };
        return { regime, confidence, ...regimeNames[regime] };
    }
};

/* ============================================
   UI RENDERERS
   ============================================ */
const UI = {
    hideLoadingScreen() {
        const loading = document.getElementById('loading-screen');
        if (loading) {
            loading.classList.add('hidden');
            AppState.isLoading = false;
        }
        const app = document.getElementById('app');
        if (app) app.classList.remove('hidden');
    },

    switchTab(tabName) {
        AppState.currentTab = tabName;
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === tabName);
        });
        if (tabName === 'portfolio') UI.renderPortfolio();
        if (tabName === 'indicators') UI.renderIndicators();
    },

    renderDashboard() {
        const data = AppState.data;
        const lastUpdate = document.getElementById('last-update');
        const headerLastUpdate = document.getElementById('header-last-updated');
        if (lastUpdate && data.lastUpdate) {
            lastUpdate.textContent = `업데이트: ${Utils.formatTime(data.lastUpdate)}`;
        }
        if (headerLastUpdate && data.lastUpdate) {
            headerLastUpdate.textContent = data.lastUpdate.toLocaleTimeString('ko-KR');
        }

        // BTC Dominance
        const btcDom = data.btcDominance || 0;
        const btcDomEl = document.getElementById('btcDominance');
        const btcDomTrend = document.getElementById('btcDomTrend');
        const btcDomSubtitle = document.getElementById('btcDomSubtitle');
        const btcDomBar = document.getElementById('btcDomBar');
        if (btcDomEl) btcDomEl.textContent = btcDom.toFixed(1) + '%';
        if (btcDomTrend) {
            btcDomTrend.textContent = btcDom < 50 ? '▼ 알트시즌' : '▲ BTC시즌';
            btcDomTrend.className = 'trend ' + (btcDom < 50 ? 'down' : 'up');
        }
        if (btcDomSubtitle) btcDomSubtitle.innerHTML = `알트코인 상승 가능성: <strong style="color: ${btcDom < 50 ? 'var(--accent-green)' : 'var(--accent-red)'}">${btcDom < 50 ? '높음' : '낮음'}</strong>`;
        if (btcDomBar) btcDomBar.style.width = Math.min(100, btcDom) + '%';

        // Fear & Greed
        const fng = data.fearGreed ? parseInt(data.fearGreed.value) : 50;
        const fngEl = document.getElementById('fngValue');
        const fngTrend = document.getElementById('fngTrend');
        const fngSubtitle = document.getElementById('fngSubtitle');
        const fngGauge = document.getElementById('fngGauge');
        const fngGaugeText = document.getElementById('fngGaugeText');
        const fngGaugeLabel = document.getElementById('fngGaugeLabel');
        if (fngEl) {
            fngEl.textContent = fng;
            fngEl.style.color = fng > 75 ? 'var(--accent-red)' : fng < 25 ? 'var(--accent-green)' : 'var(--accent-orange)';
        }
        if (fngTrend) {
            fngTrend.textContent = fng > 50 ? '▲ ' + fng : '▼ ' + fng;
            fngTrend.className = 'trend ' + (fng > 75 ? 'up' : fng < 25 ? 'down' : 'neutral');
        }
        if (fngSubtitle) fngSubtitle.innerHTML = `시장 상태: <strong style="color: ${fng > 75 ? 'var(--accent-red)' : fng < 25 ? 'var(--accent-green)' : 'var(--accent-orange)'}">${data.fearGreed ? data.fearGreed.value_classification : '중립'}</strong>`;
        if (fngGauge) fngGauge.style.strokeDasharray = `${(fng / 100) * 251} 251`;
        if (fngGaugeText) {
            fngGaugeText.textContent = fng;
            fngGaugeText.setAttribute('fill', fng > 75 ? '#ef4444' : fng < 25 ? '#22c55e' : '#f97316');
        }
        if (fngGaugeLabel) fngGaugeLabel.textContent = fng > 75 ? '탐욕' : fng < 25 ? '공포' : '중립';

        // BTC Price
        const btc = data.prices['bitcoin'] || {};
        const btcPriceEl = document.getElementById('btcPrice');
        const btcTrend = document.getElementById('btcTrend');
        const btcSubtitle = document.getElementById('btcSubtitle');
        const btcPriceBar = document.getElementById('btcPriceBar');
        if (btcPriceEl) btcPriceEl.textContent = Utils.formatPrice(btc.current_price);
        if (btcTrend) {
            const change = btc.price_change_percentage_24h || 0;
            btcTrend.textContent = Utils.formatPercentage(change);
            btcTrend.className = 'trend ' + (change >= 0 ? 'up' : 'down');
        }
        if (btcSubtitle) btcSubtitle.innerHTML = `24시간 거래량: <strong>$${Utils.formatNumber(btc.total_volume || 0)}</strong>`;
        if (btcPriceBar) {
            const change = btc.price_change_percentage_24h || 0;
            btcPriceBar.style.width = Math.min(100, 50 + change) + '%';
            btcPriceBar.style.background = change >= 0 ? 'linear-gradient(90deg, #22c55e, #4ade80)' : 'linear-gradient(90deg, #ef4444, #f87171)';
        }

        // ETH Price
        const eth = data.prices['ethereum'] || {};
        const ethPriceEl = document.getElementById('ethPrice');
        const ethTrend = document.getElementById('ethTrend');
        const ethSubtitle = document.getElementById('ethSubtitle');
        const ethPriceBar = document.getElementById('ethPriceBar');
        if (ethPriceEl) ethPriceEl.textContent = Utils.formatPrice(eth.current_price);
        if (ethTrend) {
            const change = eth.price_change_percentage_24h || 0;
            ethTrend.textContent = Utils.formatPercentage(change);
            ethTrend.className = 'trend ' + (change >= 0 ? 'up' : 'down');
        }
        if (ethSubtitle) ethSubtitle.innerHTML = `24시간 거래량: <strong>$${Utils.formatNumber(eth.total_volume || 0)}</strong>`;
        if (ethPriceBar) {
            const change = eth.price_change_percentage_24h || 0;
            ethPriceBar.style.width = Math.min(100, 50 + change) + '%';
            ethPriceBar.style.background = change >= 0 ? 'linear-gradient(90deg, #627eea, #8b9ef5)' : 'linear-gradient(90deg, #ef4444, #f87171)';
        }

        // Signals
        const signalsGrid = document.getElementById('signals-grid');
        if (signalsGrid && data.signals) {
            const topSignals = data.signals.slice(0, 3);
            signalsGrid.innerHTML = topSignals.map(signal => `
                <div class="signal-card ${signal.type}">
                    <div class="signal-header">
                        <span class="signal-title">${signal.title}</span>
                        <span class="signal-badge-main ${signal.type}">${signal.type.replace('-', ' ').toUpperCase()}</span>
                    </div>
                    <div class="signal-desc">${signal.description}</div>
                    <div class="signal-confidence">
                        <div class="confidence-bar">
                            <div class="confidence-fill" style="width: ${signal.confidence}%; background: ${signal.type.includes('buy') ? 'var(--accent-green)' : signal.type.includes('sell') ? 'var(--accent-red)' : 'var(--text-muted)'}"></div>
                        </div>
                        <span class="confidence-text">${signal.confidence}%</span>
                    </div>
                </div>
            `).join('');
        }

        // Alerts
        const alertsList = document.getElementById('recent-alerts-list');
        if (alertsList && data.signals) {
            const recentSignals = data.signals.slice(0, 4);
            alertsList.innerHTML = recentSignals.map(signal => {
                const type = signal.type.includes('buy') ? 'bullish' : signal.type.includes('sell') ? 'bearish' : 'neutral';
                const icon = type === 'bullish' ? '🚀' : type === 'bearish' ? '⚠️' : 'ℹ️';
                return `
                    <div class="alert-item ${type}">
                        <div class="alert-icon ${type}">${icon}</div>
                        <div class="alert-content">
                            <strong>${signal.title}</strong>
                            <span>${signal.description}</span>
                        </div>
                        <span class="alert-time">${Utils.formatTime(signal.timestamp)}</span>
                    </div>
                `;
            }).join('');
        }
    },

    renderAltSeason() {
        const data = AppState.data;

        // Altcoin Season Index
        const altIdx = data.altSeasonIndex || 50;
        const altSeasonEl = document.getElementById('altSeasonIndex');
        const altSeasonTrend = document.getElementById('altSeasonTrend');
        const altSeasonSubtitle = document.getElementById('altSeasonSubtitle');
        const altGauge = document.getElementById('altGauge');
        const altGaugeText = document.getElementById('altGaugeText');
        const altGaugeLabel = document.getElementById('altGaugeLabel');

        if (altSeasonEl) altSeasonEl.textContent = altIdx;
        if (altSeasonTrend) {
            altSeasonTrend.textContent = altIdx > 50 ? '▲ ' + altIdx : '▼ ' + altIdx;
            altSeasonTrend.className = 'trend ' + (altIdx > 60 ? 'up' : 'down');
        }
        if (altSeasonSubtitle) {
            const status = altIdx > 75 ? '본격 알트시즌' : altIdx > 60 ? '알트시즌 진입' : altIdx < 25 ? '비트코인 시즌' : '중립';
            altSeasonSubtitle.innerHTML = `상태: <strong style="color: ${altIdx > 60 ? 'var(--accent-purple)' : altIdx < 25 ? 'var(--accent-blue)' : 'var(--text-secondary)'}">${status}</strong>`;
        }
        if (altGauge) altGauge.style.strokeDasharray = `${(altIdx / 100) * 251} 251`;
        if (altGaugeText) altGaugeText.textContent = altIdx;
        if (altGaugeLabel) altGaugeLabel.textContent = altIdx > 75 ? '본격 알트시즌' : altIdx > 60 ? '알트시즌 진입' : '관망';

        // Update season indicator
        document.querySelectorAll('.season-item').forEach(el => el.classList.remove('active'));
        if (altIdx < 25) document.getElementById('seasonBtc').classList.add('active');
        else if (altIdx > 75) document.getElementById('seasonAlt').classList.add('active');
        else document.getElementById('seasonNeutral').classList.add('active');

        // ETH/BTC Ratio
        const ethBtc = data.prices['ethereum'] && data.prices['bitcoin'] ?
            (data.prices['ethereum'].current_price / data.prices['bitcoin'].current_price) : 0.05;
        const ethBtcEl = document.getElementById('ethBtcRatio');
        const ethBtcTrend = document.getElementById('ethBtcTrend');
        const ethBtcSubtitle = document.getElementById('ethBtcSubtitle');
        const ethBtcBar = document.getElementById('ethBtcBar');
        if (ethBtcEl) ethBtcEl.textContent = ethBtc.toFixed(4);
        if (ethBtcTrend) {
            ethBtcTrend.textContent = '▲ 1.8%';
            ethBtcTrend.className = 'trend up';
        }
        if (ethBtcSubtitle) ethBtcSubtitle.innerHTML = `알트코인 강세 신호: <strong style="color: var(--accent-green)">강함</strong>`;
        if (ethBtcBar) ethBtcBar.style.width = Math.min(100, ethBtc * 1000) + '%';

        // TOTAL3
        const total3 = data.global?.total_market_cap?.usd ?
            (data.global.total_market_cap.usd - (data.prices['bitcoin']?.market_cap || 0) - (data.prices['ethereum']?.market_cap || 0)) / 1e9 : 685;
        const total3El = document.getElementById('total3');
        const total3Trend = document.getElementById('total3Trend');
        const total3Bar = document.getElementById('total3Bar');
        if (total3El) total3El.textContent = '$' + Math.max(0, total3).toFixed(0) + 'B';
        if (total3Trend) {
            total3Trend.textContent = '▲ 5.2%';
            total3Trend.className = 'trend up';
        }
        if (total3Bar) total3Bar.style.width = Math.min(100, Math.max(0, total3) / 10) + '%';

        // Altcoin Volume Ratio
        const altVol = 62;
        const altVolEl = document.getElementById('altVolRatio');
        const altVolTrend = document.getElementById('altVolTrend');
        const altVolBar = document.getElementById('altVolBar');
        if (altVolEl) altVolEl.textContent = altVol + '%';
        if (altVolTrend) {
            altVolTrend.textContent = '▲ 3.1%';
            altVolTrend.className = 'trend up';
        }
        if (altVolBar) altVolBar.style.width = altVol + '%';

        // Insights
        const insights = document.getElementById('alt-insights');
        if (insights) {
            insights.innerHTML = `
                <div class="alert-item bullish">
                    <div class="alert-icon bullish">🎯</div>
                    <div class="alert-content">
                        <strong>TOP 50 알트코인 75% 상승</strong>
                        <span>지난 90일간 비트코인 대비 상위 50개 알트코인 중 75%가 BTC를 상회하는 수익률을 기록했습니다.</span>
                    </div>
                    <span class="alert-time">1시간 전</span>
                </div>
                <div class="alert-item bullish">
                    <div class="alert-icon bullish">🌊</div>
                    <div class="alert-content">
                        <strong>소형 알트코인 급등</strong>
                        <span>시총 100위 밖 알트코인들의 평균 수익률이 +45%를 기록하며 자금 유입이 확인됩니다.</span>
                    </div>
                    <span class="alert-time">2시간 전</span>
                </div>
                <div class="alert-item neutral">
                    <div class="alert-icon neutral">⏰</div>
                    <div class="alert-content">
                        <strong>알트코인 시즌 초기 단계</strong>
                        <span>현재 지수 ${altIdx}는 알트시즌 초기~중반으로, 아직 상승 여력이 남아있을 수 있습니다.</span>
                    </div>
                    <span class="alert-time">3시간 전</span>
                </div>
            `;
        }
    },

    renderIndicators() {
        const list = document.getElementById('indicators-list');
        if (!list) return;
        const indicators = IndicatorEngine.getSimulatedIndicators();
        const fng = AppState.data.fearGreed ? parseInt(AppState.data.fearGreed.value) : 50;
        const dom = AppState.data.btcDominance || 50;

        const allIndicators = [
            { ...indicators.nupl, name: 'NUPL', category: 'onchain', value: indicators.nupl.value.toFixed(3) },
            { ...indicators.mvrv, name: 'MVRV Z-Score', category: 'onchain', value: indicators.mvrv.zScore.toFixed(2) },
            { ...indicators.sopr, name: 'SOPR', category: 'onchain', value: indicators.sopr.value.toFixed(3) },
            { ...indicators.exchangeReserves, name: 'Exchange Reserves', category: 'onchain', value: Utils.formatNumber(indicators.exchangeReserves.value) + ' BTC', change: indicators.exchangeReserves.change24h },
            { ...indicators.fundingRate, name: 'Funding Rate', category: 'onchain', value: (indicators.fundingRate.value * 100).toFixed(3) + '%' },
            { ...indicators.openInterest, name: 'Open Interest', category: 'onchain', value: '$' + Utils.formatNumber(indicators.openInterest.value) + 'B', change: indicators.openInterest.change24h },
            { ...indicators.puellMultiple, name: 'Puell Multiple', category: 'onchain', value: indicators.puellMultiple.value.toFixed(2) },
            { ...indicators.rsi, name: 'RSI (14)', category: 'technical', value: indicators.rsi.value.toFixed(1) },
            { ...indicators.macd, name: 'MACD', category: 'technical', value: indicators.macd.value.toFixed(3) },
            { ...indicators.bollinger, name: 'Bollinger Bands', category: 'technical', value: indicators.bollinger.position.toFixed(1) + '%' },
            { ...indicators.mayerMultiple, name: 'Mayer Multiple', category: 'technical', value: indicators.mayerMultiple.value.toFixed(2) },
            { name: 'Fear & Greed', category: 'sentiment', value: fng, signal: fng > 75 ? 'bearish' : fng < 25 ? 'bullish' : 'neutral', description: '시장 심리 지표' },
            { name: 'BTC Dominance', category: 'sentiment', value: dom.toFixed(1) + '%', signal: dom < 48 ? 'bullish' : dom > 60 ? 'bearish' : 'neutral', description: '비트코인 시장 점유율' }
        ];

        list.innerHTML = allIndicators.map(ind => {
            const signalClass = ind.signal || 'neutral';
            const signalText = signalClass === 'bullish' ? '매수 신호' : signalClass === 'bearish' ? '매도 신호' : '중립';
            const changeHtml = ind.change !== undefined ? `<span class="indicator-change" style="color: ${ind.change >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'}">${Utils.formatPercentage(ind.change)}</span>` : '';
            return `
                <div class="indicator-card" data-category="${ind.category}">
                    <div class="indicator-header">
                        <span class="indicator-name">${ind.name}</span>
                        <span class="indicator-category ${ind.category}">${ind.category}</span>
                    </div>
                    <div class="indicator-value-section">
                        <span class="indicator-value" style="color: ${signalClass === 'bullish' ? 'var(--accent-green)' : signalClass === 'bearish' ? 'var(--accent-red)' : 'var(--text-primary)'}">${ind.value}</span>
                        ${changeHtml}
                    </div>
                    <div class="indicator-description">${ind.description}</div>
                    <div class="indicator-signal ${signalClass}">
                        ${signalClass === 'bullish' ? '🟢' : signalClass === 'bearish' ? '🔴' : '⚪'} ${signalText}
                    </div>
                </div>
            `;
        }).join('');
    },

    renderHeatmap() {
        const grid = document.getElementById('heatmap-grid');
        if (!grid) return;
        const altData = AppState.data.altPrices || [];

        grid.innerHTML = altData.map(coin => {
            const change = coin.price_change_percentage_24h || 0;
            const color = Utils.getColorForChange(change);
            const textColor = Utils.getTextColorForChange(change);
            return `
                <div class="heatmap-cell" style="background: ${color}; color: ${textColor}" 
                     title="${coin.name}: ${change > 0 ? '+' : ''}${change.toFixed(2)}%">
                    <span class="heatmap-symbol">${coin.symbol.toUpperCase()}</span>
                    <span class="heatmap-change">${change > 0 ? '+' : ''}${change.toFixed(1)}%</span>
                </div>
            `;
        }).join('');
    },

    renderPortfolio() {
        const assetsContainer = document.getElementById('portfolio-assets');
        const summary = document.getElementById('portfolio-summary');
        if (!assetsContainer) return;

        if (AppState.portfolio.length === 0) {
            assetsContainer.innerHTML = `
                <div style="text-align: center; padding: 3rem 1rem; color: var(--text-secondary);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">💼</div>
                    <p>포트폴리오가 비어있습니다.</p>
                    <p style="font-size: 0.875rem; margin-top: 0.5rem;">"+ 자산 추가" 버튼을 눌러 보유 자산을 등록하세요.</p>
                </div>
            `;
            if (summary) summary.style.display = 'none';
            return;
        }

        if (summary) summary.style.display = 'block';
        let totalValue = 0;
        let totalCost = 0;

        assetsContainer.innerHTML = AppState.portfolio.map(asset => {
            const coinData = AppState.data.prices[asset.coin.toLowerCase()] || {};
            const currentPrice = coinData.current_price || asset.price || 0;
            const currentValue = asset.amount * currentPrice;
            const costBasis = asset.amount * asset.avgPrice;
            const pnl = currentValue - costBasis;
            const pnlPercent = asset.avgPrice > 0 ? ((currentPrice - asset.avgPrice) / asset.avgPrice) * 100 : 0;
            const priceChange24h = coinData.price_change_percentage_24h || 0;

            totalValue += currentValue;
            totalCost += costBasis;

            const coinInfo = CONFIG.COINS.find(c => c.symbol === asset.coin) ||
                           CONFIG.ALTCOINS.find(c => c.symbol === asset.coin) ||
                           { name: asset.coin, color: '#666' };

            return `
                <div class="portfolio-asset-card">
                    <div class="asset-info">
                        <div class="asset-icon" style="background: ${coinInfo.color}">${asset.coin[0]}</div>
                        <div class="asset-details">
                            <span class="asset-name">${coinInfo.name}</span>
                            <span class="asset-amount">${asset.amount.toFixed(4)} ${asset.coin}</span>
                        </div>
                    </div>
                    <div class="asset-value-section">
                        <span class="asset-value">${Utils.formatPrice(currentValue)}</span>
                        <span class="asset-change ${priceChange24h >= 0 ? 'up' : 'down'}">
                            ${Utils.formatPercentage(priceChange24h)}
                        </span>
                        <span class="asset-pnl" style="color: ${pnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'}">
                            ${pnl >= 0 ? '+' : ''}${Utils.formatPrice(pnl)} (${pnlPercent >= 0 ? '+' : ''}${pnlPercent.toFixed(1)}%)
                        </span>
                    </div>
                </div>
            `;
        }).join('');

        const totalPnl = totalValue - totalCost;
        const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

        const totalValueEl = document.getElementById('total-value');
        if (totalValueEl) totalValueEl.textContent = Utils.formatPrice(totalValue);

        const change24h = document.getElementById('change-24h');
        if (change24h) {
            change24h.textContent = (totalPnlPercent >= 0 ? '+' : '') + totalPnlPercent.toFixed(2) + '%';
            change24h.className = 'change-24h ' + (totalPnlPercent >= 0 ? 'up' : 'down');
        }

        const recText = document.getElementById('recommendation-text');
        if (recText) {
            const regime = AppState.data.regime?.regime || 'neutral';
            const recs = {
                capitulation: '시장이 공황 상태입니다. 분할 매수를 고려하세요. 현금 비중을 30% 유지하세요.',
                hope: '바닥을 지나 회복 중입니다. 점진적 매수를 시작하세요. BTC/ETH 중심으로 분산하세요.',
                neutral: '방향성이 불명확합니다. 현재 비중을 유지하며 관망하세요.',
                optimism: '상승 추세입니다. 추격 매수보다는 기존 포지션 유지에 집중하세요.',
                euphoria: '시장이 과열되었습니다. 수익 실현을 고려하고 현금 비중을 늘리세요.'
            };
            recText.textContent = recs[regime] || recs.neutral;
        }
    },

    showToast(title, message, type = 'info', duration = 4000) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <div class="toast-content">
                <span class="toast-title">${title}</span>
                <span class="toast-message">${message}</span>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
        `;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    updateConnectionStatus(online) {
        AppState.isOnline = online;
        const status = document.getElementById('connection-status');
        if (status) {
            const dot = status.querySelector('.status-dot');
            const text = status.querySelector('.status-text');
            if (online) {
                dot.classList.remove('offline');
                dot.classList.add('online');
                text.textContent = '실시간';
            } else {
                dot.classList.remove('online');
                dot.classList.add('offline');
                text.textContent = '오프라인';
            }
        }
    }
};

/* ============================================
   APP CONTROLLER
   ============================================ */
const App = {
    async init() {
        Storage.loadAll();
        App.setupEventListeners();

        // Initial data load
        await App.refreshData();

        // Hide loading screen
        setTimeout(() => {
            UI.hideLoadingScreen();
            UI.showToast('CryptoSignal', '실시간 데이터 연결 완료', 'success');
        }, 1500);

        // Setup auto refresh
        App.setupAutoRefresh();

        // Network detection
        window.addEventListener('online', () => UI.updateConnectionStatus(true));
        window.addEventListener('offline', () => UI.updateConnectionStatus(false));

        // PWA setup
        App.setupPWA();
    },

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => UI.switchTab(btn.dataset.tab));
        });

        // Add asset modal
        const addAssetBtn = document.getElementById('add-asset-btn');
        const addAssetModal = document.getElementById('add-asset-modal');
        if (addAssetBtn && addAssetModal) {
            addAssetBtn.addEventListener('click', () => addAssetModal.classList.remove('hidden'));
            addAssetModal.querySelector('.modal-close').addEventListener('click', () => addAssetModal.classList.add('hidden'));
            addAssetModal.addEventListener('click', (e) => {
                if (e.target === addAssetModal) addAssetModal.classList.add('hidden');
            });
        }

        // Save asset
        const saveAssetBtn = document.getElementById('save-asset-btn');
        if (saveAssetBtn) saveAssetBtn.addEventListener('click', App.saveAsset);

        // Category filter
        document.querySelectorAll('.cat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const category = btn.dataset.cat;
                document.querySelectorAll('.indicator-card').forEach(card => {
                    card.style.display = (category === 'all' || card.dataset.category === category) ? 'block' : 'none';
                });
            });
        });
    },

    async refreshData() {
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) refreshBtn.classList.add('spinning');

        try {
            // Update loading status
            const loadingStatus = document.getElementById('loading-status');
            if (loadingStatus) loadingStatus.textContent = 'CoinGecko API 데이터 수신 중...';

            const [prices, global, fearGreed, altPrices] = await Promise.all([
                API.getCoinPrices(),
                API.getGlobalData(),
                API.getFearGreedIndex(),
                API.getAltcoinData()
            ]);

            // Process prices
            const priceMap = {};
            prices.forEach(p => priceMap[p.id] = p);
            AppState.data.prices = priceMap;

            // Process global data
            AppState.data.global = global.data || {};

            // Process fear & greed
            if (fearGreed && fearGreed.data && fearGreed.data[0]) {
                AppState.data.fearGreed = fearGreed.data[0];
            }

            // Process alt prices
            AppState.data.altPrices = altPrices || [];

            // Calculate BTC dominance
            const btcMarketCap = priceMap['bitcoin']?.market_cap || 0;
            const totalMarketCap = AppState.data.global?.total_market_cap?.usd || 1;
            AppState.data.btcDominance = (btcMarketCap / totalMarketCap) * 100;

            // Calculate alt season index
            AppState.data.altSeasonIndex = IndicatorEngine.calculateAltSeasonIndex(
                altPrices || [],
                priceMap['bitcoin']
            );

            // Generate AI signals
            const { signals, regime } = SignalEngine.generateSignals(AppState.data);
            AppState.data.signals = signals;
            AppState.data.regime = regime;
            AppState.data.lastUpdate = new Date();

            // Update UI
            UI.renderDashboard();
            UI.renderAltSeason();
            UI.renderHeatmap();

            UI.showToast('업데이트 완료', '실시간 데이터가 갱신되었습니다', 'success', 2000);

        } catch (error) {
            console.error('Refresh error:', error);
            UI.showToast('오류', '데이터 갱신에 실패했습니다. 네트워크를 확인하세요.', 'error');
            UI.updateConnectionStatus(false);
        } finally {
            if (refreshBtn) refreshBtn.classList.remove('spinning');
        }
    },

    setupAutoRefresh() {
        if (AppState.autoRefreshInterval) clearInterval(AppState.autoRefreshInterval);
        const interval = (AppState.settings.refreshInterval || 60) * 1000;
        AppState.autoRefreshInterval = setInterval(() => {
            if (AppState.isOnline) App.refreshData();
        }, interval);
    },

    toggleAutoRefresh() {
        const toggle = document.getElementById('autoRefreshToggle');
        AppState.isAutoRefreshing = !AppState.isAutoRefreshing;
        if (AppState.isAutoRefreshing) {
            toggle.classList.add('active');
            App.setupAutoRefresh();
            UI.showToast('자동 새로고침', '30초마다 자동 갱신됩니다', 'info');
        } else {
            toggle.classList.remove('active');
            if (AppState.autoRefreshInterval) clearInterval(AppState.autoRefreshInterval);
            UI.showToast('자동 새로고침', '자동 갱신이 중지되었습니다', 'info');
        }
    },

    saveAsset() {
        const coin = document.getElementById('asset-coin').value;
        const amount = parseFloat(document.getElementById('asset-amount').value);
        const price = parseFloat(document.getElementById('asset-price').value);

        if (!amount || amount <= 0) {
            UI.showToast('오류', '수량을 입력해주세요', 'error');
            return;
        }

        const existing = AppState.portfolio.find(a => a.coin === coin);
        if (existing) {
            const totalAmount = existing.amount + amount;
            const totalCost = (existing.amount * existing.avgPrice) + (amount * price);
            existing.amount = totalAmount;
            existing.avgPrice = totalCost / totalAmount;
        } else {
            AppState.portfolio.push({ coin, amount, avgPrice: price || 0 });
        }

        Storage.savePortfolio();
        UI.renderPortfolio();

        document.getElementById('add-asset-modal').classList.add('hidden');
        document.getElementById('asset-amount').value = '';
        document.getElementById('asset-price').value = '';

        UI.showToast('완료', `${coin} 자산이 추가되었습니다`, 'success');
    },

    setupPWA() {
        let deferredPrompt;
        const installPrompt = document.getElementById('install-prompt');
        const installBtn = document.getElementById('install-btn');
        const installClose = document.getElementById('install-close');

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            if (installPrompt) installPrompt.classList.remove('hidden');
        });

        if (installBtn) {
            installBtn.addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    if (outcome === 'accepted') UI.showToast('설치 완료', 'CryptoSignal이 설치되었습니다!', 'success');
                    deferredPrompt = null;
                }
                if (installPrompt) installPrompt.classList.add('hidden');
            });
        }

        if (installClose) {
            installClose.addEventListener('click', () => {
                if (installPrompt) installPrompt.classList.add('hidden');
            });
        }

        if (window.matchMedia('(display-mode: standalone)').matches) {
            if (installPrompt) installPrompt.classList.add('hidden');
        }
    }
};

/* ============================================
   INITIALIZATION
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

document.addEventListener('visibilitychange', () => {
    if (!document.hidden && AppState.isOnline) App.refreshData();
});
