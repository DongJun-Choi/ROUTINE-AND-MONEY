## 루틴 & 머니 프로젝트

은행에서 제공하는 **카드 이용내역 엑셀 파일을 업로드하기만 하면** 자동으로 거래 내역을 분석하고, 카테고리를 분류하며, 월별∙일별∙카테고리별 소비 패턴을 시각화하는 **개인 재무 관리 웹 애플리케이션**입니다.

이 프로젝트는 **"반복적인 가계부 기록 작업을 자동화"**하고 **사용자의 소비 습관을 직관적으로 분석**할 수 있도록 설계되었습니다.

---

## 주요 기능 요약

### 1. 엑셀 기반 자동 가계부 생성

- 엑셀 파일 업로드 (xlsx / xls)
- 엑셀의 거래 내역 자동 파싱
- 날짜·금액·정상거래 여부 등 정제(normalize)
- 포인트 결제·혼합 결제 자동 처리
- 월 단위 중복 업로드 방지 (ExcelUploadLog 활용)
- 자동 카테고리 분류 (CategoryRule 기반)
- 업로드 후 즉시 내역 프리뷰 제공

### 2. 거래 내역 관리 (CRUD)

- 거래 조회 (연/월 기반)
- 거래 추가, 수정, 삭제
- 메모 관리
- 거래당 카테고리 변경 기능
- 카테고리 전체 일괄 이동(old → new)
- 카테고리·결제수단·금액 필터 기능

### 3. 소비 패턴 분석 및 대시보드

- 월 요약(수입, 지출, 순지출, 최다 카테고리)
- 카테고리별 소비 비율(도넛 차트)
- 일별 지출 변화(Line Chart)
- 연 기준 월별 지출 트렌드(Bar Chart)
- 연/월 선택 UI 제공

### 4. 카테고리 관리

- 대분류 / 소분류 계층 구조
- 카테고리 CRUD 기능
- 부모 카테고리 삭제 제한
- 사용 중인 카테고리 삭제 제한 처리
- 카테고리 태그 UI

### 5. 자동 분류 룰 (CategoryRule)

- 키워드 기반 자동 분류 시스템
- 키워드 normalize(공백/소문자 처리)
- 룰 CRUD 기능

---

## 기술 스택

### Frontend

- **Next.js 14 (App Router)**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Chart.js (react-chartjs-2)**

### Backend

- **Next.js Route Handlers (API Routes)**
- **Prisma ORM**
- **PostgreSQL**

### 기타

- **xlsx** – 엑셀 파싱

## 프로젝트 파일 구조

```jsx
src/
 ├─ app/                          # Next.js App Router (페이지 + Backend API)
 │   ├─ globals.css               # 전역 스타일
 │   ├─ page.tsx                  # 기본 루트 페이지
 │   │
 │   ├─ category/                 # 카테고리 관리 페이지
 │   │    └─ page.tsx
 │   │
 │   ├─ dashboard/                # 대시보드 페이지
 │   │    └─ page.js
 │   │
 │   ├─ transactions/             # 거래 내역 페이지
 │   │    └─ page.tsx
 │   │
 │   ├─ upload/                   # 엑셀 업로드 페이지
 │   │    └─ page.tsx
 │   │
 │   ├─ actions/                  # 서버 액션(현재 비어 있음)
 │   │    └─ .gitkeep
 │   │
 │   └─ api/                      # RESTful API (백엔드 핵심)
 │        ├─ categories/
 │        │    └─ [id]/           # 카테고리 수정/삭제 API
 │        │
 │        ├─ category-rules/
 │        │    ├─ add/            # 룰 추가
 │        │    └─ [id]/           # 룰 삭제
 │        │
 │        ├─ dashboard/           # 대시보드 집계 API
 │        │    ├─ category/
 │        │    ├─ daily/
 │        │    ├─ monthly/
 │        │    └─ summary/
 │        │
 │        ├─ transactions/        # 거래 CRUD + 카테고리 이동 API
 │        │    ├─ move-category/
 │        │    └─ [id]/           # 거래 수정/삭제
 │        │         └─ category/  # 거래 카테고리 변경
 │        │
 │        └─ upload/              # 엑셀 업로드 API
 │
 ├─ components/                   # 프론트 UI 컴포넌트
 │   │
 │   ├─ Calendar.tsx
 │   ├─ CategoryModal.tsx
 │   ├─ CategoryTag.tsx
 │   ├─ FilterCategorySelector.tsx
 │   ├─ FilterFloatingBox.tsx
 │   ├─ TransactionDetailModal.tsx
 │   │
 │   ├─ category/                 # 카테고리 관리 관련 UI
 │   │    ├─ ChildCategoryItem.tsx
 │   │    ├─ ChildCategoryList.tsx
 │   │    ├─ DeleteCategoryModal.tsx
 │   │    ├─ ParentCategorySelector.tsx
 │   │    └─ category-rule/
 │   │         └─ CategoryRuleManager.tsx
 │   │
 │   └─ dashboard/                # 대시보드 컴포넌트
 │        ├─ CategoryPie.tsx
 │        ├─ DailyChart.tsx
 │        ├─ MonthlyChart.tsx
 │        ├─ SectionBox.tsx
 │        └─ Summary.tsx
 │
 ├─ hooks/                        # 커스텀 훅 (현재 비어 있음)
 │
 ├─ lib/                          # 백엔드/공용 로직
 │   ├─ prisma.ts                 # Prisma Client
 │   ├─ autoCategory.ts           # 자동 분류 로직
 │   │
 │   └─ excel/                    # 엑셀 파싱 및 정제
 │        ├─ parseExcel.ts
 │        └─ normalizeExcel.ts
 │
 └─ test/                         # 테스트용 디렉터리(현재 비어 있음)

```