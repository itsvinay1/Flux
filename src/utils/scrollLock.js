// src/utils/scrollLock.js
// Advanced multi-modal scroll lock for Capacitor WebView, iOS Safari, and Android
// Prevents any background bleed-through or rubber-banding while modals/sheets are active.

let lockCount = 0;
let savedScrollTop = 0;

export function lockScroll() {
  lockCount++;
  if (lockCount === 1) {
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');

    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      savedScrollTop = mainContent.scrollTop;
      mainContent.classList.add('modal-open');
      mainContent.style.overflow = 'hidden';
      mainContent.style.touchAction = 'none';
      mainContent.style.pointerEvents = 'none';
    }
  }
}

export function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.classList.remove('modal-open');
    document.documentElement.classList.remove('modal-open');

    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.classList.remove('modal-open');
      mainContent.style.overflow = '';
      mainContent.style.touchAction = '';
      mainContent.style.pointerEvents = '';
      mainContent.scrollTop = savedScrollTop;
    }
  }
}
