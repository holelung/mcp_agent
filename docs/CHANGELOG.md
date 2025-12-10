# 📋 Changelog

Personal Assistant MCP 프로젝트의 변경 내역입니다.

---

## [0.4.0] - 2025-12-10

### ✨ 새로운 기능

#### 📱 사이드바 모바일 반응형
- 모바일에서 햄버거 메뉴 버튼 (☰)
- 사이드바 슬라이드 인/아웃 애니메이션
- 배경 오버레이 (블러 효과)
- 닫기 버튼 (✕) 추가
- 메뉴 선택 시 자동으로 사이드바 닫기
- 데스크톱에서는 기존처럼 항상 표시

---

## [0.3.0] - 2025-12-10

### ✨ 새로운 기능

#### 📅 일정 달력 UI
- 일정 페이지에 달력 뷰 추가
- 월 네비게이션 (이전/다음 월 이동)
- "오늘로 이동" 버튼
- 일요일(빨간색), 토요일(파란색) 색상 구분
- 선택된 날짜 그라데이션 강조
- 일정 있는 날짜에 점 표시
- 선택된 날짜의 일정 목록 표시
- 전체 일정 목록에서 클릭 시 해당 날짜로 이동

#### 📱 반응형 레이아웃
- 넓은 화면 (1024px+): 좌측 달력 + 우측 일정 리스트
- 좁은 화면: 일정 리스트만 표시

---

## [0.2.0] - 2025-12-10

### ✨ 새로운 기능

#### 📝 메모 상세 화면
- 메모 카드 클릭 시 상세 모달 표시
- 전체 내용, 작성일, 수정 여부 표시
- 태그를 `#해시태그` 형태로 표시
- 모달 애니메이션 및 배경 블러 효과
- 호버 시 '클릭하여 상세보기' 안내

#### 🔧 줄바꿈 처리 개선
- `\n` 문자열을 실제 줄바꿈으로 변환
- `\t` 문자열을 실제 탭으로 변환

### 📚 문서화
- 프로젝트 README.md 작성
- 프로젝트 구조 및 주요 기능 설명
- 기술 스택 정리
- 설치 및 실행 가이드
- MCP 도구 목록 문서화
- 시스템 아키텍처 다이어그램

---

## [0.1.0] - 2025-12-10

### 🎉 최초 릴리스

#### 🤖 MCP 서버 구현
- Model Context Protocol 기반 서버 구축
- Cursor IDE 연동 설정
- stdio 통신 방식 구현

#### 📦 핵심 기능
- **메모 관리**: 생성, 조회, 수정, 삭제 (CRUD)
- **할 일 관리**: 생성, 완료 처리, 우선순위, 마감일
- **일정 관리**: 생성, 시작/종료 시간, 장소
- **북마크 관리**: URL 저장, 태그 분류
- **통합 검색**: 모든 데이터 검색
- **오늘의 요약**: 일일 요약 정보

#### 🗄️ 데이터베이스
- SQLite에서 PostgreSQL로 마이그레이션
- Docker Compose로 PostgreSQL 16 실행
- `TEXT[]` 배열 타입으로 태그 저장
- GIN 인덱스로 태그 검색 최적화
- Full-text search 인덱스 추가
- 자동 `updated_at` 트리거

#### 🖥️ 백엔드 API
- Express.js REST API 서버
- 별도 `personal-assistant-backend` 폴더로 분리
- PostgreSQL 연동
- CORS 설정

#### 🎨 프론트엔드 대시보드
- Vue 3 + Vite + TypeScript
- Tailwind CSS 스타일링
- 반응형 레이아웃

##### UI/UX 개선
- 다크 사이드바 (slate 그라데이션)
- 글래스모피즘 카드
- 그라데이션 배경
- 그라데이션 아이콘 박스
- Outfit + Sora 폰트
- 시간대별 인사말 (좋은 아침/오후/저녁)
- "MCP 연동됨" 상태 위젯
- 전체 현황 패널
- 호버 애니메이션

#### 🐳 Docker 설정
- 통합 `docker-compose.yml`
- PostgreSQL, Backend, Dashboard 컨테이너
- Nginx를 통한 Dashboard 서빙
- API 프록시 설정

---

## 프로젝트 구조

```
myMCP/
├── personal-assistant-mcp/       # MCP 서버 (Cursor IDE 연동)
│   ├── src/
│   │   ├── index.ts              # MCP 서버 메인
│   │   ├── database.ts           # PostgreSQL 연결
│   │   └── tools/                # 도구 구현
│   │       ├── memo.ts
│   │       ├── todo.ts
│   │       ├── schedule.ts
│   │       └── bookmark.ts
│   ├── init.sql                  # DB 스키마
│   └── docker-compose.yml        # PostgreSQL 컨테이너
│
├── personal-assistant-backend/   # REST API 서버
│   └── src/
│       └── server.ts             # Express 서버
│
├── personal-assistant-dashboard/ # Vue.js 웹 대시보드
│   └── src/
│       ├── App.vue
│       ├── api/index.ts          # API 클라이언트
│       ├── components/
│       │   └── Sidebar.vue
│       └── views/
│           ├── Dashboard.vue
│           ├── Memos.vue
│           ├── Todos.vue
│           ├── Schedules.vue
│           └── Bookmarks.vue
│
├── docker-compose.yml            # 통합 Docker Compose
├── README.md                     # 프로젝트 문서
└── docs/
    └── CHANGELOG.md              # 변경 내역 (이 파일)
```

---

## 기술 스택

| 구성요소 | 기술 |
|---------|------|
| MCP 서버 | Node.js, TypeScript, @modelcontextprotocol/sdk |
| 백엔드 API | Express.js, TypeScript |
| 프론트엔드 | Vue 3, Vite, Tailwind CSS |
| 데이터베이스 | PostgreSQL 16 |
| 컨테이너 | Docker, Docker Compose |

---

## 향후 계획

- [x] 사이드바 모바일 반응형 (햄버거 메뉴) ✅
- [ ] 할 일 상세 화면
- [ ] 북마크 상세 화면
- [ ] 다크 모드 지원
- [ ] 알림 기능
- [ ] 데이터 내보내기/가져오기
- [ ] 사용자 인증

