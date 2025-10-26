// src/PWAInstallPrompt.tsx
import React from 'react';
const PWAInstallPrompt: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="modal-backdrop">
    <div className="modal-content">
      <h2>PWA 설치 안내</h2>
      <p>이 앱을 홈 화면에 추가하여 더 편리하게 사용하세요!</p>
      <button onClick={onClose}>닫기</button>
    </div>
  </div>
);
export default PWAInstallPrompt;
