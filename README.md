# 루틴 & 머니

카드 이용 내역을 가져와 거래를 분류하고 월별·일별·카테고리별 소비 패턴을 보여 주는 개인 재무 관리 웹 애플리케이션입니다.

주요 기능:

- 엑셀 및 보안메일 HTML 카드 명세서 업로드
- 네이버 메일 카드 명세서 자동 수집
- 거래 내역과 카테고리 관리
- 키워드 기반 자동 분류
- 소비 내역 대시보드

## 처음 설치

Node.js, npm, Docker Desktop, Windows PowerShell이 필요합니다.

```powershell
git clone https://github.com/DongJun-Choi/ROUTINE-AND-MONEY.git
cd ROUTINE-AND-MONEY
npm install
Copy-Item .env.example .env
```

## 환경 변수

`.env`에 PostgreSQL 접속 정보를 입력합니다. Docker DB는 기본 포트 `5432`를 사용합니다.

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/routine_money
```

네이버 메일 자동 수집을 사용하지 않으면 다음 값만 추가합니다.

```env
NAVER_MAIL_SYNC_ENABLED=false
```

자동 수집을 사용한다면 아래 값도 반드시 입력합니다.

```env
NAVER_MAIL_SYNC_ENABLED=true
NAVER_MAIL_USER=your_naver_id
NAVER_MAIL_PASSWORD=your_naver_password
NAVER_MAIL_ATTACHMENT_PASSWORD=your_attachment_password
```

실제 비밀번호가 들어 있는 `.env`는 커밋하지 않습니다.

## Docker DB 실행

Docker Desktop을 먼저 실행합니다. Windows PostgreSQL이 `5432` 포트를 사용 중이라면 관리자 PowerShell에서 중지합니다.

```powershell
Stop-Service -Name postgresql-x64-16
```

Docker PostgreSQL을 시작하고 최초 마이그레이션을 적용합니다.

```powershell
npm run db:up
npx prisma migrate deploy
```

DB 관리 명령:

```powershell
npm run db:status
npm run db:down
```

`db:down`은 컨테이너만 중지하며 데이터 볼륨은 유지합니다. 데이터가 삭제되는 `docker compose down -v`는 사용하지 않습니다.

## 프로젝트 실행

```powershell
npm run dev
```

`npm run dev`는 Docker DB를 먼저 시작한 뒤 Next.js 개발 서버와 메일 워커를 실행합니다. 브라우저에서 [http://localhost:3000](http://localhost:3000)에 접속합니다.

빌드 및 프로덕션 실행:

```powershell
npm run build
npm run start
```
