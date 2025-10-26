// src/FolderCreateModal.tsx
import React from 'react';
const Modal: React.FC<{ onClose: () => void; isClosing?: boolean; className?: string; children?: React.ReactNode }> = ({ onClose, isClosing, className = '', children }) => (
  <div className={`modal-backdrop${isClosing ? ' closing' : ''}`}>
    <div className={`modal-content ${className}`}>
      <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
      {children}
    </div>
  </div>
);
export default Modal;
