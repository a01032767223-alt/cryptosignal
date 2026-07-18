
// ============================================
// UI RENDERERS
// ============================================
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
        if (tabName === 'signals') UI.renderSignals();
        if (tabName === 'alerts') UI.renderAlerts();
    },

    renderDashboard() {
        const data = AppState.data;
        const lastUpdate = document.getElementById('last-update');
        if (lastUpdate && data.lastUpdate) {
            lastUpdate.textContent = `Updated: ${Utils.formatTime(data.lastUpdate)}`;
        }
        const sourceBar = document.getElementById('data-source-bar');
        if (sourceBar) {
            sourceBar.innerHTML = `
                <span class="data-source-tag live">Live API</span>
                <span class="data-source-tag sim">Simulation</span>
            `;
        }
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
        const metricsGrid = document.getElementById('metrics-grid');
        if (metricsGrid) {
            const btcPrice = data.prices['bitcoin']?.current_price || 0;
            const btcChange = data.prices['bitcoin']?.price_change_percentage_24h || 0;
            const ethPrice = data.prices['ethereum']?.current_price || 0;
            const ethChange = data.prices['ethereum']?.price_change_percentage_24h || 0;
            metricsGrid.innerHTML = `
                <div class="metric-card">
                    <div class="metric-label">BTC Dominance</div>
                    <div class="metric-value" style="color: var(--accent-blue)">${data.btcDominance?.toFixed(1) || '--'}%</div>
                    <div class="metric-change ${data.btcDominance && data.btcDominance < 50 ? 'down' : 'up'}">
                        ${data.btcDominance && data.btcDominance < 50 ? 'Alt Season' : 'BTC Season'}
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Altcoin Season</div>
                    <div class="metric-value" style="color: var(--accent-purple)">${data.altSeasonIndex || '--'}</div>
                    <div class="metric-change ${(data.altSeasonIndex || 0) > 60 ? 'up' : 'down'}">
                        ${(data.altSeasonIndex || 0) > 60 ? 'Alt Season' : 'Wait'}
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Fear & Greed</div>
                    <div class="metric-value" style="color: ${(data.fearGreed?.value || 50) > 75 ? 'var(--accent-red)' : (data.fearGreed?.value || 50) < 25 ? 'var(--accent-green)' : 'var(--accent-orange)'}">
                        ${data.fearGreed?.value || '--'}
                    </div>
                    <div class="metric-change ${(data.fearGreed?.value || 50) < 25 ? 'up' : (data.fearGreed?.value || 50) > 75 ? 'down' : 'neutral'}">
                        ${data.fearGreed?.value_classification || 'Neutral'}
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">BTC Price</div>
                    <div class="metric-value" style="color: ${btcChange >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'}">
                        ${Utils.formatPrice(btcPrice)}
                    </div>
                    <div class="metric-change ${btcChange >= 0 ? 'up' : 'down'}">
                        ${Utils.formatPercentage(btcChange)}
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">ETH Price</div>
                    <div class="metric-value" style="color: ${ethChange >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'}">
                        ${Utils.formatPrice(ethPrice)}
                    </div>
                    <div class="metric-change ${ethChange >= 0 ? 'up' : 'down'}">
                        ${Utils.formatPercentage(ethChange)}
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Market Cap</div>
                    <div class="metric-value" style="color: var(--text-primary)">
                        $${Utils.formatNumber(data.global?.total_market_cap?.usd || 0, 0)}
                    </div>
                    <div class="metric-change ${(data.global?.market_cap_change_percentage_24h_usd || 0) >= 0 ? 'up' : 'down'}">
                        ${Utils.formatPercentage(data.global?.market_cap_change_percentage_24h_usd || 0)}
                    </div>
                </div>
            `;
        }
        const regimeCard = document.getElementById('regime-card');
        if (regimeCard && data.regime) {
            document.getElementById('regime-name').textContent = data.regime.name;
            document.getElementById('regime-desc').textContent = data.regime.desc;
            document.getElementById('regime-confidence').textContent = data.regime.confidence + '%';
            regimeCard.querySelector('.regime-icon').textContent = data.regime.icon;
        }
        const alertsList = document.getElementById('recent-alerts-list');
        if (alertsList && data.signals) {
            const recentSignals = data.signals.slice(0, 4);
            alertsList.innerHTML = recentSignals.map(signal => {
                const type = signal.type.includes('buy') ? 'bullish' : signal.type.includes('sell') ? 'bearish' : 'neutral';
                const icon = type === 'bullish' ? '\uD83D\uDE80' : type === 'bearish' ? '\u26A0\uFE0F' : '\u2139\uFE0F';
                return `
                    <div class="alert-item ${type}">
                        <div class="alert-icon">${icon}</div>
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

    renderIndicators() {
        const list = document.getElementById('indicators-list');
        if (!list) return;
        const onChain = IndicatorEngine.getSimulatedOnChainIndicators();
        const technical = IndicatorEngine.getSimulatedTechnicalIndicators();
        const allIndicators = [
            { ...onChain.nupl, name: 'NUPL', category: 'onchain', value: onChain.nupl.value.toFixed(3) },
            { ...onChain.mvrv, name: 'MVRV Z-Score', category: 'onchain', value: onChain.mvrv.zScore.toFixed(2) },
            { ...onChain.sopr, name: 'SOPR', category: 'onchain', value: onChain.sopr.value.toFixed(3) },
            { ...onChain.exchangeReserves, name: 'Exchange Reserves', category: 'onchain', value: Utils.formatNumber(onChain.exchangeReserves.value) + ' BTC', change: onChain.exchangeReserves.change24h },
            { ...onChain.fundingRate, name: 'Funding Rate', category: 'derivatives', value: (onChain.fundingRate.value * 100).toFixed(3) + '%' },
            { ...onChain.openInterest, name: 'Open Interest', category: 'derivatives', value: '$' + Utils.formatNumber(onChain.openInterest.value) + 'B', change: onChain.openInterest.change24h },
            { ...onChain.puellMultiple, name: 'Puell Multiple', category: 'onchain', value: onChain.puellMultiple.value.toFixed(2) },
            { ...onChain.minerPosition, name: 'Miner Position Index', category: 'onchain', value: onChain.minerPosition.value.toFixed(2) },
            { ...onChain.ssr, name: 'SSR', category: 'onchain', value: onChain.ssr.value.toFixed(1) },
            { ...technical.rsi, name: 'RSI (14)', category: 'sentiment', value: technical.rsi.value.toFixed(1) },
            { ...technical.macd, name: 'MACD', category: 'sentiment', value: technical.macd.value.toFixed(3) },
            { ...technical.bollinger, name: 'Bollinger Bands', category: 'sentiment', value: technical.bollinger.position.toFixed(1) + '%' },
            { ...technical.mayerMultiple, name: 'Mayer Multiple', category: 'sentiment', value: technical.mayerMultiple.value.toFixed(2) },
            { name: 'Fear & Greed', category: 'sentiment', value: AppState.data.fearGreed?.value || '--', signal: AppState.data.fearGreed?.value > 75 ? 'bearish' : AppState.data.fearGreed?.value < 25 ? 'bullish' : 'neutral', description: 'Market sentiment indicator' },
            { name: 'BTC Dominance', category: 'sentiment', value: (AppState.data.btcDominance || 0).toFixed(1) + '%', signal: (AppState.data.btcDominance || 50) < 48 ? 'bullish' : (AppState.data.btcDominance || 50) > 60 ? 'bearish' : 'neutral', description: 'Bitcoin market share' }
        ];
        list.innerHTML = allIndicators.map(ind => {
            const signalClass = ind.signal || 'neutral';
            const signalText = signalClass === 'bullish' ? 'Buy Signal' : signalClass === 'bearish' ? 'Sell Signal' : 'Neutral';
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
                        ${signalClass === 'bullish' ? '\uD83D\uDFE2' : signalClass === 'bearish' ? '\uD83D\uDD34' : '\u26AA'} ${signalText}
                    </div>
                </div>
            `;
        }).join('');
    },

    renderSignals() {
        const list = document.getElementById('ai-signals-list');
        if (!list || !AppState.data.signals) return;
        list.innerHTML = AppState.data.signals.map(signal => `
            <div class="ai-signal-card ${signal.type}">
                <div class="ai-signal-header">
                    <span class="ai-signal-type">
                        ${signal.type.includes('buy') ? '\uD83D\uDFE2' : signal.type.includes('sell') ? '\uD83D\uDD34' : '\u26AA'}
                        ${signal.title}
                    </span>
                    <span class="ai-signal-confidence ${signal.confidence >= 80 ? 'high' : signal.confidence >= 60 ? 'medium' : 'low'}">
                        Confidence ${signal.confidence}%
                    </span>
                </div>
                <div class="ai-signal-reason">${signal.description}</div>
                <div class="ai-signal-indicators">
                    ${signal.indicators.map(ind => `<span class="ai-signal-indicator-tag">${ind}</span>`).join('')}
                </div>
            </div>
        `).join('');
        const historyList = document.getElementById('history-list');
        if (historyList) {
            const history = Storage.get(CONFIG.STORAGE.HISTORY) || [
                { date: '2026-07-15', signal: 'strong-buy', result: 'hit', desc: 'NUPL Capitulation' },
                { date: '2026-07-10', signal: 'buy', result: 'hit', desc: 'Hash Ribbons Buy' },
                { date: '2026-07-05', signal: 'sell', result: 'miss', desc: 'Fear & Greed 78' },
                { date: '2026-06-28', signal: 'strong-buy', result: 'hit', desc: 'MVRV Z-Score -2.1' }
            ];
            historyList.innerHTML = history.map(h => `
                <div class="history-item">
                    <div class="history-signal">
                        <span class="signal-dot ${h.signal}"></span>
                        <span>${h.desc}</span>
                    </div>
                    <span class="history-date">${h.date}</span>
                    <span class="history-result ${h.result}">${h.result === 'hit' ? '\u2705 Hit' : '\u274C Miss'}</span>
                </div>
            `).join('');
        }
    },

    renderAlerts() {
        const config = document.getElementById('alerts-config');
        if (!config) return;
        const alertConfigs = [
            { id: 'nupl', name: 'NUPL', icon: '\uD83D\uDCCA', desc: 'Unrealized profit/loss extremes', thresholds: [
                { label: 'Capitulation', value: '< 0' },
                { label: 'Euphoria', value: '> 0.75' }
            ]},
            { id: 'mvrv', name: 'MVRV Z-Score', icon: '\uD83D\uDCC8', desc: 'Market value/realized value Z-Score', thresholds: [
                { label: 'Deep Value', value: '< -2' },
                { label: 'Overvalued', value: '> +3' }
            ]},
            { id: 'fng', name: 'Fear & Greed', icon: '\uD83D\uDE28', desc: 'Fear and greed index', thresholds: [
                { label: 'Extreme Fear', value: '< 20' },
                { label: 'Extreme Greed', value: '> 80' }
            ]},
            { id: 'funding', name: 'Funding Rate', icon: '\uD83D\uDCB8', desc: 'Perpetual swap funding rate', thresholds: [
                { label: 'Short Squeeze', value: '< -0.1%' },
                { label: 'Long Squeeze', value: '> +0.1%' }
            ]},
            { id: 'dominance', name: 'BTC Dominance', icon: '\u20BF', desc: 'Bitcoin dominance', thresholds: [
                { label: 'Alt Season', value: '< 48%' },
                { label: 'BTC Season', value: '> 60%' }
            ]}
        ];
        config.innerHTML = alertConfigs.map(alert => `
            <div class="alert-config-card">
                <div class="alert-config-header">
                    <span class="alert-config-title">${alert.icon} ${alert.name}</span>
                    <label class="toggle">
                        <input type="checkbox" ${AppState.alerts.includes(alert.id) ? 'checked' : ''} onchange="App.toggleAlert('${alert.id}')">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="alert-config-desc">${alert.desc}</div>
                <div class="alert-thresholds">
                    ${alert.thresholds.map(t => `
                        <div class="alert-threshold">
                            <span class="threshold-label">${t.label}</span>
                            <span class="threshold-value">${t.value}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    },

    renderPortfolio() {
        const assetsContainer = document.getElementById('portfolio-assets');
        const summary = document.getElementById('portfolio-summary');
        if (!assetsContainer) return;
        if (AppState.portfolio.length === 0) {
            assetsContainer.innerHTML = `
                <div style="text-align: center; padding: 3rem 1rem; color: var(--text-secondary);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">\uD83D\uDCBC</div>
                    <p>Portfolio is empty.</p>
                    <p style="font-size: 0.875rem; margin-top: 0.5rem;">Click "+ Add Asset" to register your holdings.</p>
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
            const currentPrice = coinData.current_price || asset.price;
            const currentValue = asset.amount * currentPrice;
            const costBasis = asset.amount * asset.avgPrice;
            const pnl = currentValue - costBasis;
            const pnlPercent = ((currentPrice - asset.avgPrice) / asset.avgPrice) * 100;
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
                capitulation: 'Market is in panic. Consider buying in batches. Keep 30% cash.',
                hope: 'Bottoming out, recovery signs. Start gradual buying. Focus on BTC/ETH.',
                neutral: 'Direction unclear. Maintain current allocation and wait.',
                optimism: 'Uptrend. Focus on holding existing positions rather than chasing.',
                euphoria: 'Market overheated. Consider taking profits and increasing cash.'
            };
            recText.textContent = recs[regime] || recs.neutral;
        }
    },

    renderHeatmap() {
        let heatmapSection = document.querySelector('.heatmap-section');
        if (!heatmapSection) {
            const dashboard = document.getElementById('dashboard');
            if (dashboard) {
                heatmapSection = document.createElement('div');
                heatmapSection.className = 'heatmap-section';
                heatmapSection.innerHTML = `
                    <h3>\uD83D\uDD25 Altcoin 24h Change</h3>
                    <div class="heatmap-grid" id="heatmap-grid"></div>
                `;
                dashboard.appendChild(heatmapSection);
            }
        }
        const grid = document.getElementById('heatmap-grid');
        if (!grid) return;
        const altData = AppState.data.altPrices || [];
        grid.innerHTML = altData.map(coin => {
            const change = coin.price_change_percentage_24h || 0;
            const color = Utils.getColorForChange(change);
            const textColor = Math.abs(change) > 5 ? 'white' : '#1e293b';
            return `
                <div class="heatmap-cell" style="background: ${color}; color: ${textColor}" 
                     title="${coin.name}: ${change > 0 ? '+' : ''}${change.toFixed(2)}%">
                    <span class="heatmap-symbol">${coin.symbol.toUpperCase()}</span>
                    <span class="heatmap-change">${change > 0 ? '+' : ''}${change.toFixed(1)}%</span>
                </div>
            `;
        }).join('');
    },

    showToast(title, message, type = 'info', duration = 4000) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const icons = {
            info: '\u2139\uFE0F',
            success: '\u2705',
            warning: '\u26A0\uFE0F',
            error: '\u274C'
        };
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <div class="toast-content">
                <span class="toast-title">${title}</span>
                <span class="toast-message">${message}</span>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">\u2715</button>
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
                text.textContent = 'Live';
            } else {
                dot.classList.remove('online');
                dot.classList.add('offline');
                text.textContent = 'Offline';
            }
        }
    }
};

// ============================================
// APP CONTROLLER
// ============================================
const App = {
    async init() {
        Storage.loadAll();
        App.applySettings();
        App.setupEventListeners();
        await App.refreshData();
        setTimeout(() => {
            UI.hideLoadingScreen();
            UI.showToast('CryptoSignal', 'Real-time data connected', 'success');
        }, 1500);
        App.setupAutoRefresh();
        window.addEventListener('online', () => UI.updateConnectionStatus(true));
        window.addEventListener('offline', () => UI.updateConnectionStatus(false));
        App.setupPWA();
    },

    applySettings() {
        const settings = AppState.settings;
        const darkToggle = document.getElementById('dark-mode-toggle');
        if (darkToggle) darkToggle.checked = settings.darkMode;
        const notifToggle = document.getElementById('notifications-toggle');
        if (notifToggle) notifToggle.checked = settings.notifications;
        const refreshSelect = document.getElementById('refresh-interval');
        if (refreshSelect) refreshSelect.value = settings.refreshInterval;
        const currencySelect = document.getElementById('currency-unit');
        if (currencySelect) currencySelect.value = settings.currency;
    },

    setupEventListeners() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => UI.switchTab(btn.dataset.tab));
        });
        const settingsBtn = document.getElementById('settings-btn');
        const settingsModal = document.getElementById('settings-modal');
        if (settingsBtn && settingsModal) {
            settingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
            settingsModal.querySelector('.modal-close').addEventListener('click', () => settingsModal.classList.add('hidden'));
            settingsModal.addEventListener('click', (e) => {
                if (e.target === settingsModal) settingsModal.classList.add('hidden');
            });
        }
        const addAssetBtn = document.getElementById('add-asset-btn');
        const addAssetModal = document.getElementById('add-asset-modal');
        if (addAssetBtn && addAssetModal) {
            addAssetBtn.addEventListener('click', () => addAssetModal.classList.remove('hidden'));
            addAssetModal.querySelector('.modal-close').addEventListener('click', () => addAssetModal.classList.add('hidden'));
            addAssetModal.addEventListener('click', (e) => {
                if (e.target === addAssetModal) addAssetModal.classList.add('hidden');
            });
        }
        const saveAssetBtn = document.getElementById('save-asset-btn');
        if (saveAssetBtn) {
            saveAssetBtn.addEventListener('click', App.saveAsset);
        }
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('change', (e) => {
                AppState.settings.darkMode = e.target.checked;
                Storage.saveSettings();
            });
        }
        const notifToggle = document.getElementById('notifications-toggle');
        if (notifToggle) {
            notifToggle.addEventListener('change', (e) => {
                AppState.settings.notifications = e.target.checked;
                Storage.saveSettings();
                if (e.target.checked) App.requestNotificationPermission();
            });
        }
        const refreshSelect = document.getElementById('refresh-interval');
        if (refreshSelect) {
            refreshSelect.addEventListener('change', (e) => {
                AppState.settings.refreshInterval = parseInt(e.target.value);
                Storage.saveSettings();
                App.setupAutoRefresh();
            });
        }
        const currencySelect = document.getElementById('currency-unit');
        if (currencySelect) {
            currencySelect.addEventListener('change', (e) => {
                AppState.settings.currency = e.target.value;
                Storage.saveSettings();
                App.refreshData();
            });
        }
        const clearBtn = document.getElementById('clear-data-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('Clear all data?')) {
                    localStorage.clear();
                    AppState.portfolio = [];
                    AppState.alerts = [];
                    UI.showToast('Done', 'All data cleared', 'success');
                    UI.renderPortfolio();
                }
            });
        }
        const exportBtn = document.getElementById('export-data-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', App.exportData);
        }
        document.querySelectorAll('.cat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const category = btn.dataset.cat;
                document.querySelectorAll('.indicator-card').forEach(card => {
                    if (category === 'all' || card.dataset.category === category) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
        const refreshFab = document.getElementById('refresh-fab');
        if (refreshFab) {
            refreshFab.addEventListener('click', App.refreshData);
        }
    },

    async refreshData() {
        const refreshBtn = document.getElementById('refresh-fab') || document.getElementById('refreshBtn');
        if (refreshBtn) refreshBtn.classList.add('spinning');
        try {
            const [prices, global, fearGreed, altPrices] = await Promise.all([
                API.getCoinPrices(),
                API.getGlobalData(),
                API.getFearGreedIndex(),
                API.getAltcoinData()
            ]);
            const priceMap = {};
            prices.forEach(p => priceMap[p.id] = p);
            AppState.data.prices = priceMap;
            AppState.data.global = global.data || {};
            if (fearGreed && fearGreed.data && fearGreed.data[0]) {
                AppState.data.fearGreed = fearGreed.data[0];
            }
            AppState.data.altPrices = altPrices || [];
            const btcMarketCap = priceMap['bitcoin']?.market_cap || 0;
            const totalMarketCap = AppState.data.global?.total_market_cap?.usd || 1;
            AppState.data.btcDominance = (btcMarketCap / totalMarketCap) * 100;
            AppState.data.altSeasonIndex = IndicatorEngine.calculateAltSeasonIndex(
                altPrices || [],
                priceMap['bitcoin']
            );
            const { signals, regime, indicators } = SignalEngine.generateSignals(AppState.data);
            AppState.data.signals = signals;
            AppState.data.regime = regime;
            AppState.data.indicators = indicators;
            AppState.data.lastUpdate = new Date();
            UI.renderDashboard();
            UI.renderHeatmap();
            const badge = document.getElementById('signal-badge');
            if (badge) {
                const activeSignals = signals.filter(s => s.type !== 'neutral').length;
                badge.textContent = activeSignals;
                badge.style.display = activeSignals > 0 ? 'flex' : 'none';
            }
            App.checkAlerts();
            UI.showToast('Updated', 'Real-time data refreshed', 'success', 2000);
        } catch (error) {
            console.error('Refresh error:', error);
            UI.showToast('Error', 'Failed to refresh data. Check network.', 'error');
            UI.updateConnectionStatus(false);
        } finally {
            if (refreshBtn) refreshBtn.classList.remove('spinning');
        }
    },

    setupAutoRefresh() {
        if (AppState.autoRefreshInterval) {
            clearInterval(AppState.autoRefreshInterval);
        }
        const interval = (AppState.settings.refreshInterval || 60) * 1000;
        AppState.autoRefreshInterval = setInterval(() => {
            if (AppState.isOnline) {
                App.refreshData();
            }
        }, interval);
    },

    checkAlerts() {
        if (!AppState.settings.notifications) return;
        const data = AppState.data;
        const triggeredAlerts = [];
        AppState.alerts.forEach(alertId => {
            switch(alertId) {
                case 'nupl':
                    const nupl = IndicatorEngine.getSimulatedOnChainIndicators().nupl;
                    if (nupl.value < 0 || nupl.value > 0.75) {
                        triggeredAlerts.push({ id: alertId, title: 'NUPL Alert', message: `NUPL at ${nupl.value.toFixed(3)}` });
                    }
                    break;
                case 'fng':
                    const fng = parseInt(data.fearGreed?.value || 50);
                    if (fng < 20 || fng > 80) {
                        triggeredAlerts.push({ id: alertId, title: 'Fear & Greed Alert', message: `Index at ${fng}` });
                    }
                    break;
                case 'dominance':
                    const dom = data.btcDominance || 50;
                    if (dom < 48 || dom > 60) {
                        triggeredAlerts.push({ id: alertId, title: 'Dominance Alert', message: `BTC dominance at ${dom.toFixed(1)}%` });
                    }
                    break;
            }
        });
        triggeredAlerts.forEach(alert => {
            UI.showToast(alert.title, alert.message, 'warning', 6000);
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(alert.title, {
                    body: alert.message,
                    icon: './assets/icon-192.png'
                });
            }
        });
        const alertBadge = document.getElementById('alert-badge');
        if (alertBadge) {
            alertBadge.textContent = triggeredAlerts.length;
            alertBadge.classList.toggle('hidden', triggeredAlerts.length === 0);
        }
    },

    toggleAlert(alertId) {
        const index = AppState.alerts.indexOf(alertId);
        if (index > -1) {
            AppState.alerts.splice(index, 1);
        } else {
            AppState.alerts.push(alertId);
        }
        Storage.saveAlerts();
    },

    saveAsset() {
        const coin = document.getElementById('asset-coin').value;
        const amount = parseFloat(document.getElementById('asset-amount').value);
        const price = parseFloat(document.getElementById('asset-price').value);
        if (!amount || amount <= 0) {
            UI.showToast('Error', 'Enter amount', 'error');
            return;
        }
        const existing = AppState.portfolio.find(a => a.coin === coin);
        if (existing) {
            const totalAmount = existing.amount + amount;
            const totalCost = (existing.amount * existing.avgPrice) + (amount * price);
            existing.amount = totalAmount;
            existing.avgPrice = totalCost / totalAmount;
        } else {
            AppState.portfolio.push({
                coin,
                amount,
                avgPrice: price || 0
            });
        }
        Storage.savePortfolio();
        UI.renderPortfolio();
        document.getElementById('add-asset-modal').classList.add('hidden');
        document.getElementById('asset-amount').value = '';
        document.getElementById('asset-price').value = '';
        UI.showToast('Done', `${coin} added to portfolio`, 'success');
    },

    exportData() {
        const data = {
            portfolio: AppState.portfolio,
            alerts: AppState.alerts,
            settings: AppState.settings,
            exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cryptosignal-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        UI.showToast('Done', 'Data exported', 'success');
    },

    async requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                UI.showToast('Notifications', 'Push notifications enabled', 'success');
            }
        }
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
                    if (outcome === 'accepted') {
                        UI.showToast('Installed', 'CryptoSignal installed!', 'success');
                    }
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

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

document.addEventListener('visibilitychange', () => {
    if (!document.hidden && AppState.isOnline) {
        App.refreshData();
    }
});
