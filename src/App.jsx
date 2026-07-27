import React, { useState, useEffect } from 'react';
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

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const authLoading = useStore((s) => s.authLoading);
  const initAuthListener = useStore((s) => s.initAuthListener);
  const { toasts } = useToast();

  useEffect(() => {
    initAuthListener();
    const cleanup = initNetworkListeners();
    scheduleStreakReminder();
    const done = localStorage.getItem('flux-onboarding-done');
    if (!done) {
      setShowOnboarding(true);
    }
    return cleanup;
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
