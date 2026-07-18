# 📡 CryptoSignal

> **비트코인 & 알트코인 투자 지표 통합 대시보드**  
> AI 기반 다중 지표 신호 해석 및 실시간 알림을 제공하는 PWA 앱

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://yourusername.github.io/cryptosignal)
[![PWA](https://img.shields.io/badge/PWA-Ready-blueviolet)](https://yourusername.github.io/cryptosignal)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---



## 📡 실시간 데이터 현황

### ✅ 실시간 API (무료, 키 불필요)
| 지표 | 소스 | 갱신 주기 |
|------|------|----------|
| Fear & Greed Index | Alternative.me | 5분 |
| 코인 가격 (BTC, ETH 등 10개) | CoinGecko | 1분 |
| 시가총액/거래량 | CoinGecko | 5분 |
| BTC Dominance | CoinGecko | 5분 |
| Altcoin Season Index | CoinGecko 계산 | 5분 |

### ⚠️ 시뮬레이션 데이터 (유료 API 키 필요)
| 지표 | 실제 소스 | 설명 |
|------|----------|------|
| NUPL | Glassnode | 미실현 손익 비율 |
| MVRV Z-Score | Glassnode | 시장가치/실현가치 |
| SOPR | Glassnode | 체인상 이동 손익 |
| Exchange Reserves | Glassnode/CryptoQuant | 거래소 보유량 |
| Funding Rate | Coinglass | 영구 스왑 비용 |
| Open Interest | Coinglass | 미결제 약정 |
| Puell Multiple | Glassnode | 채굴 수익 비율 |
| Miner Position Index | Glassnode | 채굴자 매도/보유 |
| SSR | Glassnode | 스테이블코인 공급 비율 |

> 💡 **시뮬레이션 데이터는 실제 시장 사이클을 반영한 추정치입니다.**
> 실시간 온체인 데이터를 원하시면 아래 API 키를 추가하세요.

---

## 🔑 API 키 추가 방법 (실시간 데이터 확장)

### 1. Glassnode API (온체인 데이터)
1. https://glassnode.com 에 가입
2. API 키 발급 (무료 티어: 일일 30 API 호출)
3. `js/config.js` 파일 생성:
```javascript
const API_KEYS = {
    glassnode: 'YOUR_GLASSNODE_API_KEY'
};
```

### 2. CryptoQuant API (온체인 + 파생상품)
1. https://cryptoquant.com 에 가입
2. API 키 발급 (무료 티어: 제한적)
3. `js/config.js`에 추가:
```javascript
const API_KEYS = {
    glassnode: 'YOUR_GLASSNODE_API_KEY',
    cryptoquant: 'YOUR_CRYPTOQUANT_API_KEY'
};
```

### 3. Coinglass API (파생상품 데이터)
1. https://coinglass.com 에 가입
2. API 키 발급
3. `js/config.js`에 추가:
```javascript
const API_KEYS = {
    coinglass: 'YOUR_COINGLASS_API_KEY'
};
```

---

## 🎯 주요 기능

### 📊 5대 카테고리 30+ 핵심 지표
| 카테고리 | 지표 예시 |
|---------|----------|
| **시장 심리** | Fear & Greed Index, Altcoin Season Index, BTC Dominance |
| **온체인 분석** | NUPL, MVRV Z-Score, SOPR, Exchange Reserves, Hash Ribbons |
| **파생상품** | Funding Rate, Open Interest, Liquidation Heatmap |
| **기관/고래** | ETF Net Flows, Whale Movements |
| **기술적 분석** | RSI, MACD, Bollinger Bands, Mayer Multiple |

### 🤖 AI 신호 엔진
- **다중 지표 일치도(Confluence) 분석**: 5개 이상 지표가 동시에 신호를 볼 때만 알림
- **시장 국면 판별**: Capitulation → Hope → Optimism → Belief → Euphoria 5단계
- **실행 가능한 인사이트**: "지금 사야 하는가?"에 대한 직접적인 답변 제공

### 🔔 스마트 알림 시스템
- NUPL/MVRV 극단값 돌파 알림
- Hash Ribbons 매수 신호 알림
- 고래 지갑 이동 감지 알림
- ETF 대량 유입/유출 알림
- 푸시 알림 (PWA 지원)

### 💼 포트폴리오 관리
- 보유 자산 수동 입력 및 API 연동
- 미실현/실현 손익 계산
- 시장 국면 기반 리밸런싱 제안

---

## 🚀 설치 방법

### 방법 1: GitHub Pages (권장)
1. 이 저장소를 Fork합니다
2. Settings → Pages → Source를 `main` 브랜치로 설정
3. `https://yourusername.github.io/cryptosignal` 에 접속
4. 브라우저 "홈 화면에 추가" 클릭 → 앱처럼 사용!

### 방법 2: 로컬 실행
```bash
git clone https://github.com/yourusername/cryptosignal.git
cd cryptosignal
# 정적 파일 서버 실행 (Python)
python -m http.server 8000
# 또는 Node.js
npx serve .
```
브라우저에서 `http://localhost:8000` 접속

---

## 📱 PWA 설치

### iOS (Safari)
1. Safari에서 앱 열기
2. 하단 공유 버튼 → "홈 화면에 추가"
3. 앱 아이콘을 탭하여 실행

### Android (Chrome)
1. Chrome에서 앱 열기
2. 상단 메뉴 → "홈 화면에 추가" 또는 자동 설치 프롬프트
3. 앱 아이콘을 탭하여 실행

### PC (Chrome/Edge)
1. 주소창 오른쪽 설치 아이콘 클릭
2. "CryptoSignal 설치" 클릭

---

## 📂 프로젝트 구조

```
cryptosignal/
├── index.html          # 메인 HTML (PWA 엔트리 포인트)
├── manifest.json       # PWA 매니페스트
├── sw.js               # Service Worker (오프라인 지원)
├── css/
│   └── style.css       # 메인 스타일시트 (다크 테마)
├── js/
│   └── app.js          # 메인 애플리케이션 로직
├── assets/
│   ├── icon-192.png    # 앱 아이콘 (192x192)
│   ├── icon-512.png    # 앱 아이콘 (512x512)
│   └── screenshot-1.png # 스토어 스크린샷
└── README.md           # 이 파일
```

---

## 🛠️ 기술 스택

| 기술 | 용도 |
|------|------|
| **HTML5** | PWA, 반응형 레이아웃 |
| **CSS3** | Glassmorphism UI, 애니메이션 |
| **Vanilla JS** | 상태 관리, 데이터 페칭, 신호 엔진 |
| **Service Worker** | 오프라인 캐싱, 백그라운드 동기화 |
| **CoinGecko API** | 실시간 가격, 글로벌 데이터 |
| **Alternative.me API** | Fear & Greed Index |

---

## 📡 데이터 소스

| 데이터 | 소스 | 업데이트 주기 |
|--------|------|-------------|
| 실시간 가격 | CoinGecko API | 1분 |
| Fear & Greed | Alternative.me | 5분 |
| 글로벌 데이터 | CoinGecko API | 5분 |
| 온체인 지표 | Glassnode (향후) | 10분 |
| 파생상품 | Coinglass (향후) | 실시간 |

> ⚠️ 현재 버전에서는 온체인 지표가 시뮬레이션 데이터를 사용합니다. 실제 Glassnode/CryptoQuant API 연동은 향후 업데이트 예정입니다.

---

## 🧠 AI 신호 엔진 로직

```
입력: 30+ 지표 실시간 데이터
    ↓
Confluence Scoring (다중지표 일치도)
    ↓
Regime Detection (시장 국면 판별)
    ↓
Anomaly Detection (이상 징후 감지)
    ↓
출력: 매수/매도/관망 신호 + 신뢰도 + 근거 설명
```

### 신호 강도 기준
| 강도 | 조건 | 신뢰도 |
|------|------|--------|
| 🔴 강력 매도 | 4+ 지표 동시 약세 | 85%+ |
| 🟡 약한 매도 | 2-3 지표 약세 | 60-84% |
| ⚪ 중립 | 혼조 신호 | 40-59% |
| 🟢 약한 매수 | 2-3 지표 강세 | 60-84% |
| 🟢 강력 매수 | 4+ 지표 동시 강세 | 85%+ |

---

## ⚙️ 설정

### 알림 설정
- NUPL > 0.75 (Euphoria 진입)
- NUPL < 0 (Capitulation 진입)
- MVRV Z-Score > +3 또는 < -2
- Hash Ribbons 매수 신호
- 1,000+ BTC 이동 감지
- ETF 일간 순유입/유출 $100M+

### 환경 설정
- 🌙 다크 모드 (기본)
- 🔔 푸시 알림 on/off
- ⏱️ 자동 새로고침 (30초 ~ 10분)
- 💱 통화 단위 (USD/KRW)

---

## 🗺️ 로드맵

### ✅ v1.0 (현재)
- [x] 핵심 지표 12개 대시보드
- [x] AI 신호 엔진 (5개 알고리즘)
- [x] 기본 알림 시스템
- [x] 포트폴리오 관리
- [x] PWA 설치 지원
- [x] 오프라인 캐싱

### 🚧 v1.1 (예정)
- [ ] Glassnode API 연동 (실제 온체인 데이터)
- [ ] Coinglass 파생상품 데이터
- [ ] 고래 지갑 실시간 추적
- [ ] ETF Flow 실시간 모니터링
- [ ] 차트 시각화 (Chart.js)

### 🔮 v2.0 (예정)
- [ ] 백테스팅 엔진
- [ ] 커뮤니티 신호 공유
- [ ] 프리미엄 구독 모델
- [ ] 다국어 지원
- [ ] 거래소 API 연동 (자동 거래)

---

## ⚠️ 면책 조항

> **이 앱은 투자 권유가 아닙니다.**

- 모든 지표는 **확률적 도구**이며, 과거 성과가 미래를 보장하지 않습니다.
- **블랙 스왑 이벤트**, 규제 변화, 매크로 경제 충격은 지표로 예측 불가합니다.
- 투자 결정은 **개인의 판단과 책임** 하에 이루어져야 합니다.
- 이 앱의 정보로 인한 투자 손실에 대해 개발자는 책임을 지지 않습니다.

---

## 📄 라이선스

MIT License © 2026 CryptoSignal

---

## 🤝 기여

Issue와 PR을 환영합니다! 개선 사항이나 새로운 지표 제안은 언제든지 알려주세요.

---

<div align="center">
  <sub>Made with 💜 for Crypto Investors</sub>
</div>
