// src/useModalAnimation.ts
// 더미 훅: 실제 애니메이션 로직이 필요하면 구현하세요.
import { useState } from 'react';
export default function useModalAnimation(onClose: () => void): [boolean, () => void] {
  const [isClosing, setIsClosing] = useState(false);
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200); // 200ms 애니메이션 딜레이
  };
  return [isClosing, handleClose];
}
