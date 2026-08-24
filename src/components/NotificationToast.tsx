import React from 'react';

interface NotificationToastProps {
  message: string | null;
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-[#1c1b1b] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-[#9b0044] animate-bounce-short">
      <span className="material-symbols-outlined text-[#ffd9df] text-xl">info</span>
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-white/70 hover:text-white text-xs font-bold"
      >
        ✕
      </button>
    </div>
  );
};
