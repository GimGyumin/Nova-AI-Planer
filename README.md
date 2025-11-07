# Nova AI Planner

AI 기반 목표 설정 및 관리 플래너입니다.

## 배포 URL
https://gimgyumin.github.io/Nova-AI-Planer/

## 기능
- AI 기반 목표 생성
- 진행상황 추적
- 목표 공유
- API 키 관리

## 연구용 데이터 수집 페이지 (분리)
프로젝트에 포함된 독립형 연구용 수집 도구입니다. 앱과 완전히 분리되어 로컬에 연구 로그를 저장하고 JSON/CSV로 내보낼 수 있습니다.

- 접근: https://<your-gh-pages-domain>/Nova-AI-Planer/research.html
- 로컬에서 테스트: 앱을 빌드하고 GitHub Pages로 배포한 후 위 URL에서 접근하거나, 개발 중에는 `public/research.html` 파일을 브라우저에서 바로 열어 사용 가능.

기능 요약:
- 날짜, 과제명, 완료 여부, 지연(서술/분), 집중도(1-5), 피로감(1-5), 메모 입력
- 로컬 저장(localStorage)에 분리 저장
- JSON/CSV로 내보내기 및 전체 삭제

Firebase(선택) 설정 — 클라우드 저장
---------------------------------
클라우드에 로그를 백업하려면 Firebase Firestore를 사용하도록 구성할 수 있습니다. 로컬 저장은 기본이며, 리서치 폼에서 "클라우드 저장" 옵션을 켜면 Firestore로 업로드합니다.

환경 변수 (Vite 사용)
- 프로젝트 루트에 `.env` 파일을 만들고 아래 값을 설정하세요. 실제 값은 Firebase 콘솔에서 확인합니다.

VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id

설정 후 로컬 개발 서버를 재시작하세요 (`npm run dev`). 배포 시에는 GitHub Actions/CI에 위 환경변수를 안전하게 설정해야 합니다.


