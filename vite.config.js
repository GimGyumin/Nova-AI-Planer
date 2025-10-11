import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub 리포지토리 이름을 변수에 저장합니다.
const repoName = 'Nova'; // <-- 중요: 이 부분을 실제 리포지토리 이름으로 변경하세요!

export default defineConfig({
  plugins: [react()],
  // 빌드 시 모든 파일 경로 앞에 리포지토리 이름이 붙도록 설정합니다.
  base: `/${repoName}/`,
});
