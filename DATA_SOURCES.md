# CryptoSignal 데이터 소스 문서

## ✅ 실시간 API 데이터 (무료 티어)

| 지표 | 데이터 소스 | 갱신 주기 | API 키 필요 |
|------|-----------|----------|------------|
| Fear & Greed Index | Alternative.me | 5분 | ❌ 없음 |
| 코인 가격 (BTC, ETH 등) | CoinGecko | 1분 | ❌ 없음 |
| 시가총액/거래량 | CoinGecko | 5분 | ❌ 없음 |
| BTC Dominance | CoinGecko Global | 5분 | ❌ 없음 |
| Altcoin Season Index | CoinGecko (계산) | 5분 | ❌ 없음 |

## ⚠️ 시뮬레이션 데이터 (Glassnode/CryptoQuant 유료 API 필요)

| 지표 | 실제 데이터 소스 | 무료 대안 | 상태 |
|------|---------------|----------|------|
| NUPL | Glassnode | 시뮬레이션 | ⚠️ |
| MVRV Z-Score | Glassnode | 시뮬레이션 | ⚠️ |
| SOPR | Glassnode | 시뮬레이션 | ⚠️ |
| Exchange Reserves | Glassnode/CryptoQuant | 시뮬레이션 | ⚠️ |
| Funding Rate | Coinglass | 시뮬레이션 | ⚠️ |
| Open Interest | Coinglass | 시뮬레이션 | ⚠️ |
| Puell Multiple | Glassnode | 시뮬레이션 | ⚠️ |
| Miner Position Index | Glassnode | 시뮬레이션 | ⚠️ |
| SSR | Glassnode | 시뮬레이션 | ⚠️ |

## 🔄 실시간 통합 가능한 추가 API

### 1. CoinMarketCap API (무료 Basic 티어)
- 15,000 calls/month
- Fear & Greed Index, Altcoin Season Index
- API 키 필요: https://pro.coinmarketcap.com/signup

### 2. CryptoQuant API (무료 티어)
- 제한적 온체인 데이터
- API 키 필요: https://cryptoquant.com/signup

### 3. Coinglass API (무료 티어)
- Funding Rate, Open Interest, Liquidation
- API 키 필요: https://coinglass.com

### 4. Whale Alert API (무료 티어)
- 대형 거래 실시간 알림
- API 키 필요: https://whale-alert.io
