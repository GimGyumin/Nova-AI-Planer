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

