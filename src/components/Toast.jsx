import React, { useState } from 'react';

let toastId = 0;
let setToastsGlobal = null;

export function useToast() {
  const [toasts, setToasts] = useState([]);
  setToastsGlobal = setToasts;
  return { toasts };
}

export function showToast(message, emoji = '✨', duration = 2500) {
  if (!setToastsGlobal) return;
  try {
    const safeMsg = String(message || '').slice(0, 100);
    const id = ++toastId;
    setToastsGlobal((prev) => [...prev, { id, message: safeMsg, emoji }]);
    setTimeout(() => {
      if (setToastsGlobal) {
        setToastsGlobal((prev) => prev.filter((t) => t.id !== id));
      }
    }, duration);
  } catch (e) {
    // Non-blocking toast fallback
  }
}

export function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          <span style={{ fontSize: '16px' }}>{t.emoji}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
