import React, { useState, useEffect, useRef } from 'react';
import BottomNav from './components/BottomNav';
import Dashboard from './tabs/Dashboard';
import Roadmap from './tabs/Roadmap';
import FocusTimer from './tabs/FocusTimer';
import Journal from './tabs/Journal';
import Tribe from './tabs/Tribe';
import Profile from './tabs/Profile';
import AICoachChat from './tabs/AICoachChat';
import OnboardingModal from './components/OnboardingModal';
import AuthModal from './components/AuthModal';
import SplashScreen from './components/SplashScreen';
import { useToast, ToastContainer } from './components/Toast';
import { initNetworkListeners } from './sync/syncManager';
import { scheduleStreakReminder } from './utils/notificationManager';
import useStore from './store/useStore';

const TAB_COMPONENTS = {
  dashboard: Dashboard,
  roadmap: Roadmap,
  focus: FocusTimer,
  coach: AICoachChat,
  journal: Journal,
  tribe: Tribe,
  profile: Profile,
};

import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const activeTabRef = useRef(activeTab);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const authLoading = useStore((s) => s.authLoading);
  const initAuthListener = useStore((s) => s.initAuthListener);
  const { toasts } = useToast();

  useEffect(() => {
    initAuthListener();
    const cleanup = initNetworkListeners();
    scheduleStreakReminder();

    // Listen for Capacitor deep links & OAuth redirect returns
    let urlListener = null;
    let backListener = null;

    if (window.Capacitor && window.Capacitor.isNativePlatform()) {
      CapApp.addListener('appUrlOpen', async (data) => {
        console.log('[FLUX DeepLink] App URL Opened:', data.url);
        try {
          await Browser.close();
        } catch (e) {}
      }).then((l) => { urlListener = l; });

      // Hardware Back Button Navigation Handler
      let lastBackPress = 0;
      CapApp.addListener('backButton', () => {
        const now = Date.now();
        if (activeTabRef.current && activeTabRef.current !== 'dashboard') {
          setActiveTab('dashboard');
        } else {
          if (now - lastBackPress < 2000) {
            CapApp.minimizeApp();
          } else {
            lastBackPress = now;
            showToast('Press back again to exit FLUX ⚡', '📱');
          }
        }
      }).then((l) => { backListener = l; });
    }

    const done = localStorage.getItem('flux-onboarding-done');
    if (!done) {
      setShowOnboarding(true);
    }

    return () => {
      cleanup && cleanup();
      urlListener && urlListener.remove();
      backListener && backListener.remove();
    };
  }, [initAuthListener]);

  const ActiveComponent = TAB_COMPONENTS[activeTab];

  return (
    <div className="app-shell">
      {/* ⚡ App Splash Launch Screen */}
      {showSplash ? (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      ) : null}

      {/* 🔐 Dedicated Google Authentication Screen */}
      {!isAuthenticated ? (
        <AuthModal onComplete={() => {
          const done = localStorage.getItem('flux-onboarding-done');
          if (!done) {
            setShowOnboarding(true);
          }
        }} />
      ) : showOnboarding ? (
        <OnboardingModal onComplete={() => setShowOnboarding(false)} />
      ) : null}

      {/* Subtle top sky glow */}
      <div className="app-bg-top-glow" aria-hidden="true" />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} />

      {/* Tab Content */}
      <main className="tab-content" id="main-content">
        <ActiveComponent key={activeTab} onNavigate={setActiveTab} />
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
