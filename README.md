# 💍 웨딩 청첩장 웹앱

모바일 청첩장 웹 애플리케이션입니다.
실제 결혼식에 사용했던 프로젝트를 포트폴리오용으로 재구성했습니다.

---

## 🔗 링크

- **배포 URL**: 추후 업데이트 예정
- **GitHub**: https://github.com/janie-0919/wedding-invitation

---

## ⚒️ 주요 기능

- **포스터 & 타이틀 애니메이션** — GSAP SplitText를 활용한 글자 등장 효과
- **텍스트 스크롤 애니메이션** — ScrollTrigger 기반 글자 순차 등장
- **서브 포스터 스크롤 줌** — 스크롤에 따라 이미지가 확대되는 효과
- **사진 갤러리** — Supabase Storage 연동, LightGallery 라이트박스, 더보기 기능
- **카카오 지도** — 예식장 위치 표시
- **카카오톡 공유** — 커스텀 OG 이미지 포함 공유
- **참석 여부 RSVP** — Supabase DB 연동, SHA-256 비밀번호, 수정/불러오기 기능
- **혼주 연락하기** — 전화/문자 바로가기
- **계좌번호 안내** — 아코디언 UI, 복사하기 기능
- **관리자 페이지** — 참석자 목록 및 통계 확인
- **GA4 이벤트 트래킹** — 섹션 조회, 버튼 클릭 등 사용자 행동 분석

---

## 🛠 기술 스택

| 분류 | 기술 |
|------|------|
| Frontend | React 19, React Router, SCSS |
| 애니메이션 | GSAP (SplitText, ScrollTrigger), AOS, Lottie |
| 갤러리 | LightGallery |
| DB / 인증 | Supabase (PostgreSQL) |
| 스토리지 | Supabase Storage |
| 지도 / 공유 | Kakao Maps SDK, Kakao Link SDK |
| 분석 | Google Analytics 4 |
| 배포 | Vercel |

---

## 🗂 프로젝트 구조

```
src/
├── assets/                        # Lottie JSON 애니메이션 파일
├── Components/                    # 재사용 컴포넌트
│   ├── Gallery.js                 # Supabase Storage 갤러리
│   ├── KakaoMap.js                # 카카오 지도
│   ├── KakaoShareButton.js        # 카카오톡 공유
│   ├── PopupContentAttendance.js  # RSVP 폼
│   ├── PopupContentCall.js        # 혼주 연락하기
│   ├── Countdown.js               # D-day 카운트다운
│   ├── TextAnimation.js           # GSAP 텍스트 애니메이션
│   ├── WeddingTitle.js            # 포스터 타이틀
│   ├── Poster.js                  # 서브 포스터 스크롤 줌
│   ├── AccordionItem.js           # 계좌번호 아코디언
│   └── Lottie.js                  # Lottie 래퍼
├── Pages/
│   ├── Main.js                    # 메인 청첩장 페이지
│   └── Admin.js                   # 관리자 페이지
├── hooks/
│   ├── useImageLoader.js          # 이미지 프리로드
│   └── usePageView.js             # GA4 페이지뷰
├── utils/
│   └── ga.js                      # GA4 이벤트 유틸
├── Style/                         # SCSS 스타일
├── supabase.js                    # Supabase 클라이언트
└── App.js
```

---

## ⚙️ 환경변수

프로젝트 루트에 `.env` 파일을 생성하고 아래 값을 설정해주세요.

```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_KAKAO_APP_KEY=your_kakao_app_key
```

---

## 🚀 로컬 실행

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm start

# 프로덕션 빌드
npm run build
```

---

## 🗄 Supabase 설정

**attendance 테이블 생성:**

```sql
create table attendance (
  id text primary key,
  gender text, attendance text, name text,
  phone1 text, phone2 text, phone3 text, phone_full text,
  party integer, meal text, textarea text,
  password_hash text, timestamp text,
  created_at timestamptz default now()
);
alter table attendance disable row level security;
```

**gallery 버킷:**
- Supabase Storage에 `gallery` 버킷 생성 (Public)
- Storage Policies에서 SELECT 권한 추가

---

## 👤 만든 사람

- **이름**: 이주연
- **GitHub**: https://github.com/janie-0919
- **Email**: janielee0919@gmail.com