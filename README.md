# 📚 우리 반 독서록

초등학생을 위한 독서 포트폴리오 관리 웹 애플리케이션

## 주요 기능

- **Google 로그인** — 교사와 학생 모두 Google 계정으로 간편 로그인
- **반 관리** — 교사가 반을 만들고 6자리 초대 코드로 학생 초대
- **바둑판 교실** — 학생들이 5×5~5×7 그리드에 배치되는 교실 화면
- **패들렛 스타일 독서록 보드** — 학생 개인 독서록 포트폴리오
- **구조화형 독서록** — 줄거리 요약, 인상 깊은 장면, 나의 생각 등 단계별 작성
- **교사 대시보드** — 학생 진도, 참여율, 월별 추이, 별점 분포 통계
- **보석 등급 시스템** — 독서록 편수에 따른 10단계 보석 메달 (원석 → 다이아몬드)

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프론트엔드 | React 19, TypeScript, Tailwind CSS 4, Zustand |
| 백엔드 | Firebase Auth, Cloud Firestore, Firebase Storage |
| 빌드 | Vite 6 |
| 배포 | Firebase Hosting |

## 시작하기

### 1. 프로젝트 클론

```bash
git clone https://github.com/YOUR_USERNAME/reading-log-app.git
cd reading-log-app
npm install
```

### 2. Firebase 프로젝트 설정

1. [Firebase Console](https://console.firebase.google.com)에서 새 프로젝트 생성
2. Authentication → Google 로그인 활성화
3. Firestore Database 생성 (production mode)
4. Storage 활성화
5. 프로젝트 설정 → 웹 앱 추가 → config 값 복사

### 3. 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일에 Firebase config 값 입력:

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 4. Firestore 보안 규칙 배포

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules,storage
```

### 5. 관리자 계정 설정

Firestore Console에서 `users` 컬렉션의 관리자 문서의 `role` 필드를 `"admin"`으로 변경

### 6. 개발 서버 실행

```bash
npm run dev
```

### 7. 배포

```bash
npm run build
firebase deploy --only hosting
```

## 보석 등급 시스템

| 등급 | 보석 | 필요 편수 |
|------|------|-----------|
| Lv.1 | 🪨 원석 | 1편 |
| Lv.2 | 🟠 호박 | 3편 |
| Lv.3 | 🟡 토파즈 | 5편 |
| Lv.4 | 🟢 페리도트 | 8편 |
| Lv.5 | 🔵 아쿠아마린 | 12편 |
| Lv.6 | 💎 사파이어 | 16편 |
| Lv.7 | 🔮 자수정 | 20편 |
| Lv.8 | ❤️‍🔥 루비 | 25편 |
| Lv.9 | 💚 에메랄드 | 30편 |
| Lv.10 | 💎✨ 다이아몬드 | 40편 |

## 역할 체계

- **관리자** — 교사 권한 승인/회수, 전체 모니터링
- **교사** — 반 생성, 학생 초대, 독서록 열람, 대시보드 통계
- **학생** — 반 입장, 독서록 작성/수정/삭제, 포트폴리오 관리

## 프로젝트 구조

```
src/
├── components/        # UI 컴포넌트
│   ├── auth/          # 인증 관련
│   ├── class/         # 교실/바둑판
│   ├── common/        # 공통 (Header, StarRating, GemBadge)
│   ├── dashboard/     # 교사/학생 대시보드
│   └── reading-log/   # 독서록 보드/카드/폼
├── pages/             # 라우팅 페이지
├── services/          # Firebase 연동
├── stores/            # Zustand 상태관리
├── types/             # TypeScript 타입
└── utils/             # 유틸리티 함수
```

## 라이선스

MIT
