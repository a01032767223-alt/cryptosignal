/* ============================================
   CryptoSignal - Main Application v1.0
   PWA Crypto Investment Intelligence Dashboard
   ============================================ */

const CONFIG = {
    version: '1.0.0',
    refreshInterval: 60000,
    apiEndpoints: {
        fearGreed: 'https://api.alternative.me/fng/?limit=1',
        coinGecko: 'https://api.coingecko.com/api/v3'
    },
    coins: {
        BTC: { name: 'Bitcoin', icon: '₿', color: '#f7931a' },
        ETH: { name: 'Ethereum', icon: 'Ξ', color: '#627eea' },
        SOL: { name: 'Solana', icon: '◎', color: '#00ffa3' },
        XRP: { name: 'XRP', icon: '✕', color: '#23292f' },
        ADA: { name: 'Cardano', icon: '₳', color: '#0033ad' },
        DOGE: { name: 'Dogecoin', icon: 'Ð', color: '#c2a633' },
        DOT: { name: 'Polkadot', icon: '●', color: '#e6007a' },
        AVAX: { name: 'Avalanche', icon: '▲', color: '#e84142' },
        LINK: { name: 'Chainlink', icon: '◈', color: '#2a5ada' },
        MATIC: { name: 'Polygon', icon: '⬡', color: '#8247e5' }
    }
};

const State = {
    data: {},
    portfolio: JSON.parse(localStorage.getItem('cs_portfolio')) || [],
    alerts: JSON.parse(localStorage.getItem('cs_alerts')) || {},
    settings: JSON.parse(localStorage.getItem('cs_settings')) || {
        darkMode: true, notifications: false, refreshInterval: 60, currency: 'USD'
    },
    signals: [],
    history: JSON.parse(localStorage.getItem('cs_history')) || [],
    save(key, value) { this[key] = value; localStorage.setItem(`cs_${key}`, JSON.stringify(value)); },
    load(key) { const d = localStorage.getItem(`cs_${key}`); return d ? JSON.parse(d) : null; }
};

const DataFetcher = {
    cache: new Map(),
    async fetch(url, cacheKey, ttl = 300000) {
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.time < ttl) return cached.data;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            this.cache.set(cacheKey, { data, time: Date.now() });
            return data;
        } catch (error) {
            console.warn(`Fetch error: ${url}`, error);
            if (cached) return cached.data;
            return null;
        }
    },
    async getFearGreed() {
        const data = await this.fetch(CONFIG.apiEndpoints.fearGreed, 'fear_greed', 300000);
        if (!data || !data.data || !data.data[0]) return null;
        return { value: parseInt(data.data[0].value), classification: data.data[0].value_classification, timestamp: parseInt(data.data[0].timestamp) * 1000 };
    },
    async getCoinPrices() {
        const ids = 'bitcoin,ethereum,solana,ripple,cardano,dogecoin,polkadot,avalanche-2,chainlink,matic-network';
        const url = `${CONFIG.apiEndpoints.coinGecko}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`;
        return await this.fetch(url, 'coin_prices', 60000);
    },
    async getGlobalData() {
        const url = `${CONFIG.apiEndpoints.coinGecko}/global`;
        const data = await this.fetch(url, 'global_data', 300000);
        return data?.data;
    },
    getSimulatedOnChainMetrics() {
        const now = Date.now();
        const dayOfYear = Math.floor((now - new Date(2026, 0, 1).getTime()) / 86400000);
        const cyclePhase = (Math.sin(dayOfYear / 60) + 1) / 2;
        return {
            nupl: -0.05 + (cyclePhase * 0.6),
            mvrv: 0.8 + (cyclePhase * 2.2),
            mvrvZScore: -1.5 + (cyclePhase * 5),
            sopr: 0.98 + (cyclePhase * 0.08),
            exchangeReserves: 2300000 - (cyclePhase * 500000),
            lthSupply: 0.65 + (cyclePhase * 0.1),
            realizedPrice: 42000 + (cyclePhase * 30000),
            puellMultiple: 0.5 + (cyclePhase * 1.5),
            minerPositionIndex: -0.8 + (cyclePhase * 2.5),
            ssr: 2.5 - (cyclePhase * 1.5),
            activeAddresses: 800000 + (cyclePhase * 400000),
            fundingRate: -0.02 + (cyclePhase * 0.06),
            openInterest: 15 + (cyclePhase * 25),
        };
    },
    getSimulatedETFFlows() {
        const dayOfWeek = new Date().getDay();
        const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
        if (!isWeekday) return { netFlow: 0, ibit: 0, fbtc: 0, arkB: 0, totalAum: 0 };
        const baseFlow = (Math.random() - 0.3) * 500;
        return { netFlow: Math.round(baseFlow), ibit: Math.round(baseFlow * 0.6), fbtc: Math.round(baseFlow * 0.2), arkB: Math.round(baseFlow * 0.1), totalAum: 85000 + Math.round(Math.random() * 5000) };
    }
};

const SignalEngine = {
    generateSignals(data) {
        const signals = [];
        const { fearGreed, onChain, global } = data;
        if (!fearGreed || !onChain) return signals;

        const s1 = this.calcSentiment(fearGreed, onChain);
        if (s1.strength >= 3) signals.push({...s1, id: 'sentiment-nupl', asset: 'BTC', timestamp: Date.now()});

        const s2 = this.calcMVRV(onChain);
        if (s2.strength >= 2) signals.push({...s2, id: 'mvrv-extreme', asset: 'BTC', timestamp: Date.now()});

        const s3 = this.calcMiner(onChain);
        if (s3.strength >= 2) signals.push({...s3, id: 'miner-signal', asset: 'BTC', timestamp: Date.now()});

        const s4 = this.calcDeriv(onChain);
        if (s4.strength >= 2) signals.push({...s4, id: 'derivatives', asset: 'BTC', timestamp: Date.now()});

        if (global) {
            const s5 = this.calcAltcoin(global, onChain);
            if (s5.strength >= 2) signals.push({...s5, id: 'altcoin-season', asset: 'ALTS', timestamp: Date.now()});
        }
        return signals;
    },

    calcSentiment(fg, oc) {
        const ind = []; let score = 0;
        if (fg.value <= 20) { score += 2; ind.push({name: 'Fear & Greed', value: `${fg.value} (극도 공포)`, match: true}); }
        else if (fg.value >= 75) { score -= 2; ind.push({name: 'Fear & Greed', value: `${fg.value} (극도 탐욕)`, match: true}); }
        else ind.push({name: 'Fear & Greed', value: `${fg.value} (${fg.classification})`, match: false});

        if (oc.nupl < 0) { score += 2; ind.push({name: 'NUPL', value: `${oc.nupl.toFixed(3)} (Capitulation)`, match: true}); }
        else if (oc.nupl > 0.75) { score -= 2; ind.push({name: 'NUPL', value: `${oc.nupl.toFixed(3)} (Euphoria)`, match: true}); }
        else ind.push({name: 'NUPL', value: oc.nupl.toFixed(3), match: false});

        if (oc.exchangeReserves < 2000000) { score += 1; ind.push({name: 'Exchange Reserves', value: '역사적 저점', match: true}); }

        const type = score >= 3 ? 'buy' : score <= -3 ? 'sell' : 'neutral';
        const confidence = Math.min(Math.abs(score) * 15 + 40, 95);
        return {
            type, strength: Math.abs(score), confidence,
            regime: type === 'buy' ? '축적 단계' : type === 'sell' ? '분배 단계' : '전환 단계',
            indicators: ind,
            action: type === 'buy' ? '비트코인 분할 매수 고려. NUPL Capitulation + Fear & Greed 극도 공포는 역사적 매수 기회.' :
                    type === 'sell' ? '수익 실현 고려. NUPL Euphoria + Fear & Greed 극도 탐욕은 조정 신호.' :
                    '현재 포지션 유지 관망. 명확한 방향성 부재.'
        };
    },

    calcMVRV(oc) {
        const ind = []; let score = 0;
        if (oc.mvrvZScore < -1) { score += 2; ind.push({name: 'MVRV Z-Score', value: `${oc.mvrvZScore.toFixed(2)} (저평가)`, match: true}); }
        else if (oc.mvrvZScore > 3) { score -= 2; ind.push({name: 'MVRV Z-Score', value: `${oc.mvrvZScore.toFixed(2)} (과열)`, match: true}); }
        else ind.push({name: 'MVRV Z-Score', value: oc.mvrvZScore.toFixed(2), match: false});

        if (oc.mvrv < 1.0) { score += 1; ind.push({name: 'MVRV Ratio', value: `${oc.mvrv.toFixed(2)} (저평가)`, match: true}); }
        else if (oc.mvrv > 3.5) { score -= 1; ind.push({name: 'MVRV Ratio', value: `${oc.mvrv.toFixed(2)} (과열)`, match: true}); }

        const type = score >= 2 ? 'buy' : score <= -2 ? 'sell' : 'neutral';
        const confidence = Math.min(Math.abs(score) * 20 + 45, 92);
        return {
            type, strength: Math.abs(score), confidence,
            regime: type === 'buy' ? '가치 축적 구간' : type === 'sell' ? '가치 과열 구간' : '적정 가치 구간',
            indicators: ind,
            action: type === 'buy' ? 'MVRV Z-Score이 -1σ 이하. 역사적으로 강력한 매수 구간. DCA 전략 권장.' :
                    type === 'sell' ? 'MVRV Z-Score이 +3σ 이상. 사이클 고점 근접 가능성. 점진적 매도 고려.' :
                    'MVRV가 적정 범위 내. 추세 확인 후 포지션 조정.'
        };
    },

    calcMiner(oc) {
        const ind = []; let score = 0;
        if (oc.minerPositionIndex < -0.5) { score += 2; ind.push({name: 'Miner Position Index', value: `${oc.minerPositionIndex.toFixed(2)} (축적)`, match: true}); }
        else if (oc.minerPositionIndex > 2.0) { score -= 2; ind.push({name: 'Miner Position Index', value: `${oc.minerPositionIndex.toFixed(2)} (매도)`, match: true}); }

        if (oc.puellMultiple < 0.5) { score += 1; ind.push({name: 'Puell Multiple', value: `${oc.puellMultiple.toFixed(2)} (저평가)`, match: true}); }
        else if (oc.puellMultiple > 1.4) { score -= 1; ind.push({name: 'Puell Multiple', value: `${oc.puellMultiple.toFixed(2)} (과열)`, match: true}); }

        const type = score >= 2 ? 'buy' : score <= -2 ? 'sell' : 'neutral';
        const confidence = Math.min(Math.abs(score) * 18 + 42, 90);
        return {
            type, strength: Math.abs(score), confidence,
            regime: type === 'buy' ? '채굴자 항복 종료' : type === 'sell' ? '채굴자 대량 매도' : '채굴자 중립',
            indicators: ind,
            action: type === 'buy' ? '채굴자들이 축적 중. Hash Ribbons 매수 신호 가능성. 강력한 바닥 신호.' :
                    type === 'sell' ? '채굴자들이 대량 매도 중. 수익 실현 압력 증가. 주의 필요.' :
                    '채굴자 활동 중립. 다른 지표와 함께 판단.'
        };
    },

    calcDeriv(oc) {
        const ind = []; let score = 0;
        if (oc.fundingRate < -0.01) { score += 2; ind.push({name: 'Funding Rate', value: `${(oc.fundingRate * 100).toFixed(3)}% (숏 과다)`, match: true}); }
        else if (oc.fundingRate > 0.03) { score -= 2; ind.push({name: 'Funding Rate', value: `${(oc.fundingRate * 100).toFixed(3)}% (롱 과다)`, match: true}); }

        if (oc.openInterest > 35) { score -= 1; ind.push({name: 'Open Interest', value: `$${oc.openInterest.toFixed(1)}B (과열)`, match: true}); }

        const type = score >= 2 ? 'buy' : score <= -2 ? 'sell' : 'neutral';
        const confidence = Math.min(Math.abs(score) * 20 + 40, 88);
        return {
            type, strength: Math.abs(score), confidence,
            regime: type === 'buy' ? '숏 스퀴즈 가능성' : type === 'sell' ? '롱 청산 위험' : '레버리지 중립',
            indicators: ind,
            action: type === 'buy' ? 'Funding Rate 음수 지속. 숏 과다로 인한 반등 가능성 높음. 롱 포지션 유리.' :
                    type === 'sell' ? 'Funding Rate 과열 + OI 급증. 대형 청산/조정 위험. 레버리지 축소 권장.' :
                    '파생상품 시장 중립. 현물 중심 투자 권장.'
        };
    },

    calcAltcoin(global, oc) {
        const btcD = global.market_cap_percentage?.btc || 55;
        const ind = []; let score = 0;
        const altSeasonIndex = Math.max(0, Math.min(100, 100 - (btcD - 40) * 4));

        if (altSeasonIndex > 75) { score += 2; ind.push({name: 'Altcoin Season Index', value: `${altSeasonIndex.toFixed(0)} (알트시즌)`, match: true}); }
        else if (altSeasonIndex < 25) { score -= 2; ind.push({name: 'Altcoin Season Index', value: `${altSeasonIndex.toFixed(0)} (비트코인 시즌)`, match: true}); }

        if (btcD < 50) { score += 1; ind.push({name: 'BTC Dominance', value: `${btcD.toFixed(1)}% (하락)`, match: true}); }
        else if (btcD > 60) { score -= 1; ind.push({name: 'BTC Dominance', value: `${btcD.toFixed(1)}% (상승)`, match: true}); }

        const type = score >= 2 ? 'buy' : score <= -2 ? 'sell' : 'neutral';
        const confidence = Math.min(Math.abs(score) * 18 + 45, 90);
        return {
            type, strength: Math.abs(score), confidence,
            regime: type === 'buy' ? '알트코인 시즌 진행' : type === 'sell' ? '비트코인 시즌 진행' : '전환 구간',
            indicators: ind,
            action: type === 'buy' ? '알트코인 시즌 진행 중. BTC 수익 일부 알트코인으로 전환 고려. SOL, ETH 중심.' :
                    type === 'sell' ? '비트코인 시즌 진행 중. 알트코인 → BTC 전환 고려. BTC Dominance 상승 지속.' :
                    '시즌 전환 구간. 핵심 자산 비중 유지, 신규 진입은 신중하게.'
        };
    },

    detectRegime(data) {
        const { fearGreed, onChain } = data;
        if (!fearGreed || !onChain) return { name: '분석 중...', desc: '데이터 수집 중', confidence: 0 };
        let regime = '', confidence = 0;
        if (onChain.nupl < 0 && fearGreed.value < 25) { regime = 'Capitulation (항복)'; confidence = 85; }
        else if (onChain.nupl < 0.25 && fearGreed.value < 40) { regime = 'Hope (희망)'; confidence = 70; }
        else if (onChain.nupl < 0.5 && fearGreed.value < 55) { regime = 'Optimism (낙관)'; confidence = 75; }
        else if (onChain.nupl < 0.75 && fearGreed.value < 75) { regime = 'Belief (신뢰)'; confidence = 80; }
        else if (onChain.nupl >= 0.75 && fearGreed.value >= 75) { regime = 'Euphoria (환희)'; confidence = 90; }
        else { regime = 'Transition (전환)'; confidence = 50; }
        return { name: regime, desc: this.getRegimeDesc(regime), confidence };
    },

    getRegimeDesc(regime) {
        const d = {
            'Capitulation (항복)': '역사적으로 세대적 매수 기회. 대부분 투자자 손실 중.',
            'Hope (희망)': '초기 회복 단계. 신중한 낙관 심리 형성 중.',
            'Optimism (낙관)': '회복 가속화. 추가 상승 여력 존재.',
            'Belief (신뢰)': '건강한 불장. 모멘텀 유지 중.',
            'Euphoria (환희)': '극도의 탐욕. 사이클 고점 근접 가능성.',
            'Transition (전환)': '시장 방향성 불명확. 추가 확인 필요.'
        };
        return d[regime] || '데이터 분석 중...';
    }
};

const UI = {
    renderDashboard(data) {
        this.renderSignalsGrid(data);
        this.renderMetricsGrid(data);
        this.renderRegime(data);
        this.renderRecentAlerts(data);
        const lu = document.getElementById('last-update');
        if (lu) lu.textContent = `업데이트: ${new Date().toLocaleTimeString('ko-KR')}`;
    },

    renderSignalsGrid(data) {
        const c = document.getElementById('signals-grid');
        if (!c) return;
        const signals = State.signals.slice(0, 3);
        if (signals.length === 0) {
            c.innerHTML = `<div class="signal-card neutral"><div class="signal-icon">⏳</div><div class="signal-info"><div class="signal-title">신호 분석 중</div><div class="signal-desc">데이터를 수집하고 신호를 생성합니다...</div></div><div class="signal-confidence">--%</div></div>`;
            return;
        }
        c.innerHTML = signals.map(s => `<div class="signal-card ${s.type}"><div class="signal-icon">${s.type === 'buy' ? '🟢' : s.type === 'sell' ? '🔴' : '🟡'}</div><div class="signal-info"><div class="signal-title">${s.type === 'buy' ? '매수' : s.type === 'sell' ? '매도' : '관망'} 신호 — ${s.asset}</div><div class="signal-desc">${s.regime} · ${s.indicators.filter(i => i.match).length}개 지표 일치</div></div><div class="signal-confidence">${s.confidence}%</div></div>`).join('');
        const active = signals.filter(s => s.type !== 'neutral').length;
        const badge = document.getElementById('signal-badge');
        if (badge) { badge.textContent = active; badge.classList.toggle('hidden', active === 0); }
    },

    renderMetricsGrid(data) {
        const c = document.getElementById('metrics-grid');
        if (!c) return;
        const { fearGreed, onChain, global } = data;
        const metrics = [
            { label: '😨 Fear & Greed', value: fearGreed ? fearGreed.value : '--', change: fearGreed ? fearGreed.classification : '', gauge: fearGreed ? fearGreed.value : 0, color: this.fgColor(fearGreed?.value || 50) },
            { label: '📊 Altcoin Season', value: global ? `${Math.max(0, Math.min(100, 100 - ((global.market_cap_percentage?.btc || 55) - 40) * 4)).toFixed(0)}` : '--', change: global && global.market_cap_percentage?.btc < 50 ? '알트시즌' : '비트코인 시즌', gauge: global ? Math.max(0, Math.min(100, 100 - ((global.market_cap_percentage?.btc || 55) - 40) * 4)) : 0, color: '#a855f7' },
            { label: '👑 BTC Dominance', value: global ? `${global.market_cap_percentage?.btc?.toFixed(1) || '--'}%` : '--', change: '', gauge: global ? global.market_cap_percentage?.btc || 0 : 0, color: '#f7931a' },
            { label: '📈 NUPL', value: onChain ? onChain.nupl.toFixed(3) : '--', change: onChain ? this.nuplZone(onChain.nupl) : '', gauge: onChain ? Math.max(0, Math.min(100, (onChain.nupl + 0.2) / 1.2 * 100)) : 0, color: this.nuplColor(onChain?.nupl || 0) }
        ];
        c.innerHTML = metrics.map(m => `<div class="metric-card"><div class="metric-label">${m.label}</div><div class="metric-value" style="color: ${m.color}">${m.value}</div><div class="metric-change ${m.change.includes('시즌') || m.change.includes('Euphoria') || m.change.includes('Belief') ? 'up' : m.change.includes('공포') || m.change.includes('Capitulation') ? 'down' : ''}">${m.change}</div><div class="metric-gauge"><div class="metric-gauge-fill" style="width: ${m.gauge}%; background: ${m.color}"></div></div></div>`).join('');
    },

    renderRegime(data) {
        const regime = SignalEngine.detectRegime(data);
        const nameEl = document.getElementById('regime-name');
        const descEl = document.getElementById('regime-desc');
        const confEl = document.getElementById('regime-confidence');
        const iconEl = document.querySelector('.regime-icon');
        if (nameEl) nameEl.textContent = regime.name;
        if (descEl) descEl.textContent = regime.desc;
        if (confEl) confEl.textContent = `${regime.confidence}%`;
        if (iconEl) {
            const icons = { 'Capitulation': '💀', 'Hope': '🌱', 'Optimism': '📈', 'Belief': '🚀', 'Euphoria': '🎢', 'Transition': '🔄' };
            const key = Object.keys(icons).find(k => regime.name.includes(k)) || 'Transition';
            iconEl.textContent = icons[key];
        }
    },

    renderRecentAlerts(data) {
        const c = document.getElementById('recent-alerts-list');
        if (!c) return;
        const alerts = [
            { time: '10분 전', text: 'NUPL이 Optimism 존으로 상승', icon: '📊' },
            { time: '1시간 전', text: 'Exchange Reserves 30일 최저치 갱신', icon: '🏦' },
            { time: '3시간 전', text: 'Funding Rate 음수 지속 — 숏 과다', icon: '📉' },
            { time: '5시간 전', text: 'BTC 200일 이동평균 상회', icon: '📈' }
        ];
        c.innerHTML = alerts.map(a => `<div class="alert-item"><span>${a.icon}</span><span class="alert-text">${a.text}</span><span class="alert-time">${a.time}</span></div>`).join('');
    },

    renderIndicators(data, filter = 'all') {
        const c = document.getElementById('indicators-list');
        if (!c) return;
        const { fearGreed, onChain, global } = data;
        const indicators = [
            { id: 'fear-greed', name: 'Fear & Greed Index', category: 'sentiment', value: fearGreed?.value || '--', status: this.fgStatus(fearGreed?.value), gauge: fearGreed?.value || 50, desc: '0(극도 공포)~100(극도 탐욕). 변동성, 거래량, 소셜미디어, 설문조사 등 가중 평균.', zones: true },
            { id: 'btc-dominance', name: 'Bitcoin Dominance', category: 'sentiment', value: global ? `${global.market_cap_percentage?.btc?.toFixed(1)}%` : '--', status: global && global.market_cap_percentage?.btc > 60 ? 'bearish' : global && global.market_cap_percentage?.btc < 50 ? 'bullish' : 'neutral', gauge: global ? global.market_cap_percentage?.btc || 0 : 0, desc: 'BTC 시총 / 전체 암호화폐 시총. 55% 이하 하락 = 알트시즌 신호.', zones: false },
            { id: 'nupl', name: 'NUPL', category: 'onchain', value: onChain ? onChain.nupl.toFixed(3) : '--', status: this.nuplStatus(onChain?.nupl), gauge: onChain ? Math.max(0, Math.min(100, (onChain.nupl + 0.2) / 1.2 * 100)) : 50, desc: '미실현 손익 비율. Capitulation(<0) = 매수, Euphoria(>0.75) = 매도.', zones: false },
            { id: 'mvrv', name: 'MVRV Ratio', category: 'onchain', value: onChain ? onChain.mvrv.toFixed(2) : '--', status: onChain && onChain.mvrv > 3.5 ? 'bearish' : onChain && onChain.mvrv < 1.0 ? 'bullish' : 'neutral', gauge: onChain ? Math.max(0, Math.min(100, onChain.mvrv / 4 * 100)) : 50, desc: '시장총액/실현총액. 3.5+ 과열, 1.0- 저평가.', zones: false },
            { id: 'mvrv-zscore', name: 'MVRV Z-Score', category: 'onchain', value: onChain ? onChain.mvrvZScore.toFixed(2) : '--', status: onChain && onChain.mvrvZScore > 3 ? 'bearish' : onChain && onChain.mvrvZScore < 0 ? 'bullish' : 'neutral', gauge: onChain ? Math.max(0, Math.min(100, (onChain.mvrvZScore + 2) / 6 * 100)) : 50, desc: 'MVRV의 Z-Score. >7 극도 과열, <0 극도 저평가.', zones: false },
            { id: 'sopr', name: 'SOPR', category: 'onchain', value: onChain ? onChain.sopr.toFixed(3) : '--', status: onChain && onChain.sopr > 1.05 ? 'bearish' : onChain && onChain.sopr < 0.995 ? 'bullish' : 'neutral', gauge: onChain ? Math.max(0, Math.min(100, (onChain.sopr - 0.95) / 0.15 * 100)) : 50, desc: '체인상 이동 코인 손익 비율. 1 이상 = 수익 매도, 1 미만 = 손절 매도.', zones: false },
            { id: 'exchange-reserves', name: 'Exchange Reserves', category: 'onchain', value: onChain ? `${(onChain.exchangeReserves / 1000000).toFixed(2)}M BTC` : '--', status: onChain && onChain.exchangeReserves < 2000000 ? 'bullish' : onChain && onChain.exchangeReserves > 2500000 ? 'bearish' : 'neutral', gauge: onChain ? Math.max(0, Math.min(100, (3000000 - onChain.exchangeReserves) / 1000000 * 100)) : 50, desc: '거래소 보유 BTC. 감소 = 축적(강세), 증가 = 매도 압력(약세).', zones: false },
            { id: 'funding-rate', name: 'Funding Rate', category: 'derivatives', value: onChain ? `${(onChain.fundingRate * 100).toFixed(3)}%` : '--', status: onChain && onChain.fundingRate > 0.03 ? 'bearish' : onChain && onChain.fundingRate < -0.01 ? 'bullish' : 'neutral', gauge: onChain ? Math.max(0, Math.min(100, (onChain.fundingRate + 0.03) / 0.08 * 100)) : 50, desc: '영구 스왑 롱/숏 비용. 양(+) = 롱 과다, 음(-) = 숏 과다.', zones: false },
            { id: 'open-interest', name: 'Open Interest', category: 'derivatives', value: onChain ? `$${onChain.openInterest.toFixed(1)}B` : '--', status: onChain && onChain.openInterest > 35 ? 'bearish' : 'neutral', gauge: onChain ? Math.max(0, Math.min(100, onChain.openInterest / 50 * 100)) : 50, desc: '미결제 약정 총액. 급증 + 가격 상승 = 강한 추세.', zones: false },
            { id: 'puell', name: 'Puell Multiple', category: 'onchain', value: onChain ? onChain.puellMultiple.toFixed(2) : '--', status: onChain && onChain.puellMultiple > 1.4 ? 'bearish' : onChain && onChain.puellMultiple < 0.5 ? 'bullish' : 'neutral', gauge: onChain ? Math.max(0, Math.min(100, onChain.puellMultiple / 2 * 100)) : 50, desc: '일일 채굴 수익 / 365일 평균. 1.4+ 과열, 0.5- 저평가.', zones: false },
            { id: 'mpi', name: 'Miner Position Index', category: 'onchain', value: onChain ? onChain.minerPositionIndex.toFixed(2) : '--', status: onChain && onChain.minerPositionIndex > 2.0 ? 'bearish' : onChain && onChain.minerPositionIndex < -0.5 ? 'bullish' : 'neutral', gauge: onChain ? Math.max(0, Math.min(100, (onChain.minerPositionIndex + 1) / 4 * 100)) : 50, desc: '채굴자 매도/보유 성향. -0.5 = 축적, 2.0+ = 대량 매도.', zones: false },
            { id: 'ssr', name: 'Stablecoin Supply Ratio', category: 'onchain', value: onChain ? onChain.ssr.toFixed(2) : '--', status: onChain && onChain.ssr < 1.0 ? 'bullish' : onChain && onChain.ssr > 3.0 ? 'bearish' : 'neutral', gauge: onChain ? Math.max(0, Math.min(100, (4 - onChain.ssr) / 4 * 100)) : 50, desc: 'BTC 시총 / 스테이블코인 공급. 낮을수록 매수력 증가.', zones: false }
        ];
        const filtered = filter === 'all' ? indicators : indicators.filter(i => i.category === filter);
        c.innerHTML = filtered.map(ind => `<div class="indicator-card" data-id="${ind.id}"><div class="indicator-header"><span class="indicator-name">${ind.name}</span><span class="indicator-category">${this.catLabel(ind.category)}</span></div><div class="indicator-value-row"><span class="indicator-value">${ind.value}</span><span class="indicator-status ${ind.status}">${this.statusLabel(ind.status)}</span></div><div class="indicator-gauge-container">${ind.zones ? `<div class="indicator-gauge zones"><div class="zone zone-extreme-fear ${ind.gauge < 20 ? 'active' : ''}"></div><div class="zone zone-fear ${ind.gauge >= 20 && ind.gauge < 40 ? 'active' : ''}"></div><div class="zone zone-neutral ${ind.gauge >= 40 && ind.gauge < 60 ? 'active' : ''}"></div><div class="zone zone-greed ${ind.gauge >= 60 && ind.gauge < 80 ? 'active' : ''}"></div><div class="zone zone-extreme-greed ${ind.gauge >= 80 ? 'active' : ''}"></div></div><div class="indicator-gauge-marker" style="left: ${ind.gauge}%"></div>` : `<div class="indicator-gauge" style="width: ${ind.gauge}%; background: ${this.statusColor(ind.status)}"></div>`}</div><div class="indicator-desc">${ind.desc}</div></div>`).join('');
    },

    renderSignals(data) {
        const c = document.getElementById('ai-signals-list');
        if (!c) return;
        const signals = State.signals;
        if (signals.length === 0) {
            c.innerHTML = `<div class="ai-signal-card neutral"><div class="ai-signal-header"><div class="ai-signal-type"><span class="signal-emoji">⏳</span><span>신호 생성 중</span></div></div><div class="ai-signal-details"><p style="color: var(--text-secondary); font-size: 0.9rem;">데이터를 수집하고 AI가 신호를 분석 중입니다. 잠시만 기다려 주세요.</p></div></div>`;
            return;
        }
        c.innerHTML = signals.map(s => `<div class="ai-signal-card ${s.type}"><div class="ai-signal-header"><div class="ai-signal-type"><span class="signal-emoji">${s.type === 'buy' ? '🟢' : s.type === 'sell' ? '🔴' : '🟡'}</span><span>${s.type === 'buy' ? '매수' : s.type === 'sell' ? '매도' : '관망'} — ${s.asset}</span></div><div class="ai-signal-confidence">신뢰도 ${s.confidence}%</div></div><div class="ai-signal-details"><div class="ai-signal-regime">[시장 국면] ${s.regime}</div><div class="ai-signal-indicators">${s.indicators.map(ind => `<div class="ai-indicator-match"><span class="check">${ind.match ? '✓' : '○'}</span><span>${ind.name}: ${ind.value}</span></div>`).join('')}</div></div><div class="ai-signal-action"><strong>💡 제안:</strong> ${s.action}</div></div>`).join('');
        this.renderSignalHistory();
    },

    renderSignalHistory() {
        const c = document.getElementById('history-list');
        if (!c) return;
        const history = State.history.slice(0, 5);
        if (history.length === 0) { c.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 1rem;">아직 신호 기록이 없습니다.</p>'; return; }
        c.innerHTML = history.map(h => `<div class="history-item"><div><span style="font-weight: 600;">${h.type === 'buy' ? '🟢 매수' : h.type === 'sell' ? '🔴 매도' : '🟡 관망'}</span><span style="color: var(--text-muted); font-size: 0.8rem;"> — ${h.asset}</span></div><div><span class="history-result ${h.result === 'success' ? 'success' : h.result === 'fail' ? 'fail' : ''}">${h.result === 'success' ? '✓ 적중' : h.result === 'fail' ? '✗ 미적중' : '⏳ 대기'}</span><span style="color: var(--text-muted); font-size: 0.75rem;">${new Date(h.timestamp).toLocaleDateString('ko-KR')}</span></div></div>`).join('');
    },

    renderAlerts() {
        const c = document.getElementById('alerts-config');
        if (!c) return;
        const configs = [
            { category: '📊 지표 기반 알림', icon: '📊', items: [{ id: 'nupl-euphoria', label: 'NUPL > 0.75 (Euphoria 진입)' }, { id: 'nupl-capitulation', label: 'NUPL < 0 (Capitulation 진입)' }, { id: 'mvrv-zscore-high', label: 'MVRV Z-Score > +3 (과열)' }, { id: 'mvrv-zscore-low', label: 'MVRV Z-Score < -2 (저평가)' }, { id: 'hash-ribbons', label: 'Hash Ribbons 매수 신호 발생' }, { id: 'exchange-low', label: 'Exchange Reserves 30일 최저치' }] },
            { category: '🐋 고래/기관 알림', icon: '🐋', items: [{ id: 'whale-move', label: '1,000+ BTC 이동 감지' }, { id: 'microstrategy', label: 'MicroStrategy 지갑 활동' }, { id: 'etf-flow', label: 'ETF 일간 순유입/유출 $100M+' }] },
            { category: '📈 가격/기술적 알림', icon: '📈', items: [{ id: 'btc-support', label: 'BTC $90,000 지지선 이탈' }, { id: 'rsi-oversold', label: 'RSI 14일 < 20 (과매도)' }, { id: 'rsi-overbought', label: 'RSI 14일 > 80 (과매수)' }, { id: 'funding-extreme', label: 'Funding Rate 극단값 3일+' }] }
        ];
        c.innerHTML = configs.map(g => `<div class="alert-config-group"><h4>${g.icon} ${g.category.replace(/^[^\s]+\s/, '')}</h4>${g.items.map(item => `<div class="alert-config-item"><span>${item.label}</span><label class="toggle"><input type="checkbox" data-alert-id="${item.id}" ${State.alerts[item.id] ? 'checked' : ''}><span class="toggle-slider"></span></label></div>`).join('')}</div>`).join('');
    },

    renderPortfolio() {
        const assets = State.portfolio;
        const c = document.getElementById('portfolio-assets');
        if (!c) return;
        if (assets.length === 0) {
            c.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--text-muted);"><div style="font-size: 3rem; margin-bottom: 0.5rem;">💼</div><p>아직 보유 자산이 없습니다.</p><p style="font-size: 0.85rem; margin-top: 0.5rem;">+ 자산 추가 버튼을 눌러 포트폴리오를 구성하세요.</p></div>`;
            const tv = document.getElementById('total-value');
            const c24 = document.getElementById('change-24h');
            if (tv) tv.textContent = '$0.00';
            if (c24) { c24.textContent = '0.00%'; c24.className = 'change-24h'; }
            return;
        }
        let totalValue = 0, totalCost = 0;
        c.innerHTML = assets.map(asset => {
            const coin = CONFIG.coins[asset.coin];
            const currentPrice = State.data.prices?.[this.cgId(asset.coin)]?.usd || asset.price;
            const value = asset.amount * currentPrice;
            const cost = asset.amount * asset.price;
            const pnl = value - cost;
            const pnlPct = ((currentPrice - asset.price) / asset.price) * 100;
            totalValue += value; totalCost += cost;
            return `<div class="asset-item"><div class="asset-icon" style="background: ${coin?.color || '#333'}20; color: ${coin?.color || '#fff'}">${coin?.icon || '?'}</div><div class="asset-info"><div class="asset-name">${coin?.name || asset.coin} (${asset.coin})</div><div class="asset-amount">${asset.amount.toFixed(4)} @ $${asset.price.toLocaleString()}</div></div><div class="asset-price-info"><div class="asset-current-price">$${value.toLocaleString(undefined, {maximumFractionDigits: 0})}</div><div class="asset-pnl ${pnl >= 0 ? 'profit' : 'loss'}">${pnl >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%</div></div></div>`;
        }).join('');
        const totalPnl = totalValue - totalCost;
        const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
        const tv = document.getElementById('total-value');
        const c24 = document.getElementById('change-24h');
        if (tv) tv.textContent = `$${totalValue.toLocaleString(undefined, {maximumFractionDigits: 0})}`;
        if (c24) { c24.textContent = `${totalPnl >= 0 ? '+' : ''}${totalPnlPct.toFixed(2)}%`; c24.className = `change-24h ${totalPnl >= 0 ? 'up' : 'down'}`; }
        this.updatePortfolioRec(assets, totalValue);
    },

    updatePortfolioRec(assets, totalValue) {
        const recText = document.getElementById('recommendation-text');
        if (!recText) return;
        const btcD = State.data.global?.market_cap_percentage?.btc || 55;
        const altSeasonIndex = Math.max(0, Math.min(100, 100 - (btcD - 40) * 4));
        const btcAsset = assets.find(a => a.coin === 'BTC');
        const btcValue = btcAsset ? btcAsset.amount * (State.data.prices?.bitcoin?.usd || 95000) : 0;
        const btcWeight = totalValue > 0 ? (btcValue / totalValue) * 100 : 0;
        if (altSeasonIndex > 75 && btcWeight > 60) recText.innerHTML = `<strong>알트코인 시즌 진행 중</strong>입니다. 현재 BTC 비중이 ${btcWeight.toFixed(0)}%로 높습니다. 일부 BTC 수익을 ETH, SOL 등 알트코인으로 전환하여 시즌 수익을 극대화하는 것을 고려해 보세요.`;
        else if (altSeasonIndex < 25 && btcWeight < 40) recText.innerHTML = `<strong>비트코인 시즌 진행 중</strong>입니다. 현재 알트코인 비중이 높습니다. BTC Dominance 상승이 예상되므로 일부 알트코인을 BTC로 전환하여 리스크를 관리하는 것을 권장합니다.`;
        else recText.innerHTML = `현재 포트폴리오 비중이 시장 국면과 <strong>적절히 조화</strong>되어 있습니다. 핵심 포지션을 유지하되, NUPL 및 MVRV 지표 변화를 주시하세요.`;
    },

    cgId(coin) { const m = {BTC:'bitcoin',ETH:'ethereum',SOL:'solana',XRP:'ripple',ADA:'cardano',DOGE:'dogecoin',DOT:'polkadot',AVAX:'avalanche-2',LINK:'chainlink',MATIC:'matic-network'}; return m[coin] || coin.toLowerCase(); },
    fgColor(v) { if (v <= 20) return '#ef4444'; if (v <= 40) return '#f97316'; if (v <= 60) return '#eab308'; if (v <= 80) return '#22c55e'; return '#10b981'; },
    fgStatus(v) { if (!v) return 'neutral'; if (v <= 20) return 'bullish'; if (v >= 75) return 'bearish'; return 'neutral'; },
    nuplZone(v) { if (v < 0) return 'Capitulation'; if (v < 0.25) return 'Hope'; if (v < 0.5) return 'Optimism'; if (v < 0.75) return 'Belief'; return 'Euphoria'; },
    nuplColor(v) { if (v < 0) return '#ef4444'; if (v < 0.25) return '#f97316'; if (v < 0.5) return '#eab308'; if (v < 0.75) return '#22c55e'; return '#10b981'; },
    nuplStatus(v) { if (!v && v !== 0) return 'neutral'; if (v < 0) return 'bullish'; if (v > 0.75) return 'bearish'; return 'neutral'; },
    catLabel(c) { const l = {sentiment:'심리',onchain:'온체인',derivatives:'파생',institutional:'기관'}; return l[c] || c; },
    statusLabel(s) { const l = {bullish:'강세',bearish:'약세',neutral:'중립'}; return l[s] || s; },
    statusColor(s) { const c = {bullish:'#22c55e',bearish:'#ef4444',neutral:'#eab308'}; return c[s] || '#8b8ba0'; },
    showToast(msg, type = 'info') {
        const c = document.getElementById('toast-container');
        if (!c) return;
        const icons = {info:'ℹ️',success:'✅',warning:'⚠️',error:'❌'};
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span class="toast-message">${msg}</span><button class="toast-close" onclick="this.parentElement.remove()">✕</button>`;
        c.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }
};

const Events = {
    init() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => { this.switchTab(e.currentTarget.dataset.tab); });
        });
        document.querySelectorAll('.cat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                UI.renderIndicators(State.data, e.target.dataset.cat);
            });
        });
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) settingsBtn.addEventListener('click', () => document.getElementById('settings-modal').classList.remove('hidden'));
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => e.target.closest('.modal').classList.add('hidden'));
        });
        const dmToggle = document.getElementById('dark-mode-toggle');
        if (dmToggle) { dmToggle.checked = State.settings.darkMode; dmToggle.addEventListener('change', (e) => State.save('settings', {...State.settings, darkMode: e.target.checked})); }
        const notifToggle = document.getElementById('notifications-toggle');
        if (notifToggle) { notifToggle.checked = State.settings.notifications; notifToggle.addEventListener('change', (e) => { State.save('settings', {...State.settings, notifications: e.target.checked}); if (e.target.checked) this.reqNotif(); }); }
        const refreshSel = document.getElementById('refresh-interval');
        if (refreshSel) { refreshSel.value = State.settings.refreshInterval; refreshSel.addEventListener('change', (e) => { State.save('settings', {...State.settings, refreshInterval: parseInt(e.target.value)}); App.updateRefreshInterval(); }); }
        const currSel = document.getElementById('currency-unit');
        if (currSel) { currSel.value = State.settings.currency; currSel.addEventListener('change', (e) => State.save('settings', {...State.settings, currency: e.target.value})); }
        const clearBtn = document.getElementById('clear-data-btn');
        if (clearBtn) clearBtn.addEventListener('click', () => { if (confirm('모든 데이터를 초기화하시겠습니까?')) { localStorage.clear(); location.reload(); } });
        const exportBtn = document.getElementById('export-data-btn');
        if (exportBtn) exportBtn.addEventListener('click', () => {
            const data = { portfolio: State.portfolio, settings: State.settings, history: State.history, exportedAt: new Date().toISOString() };
            const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `cryptosignal-backup-${new Date().toISOString().split('T')[0]}.json`; a.click(); URL.revokeObjectURL(url);
            UI.showToast('데이터를 내보냈습니다.', 'success');
        });
        const addAssetBtn = document.getElementById('add-asset-btn');
        if (addAssetBtn) addAssetBtn.addEventListener('click', () => document.getElementById('add-asset-modal').classList.remove('hidden'));
        const saveAssetBtn = document.getElementById('save-asset-btn');
        if (saveAssetBtn) saveAssetBtn.addEventListener('click', () => {
            const coin = document.getElementById('asset-coin').value;
            const amount = parseFloat(document.getElementById('asset-amount').value);
            const price = parseFloat(document.getElementById('asset-price').value);
            if (!amount || !price || amount <= 0 || price <= 0) { UI.showToast('올바른 값을 입력해주세요.', 'error'); return; }
            const existing = State.portfolio.find(a => a.coin === coin);
            if (existing) { const totalAmount = existing.amount + amount; const totalCost = (existing.amount * existing.price) + (amount * price); existing.amount = totalAmount; existing.price = totalCost / totalAmount; }
            else State.portfolio.push({coin, amount, price, addedAt: Date.now()});
            State.save('portfolio', State.portfolio); UI.renderPortfolio();
            document.getElementById('add-asset-modal').classList.add('hidden');
            document.getElementById('asset-amount').value = ''; document.getElementById('asset-price').value = '';
            UI.showToast(`${CONFIG.coins[coin]?.name || coin} 추가 완료!`, 'success');
        });
        const alertsConfig = document.getElementById('alerts-config');
        if (alertsConfig) alertsConfig.addEventListener('change', (e) => { if (e.target.type === 'checkbox' && e.target.dataset.alertId) { State.alerts[e.target.dataset.alertId] = e.target.checked; State.save('alerts', State.alerts); } });
        const installClose = document.getElementById('install-close');
        if (installClose) installClose.addEventListener('click', () => document.getElementById('install-prompt').classList.add('hidden'));
        document.querySelectorAll('.modal').forEach(modal => modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); }));
    },
    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabName));
        document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.toggle('active', panel.id === tabName));
        if (tabName === 'indicators') UI.renderIndicators(State.data, 'all');
        else if (tabName === 'signals') UI.renderSignals(State.data);
        else if (tabName === 'alerts') UI.renderAlerts();
        else if (tabName === 'portfolio') UI.renderPortfolio();
    },
    async reqNotif() { if ('Notification' in window) { const p = await Notification.requestPermission(); if (p === 'granted') UI.showToast('푸시 알림이 활성화되었습니다!', 'success'); } }
};

const App = {
    refreshTimer: null,
    async init() {
        this.updateLoading('데이터 소스 연결 중...');
        await this.refreshData();
        this.updateLoading('AI 신호 엔진 초기화 중...');
        State.signals = SignalEngine.generateSignals(State.data);
        this.updateLoading('UI 렌더링 중...');
        UI.renderDashboard(State.data);
        Events.init();
        setTimeout(() => {
            const ls = document.getElementById('loading-screen');
            const app = document.getElementById('app');
            if (ls) ls.classList.add('hidden');
            if (app) app.classList.remove('hidden');
            setTimeout(() => {
                if (!window.matchMedia('(display-mode: standalone)').matches && !localStorage.getItem('cs_install_dismissed')) {
                    const prompt = document.getElementById('install-prompt');
                    if (prompt) prompt.classList.remove('hidden');
                }
            }, 3000);
        }, 2500);
        this.updateRefreshInterval();
        window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); window.deferredPrompt = e; });
        const installBtn = document.getElementById('install-btn');
        if (installBtn) installBtn.addEventListener('click', async () => {
            if (window.deferredPrompt) { window.deferredPrompt.prompt(); const {outcome} = await window.deferredPrompt.userChoice; if (outcome === 'accepted') UI.showToast('CryptoSignal이 설치되었습니다!', 'success'); window.deferredPrompt = null; }
            document.getElementById('install-prompt').classList.add('hidden');
            localStorage.setItem('cs_install_dismissed', 'true');
        });
    },
    updateLoading(text) { const el = document.getElementById('loading-status'); if (el) el.textContent = text; },
    async refreshData() {
        try {
            const [fearGreed, prices, global] = await Promise.all([DataFetcher.getFearGreed(), DataFetcher.getCoinPrices(), DataFetcher.getGlobalData()]);
            const onChain = DataFetcher.getSimulatedOnChainMetrics();
            const etf = DataFetcher.getSimulatedETFFlows();
            State.data = { fearGreed, prices, global, onChain, etf };
            const statusEl = document.getElementById('connection-status');
            if (statusEl) { statusEl.querySelector('.status-dot').classList.add('online'); statusEl.querySelector('.status-text').textContent = '실시간'; }
            State.signals = SignalEngine.generateSignals(State.data);
            const activeTab = document.querySelector('.tab-panel.active');
            if (activeTab) {
                if (activeTab.id === 'dashboard') UI.renderDashboard(State.data);
                else if (activeTab.id === 'indicators') { const activeCat = document.querySelector('.cat-btn.active')?.dataset.cat || 'all'; UI.renderIndicators(State.data, activeCat); }
                else if (activeTab.id === 'signals') UI.renderSignals(State.data);
                else if (activeTab.id === 'portfolio') UI.renderPortfolio();
            }
            this.checkAlerts();
        } catch (error) {
            console.error('Refresh error:', error);
            const statusEl = document.getElementById('connection-status');
            if (statusEl) { statusEl.querySelector('.status-dot').classList.remove('online'); statusEl.querySelector('.status-text').textContent = '오프라인'; }
        }
    },
    updateRefreshInterval() { if (this.refreshTimer) clearInterval(this.refreshTimer); const interval = (State.settings.refreshInterval || 60) * 1000; this.refreshTimer = setInterval(() => this.refreshData(), interval); },
    checkAlerts() {
        const { fearGreed, onChain } = State.data;
        if (!fearGreed || !onChain) return;
        const alerts = State.alerts; let triggered = 0;
        if (alerts['nupl-euphoria'] && onChain.nupl > 0.75) triggered++;
        if (alerts['nupl-capitulation'] && onChain.nupl < 0) triggered++;
        if (alerts['mvrv-zscore-high'] && onChain.mvrvZScore > 3) triggered++;
        if (alerts['mvrv-zscore-low'] && onChain.mvrvZScore < -2) triggered++;
        if (alerts['funding-extreme'] && Math.abs(onChain.fundingRate) > 0.03) triggered++;
        if (triggered > 0) {
            const badge = document.getElementById('alert-badge');
            if (badge) { badge.textContent = triggered; badge.classList.remove('hidden'); }
            if (State.settings.notifications && 'Notification' in window && Notification.permission === 'granted') {
                new Notification('CryptoSignal 알림', { body: `${triggered}개의 알림 조건이 충족되었습니다.`, icon: 'assets/icon-192.png' });
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => { App.init(); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) App.refreshData(); });
