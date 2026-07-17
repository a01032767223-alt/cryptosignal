            , onChain, etf };

            // Update connection status
            const statusEl = document.getElementById('connection-status');
            if (statusEl) {
                statusEl.querySelector('.status-dot').classList.add('online');
                statusEl.querySelector('.status-text').textContent = '실시간';
            }

            // Regenerate signals with new data
            State.signals = SignalEngine.generateSignals(State.data);

            // Update UI if visible
            const activeTab = document.querySelector('.tab-panel.active');
            if (activeTab) {
                if (activeTab.id === 'dashboard') {
                    UI.renderDashboard(State.data);
                } else if (activeTab.id === 'indicators') {
                    const activeCat = document.querySelector('.cat-btn.active')?.dataset.cat || 'all';
                    UI.renderIndicators(State.data, activeCat);
                } else if (activeTab.id === 'signals') {
                    UI.renderSignals(State.data);
                } else if (activeTab.id === 'portfolio') {
                    UI.renderPortfolio();
                }
            }

            // Check alerts
            this.checkAlerts();

        } catch (error) {
            console.error('Refresh error:', error);
            const statusEl = document.getElementById('connection-status');
            if (statusEl) {
                statusEl.querySelector('.status-dot').classList.remove('online');
                statusEl.querySelector('.status-text').textContent = '오프라인';
            }
        }
    },

    updateRefreshInterval() {
        if (this.refreshTimer) clearInterval(this.refreshTimer);
        const interval = (State.settings.refreshInterval || 60) * 1000;
        this.refreshTimer = setInterval(() => this.refreshData(), interval);
    },

    checkAlerts() {
        const { fearGreed, onChain } = State.data;
        if (!fearGreed || !onChain) return;

        const alerts = State.alerts;
        let triggered = 0;

        // Check each alert condition
        if (alerts['nupl-euphoria'] && onChain.nupl > 0.75) triggered++;
        if (alerts['nupl-capitulation'] && onChain.nupl < 0) triggered++;
        if (alerts['mvrv-zscore-high'] && onChain.mvrvZScore > 3) triggered++;
        if (alerts['mvrv-zscore-low'] && onChain.mvrvZScore < -2) triggered++;
        if (alerts['funding-extreme'] && Math.abs(onChain.fundingRate) > 0.03) triggered++;

        if (triggered > 0) {
            const badge = document.getElementById('alert-badge');
            if (badge) {
                badge.textContent = triggered;
                badge.classList.remove('hidden');
            }

            // Show notification if enabled
            if (State.settings.notifications && 'Notification' in window && Notification.permission === 'granted') {
                new Notification('CryptoSignal 알림', {
                    body: `${triggered}개의 알림 조건이 충족되었습니다.`,
                    icon: 'assets/icon-192.png'
                });
            }
        }
    }
};

// ============================================
// INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Handle visibility change for background updates
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        App.refreshData();
    }
});
