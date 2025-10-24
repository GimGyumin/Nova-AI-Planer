# 🌟 Nova AI Planner

> AI 기반 목표 설정 및 관리 플랫폼

[![Demo](https://img.shields.io/badge/Demo-Live-success)](https://gimgyumin.github.io/Nova-AI-Planer/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.2.10-646CFF.svg)](https://vitejs.dev/)

## 📖 소개

Nova AI Planner는 Google Gemini AI를 활용한 스마트한 목표 관리 애플리케이션입니다. 사용자가 설정한 목표를 AI가 분석하여 우선순위를 추천하고, 효과적인 목표 달성을 도와줍니다.

### ✨ 주요 기능

- 🎯 **AI 기반 목표 분석**: Google Gemini AI를 통한 지능적인 목표 우선순위 추천
- 📅 **반복 목표 관리**: 요일별 반복 일정 설정 및 추적
- 🏆 **성취 추적**: 연속 달성 기록(Streak) 시스템
- 🌙 **다크/라이트 모드**: 사용자 선호에 따른 테마 변경
- 🌍 **다국어 지원**: 한국어/영어 인터페이스
- 📊 **다양한 정렬 옵션**: 수동, 마감일순, 최신순, 알파벳순, AI 추천순
- 📱 **반응형 디자인**: 모바일 및 데스크톱 최적화
- 💾 **데이터 관리**: 목표 데이터 내보내기/가져오기 기능
- 📅 **캘린더 뷰**: 목표를 달력 형태로 시각화

## 🚀 빠른 시작

### 필수 요구사항

- Node.js 16.0 이상
- npm 또는 yarn

### 설치 및 실행

1. **리포지토리 클론**
   ```bash
   git clone https://github.com/GimGyumin/Nova-AI-Planer.git
   cd Nova-AI-Planer
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **환경 변수 설정**
   
   프로젝트 루트에 `.env.local` 파일을 생성하고 Gemini API 키를 설정하세요:
   ```env
   VITE_API_KEY=your_gemini_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   
   > 💡 [Google AI Studio](https://makersuite.google.com/app/apikey)에서 무료 API 키를 발급받을 수 있습니다.

4. **개발 서버 실행**
   ```bash
   npm run dev
   ```

5. **브라우저에서 확인**
   
   http://localhost:3000 에서 애플리케이션을 확인할 수 있습니다.

## 🏗️ 빌드 및 배포

### 프로덕션 빌드

```bash
npm run build
```

### GitHub Pages 배포

```bash
npm run deploy
```

## 🛠️ 기술 스택

### Frontend
- **React 18.2** - 사용자 인터페이스 라이브러리
- **TypeScript 5.4** - 정적 타입 검사
- **Vite 5.2** - 빠른 빌드 도구
- **CSS3** - 스타일링 (Flexbox, Grid, CSS Variables)

### AI & API
- **Google Gemini AI** - 목표 분석 및 우선순위 추천
- **@google/genai** - Google Generative AI SDK

### 배포 & 도구
- **GitHub Pages** - 정적 사이트 호스팅
- **gh-pages** - 자동 배포 도구
- **ESLint** - 코드 품질 관리

## 📁 프로젝트 구조

```
Nova-AI-Planer/
├── index.html          # 메인 HTML 파일
├── index.tsx           # 메인 React 컴포넌트
├── index.css           # 글로벌 스타일
├── vite.config.ts      # Vite 설정
├── tsconfig.json       # TypeScript 설정
├── package.json        # 프로젝트 의존성
└── README.md          # 프로젝트 문서
```

## 🎯 사용법

### 1. 목표 추가
- "새로운 목표" 버튼을 클릭하여 목표 설정 모달을 열어주세요
- 목표, 결과, 장애물, If-Then 계획을 입력하세요
- 마감일과 반복 설정을 구성하세요

### 2. AI 우선순위 추천
- 정렬 옵션에서 "AI 추천"을 선택하세요
- AI가 마감일, 중요도, 실현 가능성을 기반으로 목표를 재정렬합니다

### 3. 목표 관리
- 체크박스를 클릭하여 목표를 완료 처리하세요
- 목표를 클릭하여 상세 정보를 확인하거나 편집하세요
- 필터를 사용하여 진행 중/완료된 목표를 분류하세요

## 🤝 기여하기

1. 이 리포지토리를 Fork하세요
2. 새로운 기능 브랜치를 생성하세요 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋하세요 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 Push하세요 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성하세요

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 👨‍💻 개발자

**김규민 (GimGyumin)**
- GitHub: [@GimGyumin](https://github.com/GimGyumin)

## 🔗 링크

- [Live Demo](https://gimgyumin.github.io/Nova-AI-Planer/)
- [GitHub Repository](https://github.com/GimGyumin/Nova-AI-Planer)
- [Issues](https://github.com/GimGyumin/Nova-AI-Planer/issues)

## 🙏 감사의 말

- [Google Gemini AI](https://ai.google.dev/) - AI 기능 제공
- [React](https://reactjs.org/) - 사용자 인터페이스 프레임워크
- [Vite](https://vitejs.dev/) - 빠른 빌드 도구

---

<div align="center">
  <strong>🌟 도움이 되셨다면 Star를 눌러주세요! 🌟</strong>
</div>
