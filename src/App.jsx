import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { base44 } from '@/api/base44Client';
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { motion, AnimatePresence } from 'framer-motion';

import AppLayout from './components/layout/AppLayout';
import LeaderOnboarding from './components/onboarding/LeaderOnboarding';
import Home from './pages/Home';
import Feed from './pages/Feed';
import CreatePost from './pages/CreatePost';
import Scripture from './pages/Scripture';
import Settings from './pages/Settings';
import Study from './pages/Study';
import BibleStudy from './pages/BibleStudy';
import CreateBibleStudyPlan from './pages/CreateBibleStudyPlan';
import BibleStudyPlanDetail from './pages/BibleStudyPlanDetail';
import ScheduleSession from './pages/ScheduleSession';
import BibleStudyRoom from './pages/BibleStudyRoom';
import UserProfile from './pages/UserProfile';
import PrayerBoard from './pages/PrayerBoard';
import Devotional from './pages/Devotional';
import Journal from './pages/Journal';
import Growth from './pages/Growth';
import BibleReading from './pages/BibleReading';
import Groups from './pages/Groups';
import LeaderDashboard from './pages/LeaderDashboard';
import AdminVerifications from './pages/AdminVerifications';
import LeaderPremium from './pages/LeaderPremium';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [checkingOnboard, setCheckingOnboard] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        const me = await base44.auth.me();
        setUser(me);
        // Show onboarding if is_leader has never been set
        if (me && me.is_leader === undefined || me && me.is_leader === null) {
          setNeedsOnboarding(true);
        }
      }
      setCheckingOnboard(false);
    }).catch(() => setCheckingOnboard(false));
  }, []);

  const handleOnboardingComplete = (isLeader) => {
    setNeedsOnboarding(false);
  };

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground font-inter">Loading Scripture Space...</p>
        </div>
      </div>
    );
  }

  if (needsOnboarding && !checkingOnboard) {
    return <LeaderOnboarding onComplete={handleOnboardingComplete} />;
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route element={<AppLayout />}>
          <Route path="/Home" element={
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <Home />
            </motion.div>
          } />
          <Route path="/Feed" element={
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <Feed />
            </motion.div>
          } />
          <Route path="/CreatePost" element={
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <CreatePost />
            </motion.div>
          } />
          <Route path="/Study" element={
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <Study />
            </motion.div>
          } />
          <Route path="/Scripture" element={
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <Scripture />
            </motion.div>
          } />
          <Route path="/Settings" element={
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <Settings />
            </motion.div>
          } />
          <Route path="/Groups" element={
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <Groups />
            </motion.div>
          } />
          <Route path="/LeaderDashboard" element={
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <LeaderDashboard />
            </motion.div>
          } />
          <Route path="/AdminVerifications" element={
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <AdminVerifications />
            </motion.div>
          } />
          <Route path="/LeaderPremium" element={
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <LeaderPremium />
            </motion.div>
          } />
          <Route path="/BibleStudy" element={
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <BibleStudy />
            </motion.div>
          } />
          <Route path="/CreateBibleStudyPlan" element={
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <CreateBibleStudyPlan />
            </motion.div>
          } />
          <Route path="/BibleStudyPlanDetail" element={
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <BibleStudyPlanDetail />
            </motion.div>
          } />
          <Route path="/ScheduleSession" element={
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <ScheduleSession />
            </motion.div>
          } />
          <Route path="/BibleStudyRoom" element={
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <BibleStudyRoom />
            </motion.div>
          } />
          <Route path="/UserProfile" element={
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <UserProfile />
            </motion.div>
          } />
          <Route path="/PrayerBoard" element={
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <PrayerBoard />
            </motion.div>
          } />
          <Route path="/Devotional" element={
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <Devotional />
            </motion.div>
          } />
          <Route path="/Journal" element={
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <Journal />
            </motion.div>
          } />
          <Route path="/Growth" element={
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <Growth />
            </motion.div>
          } />
          <Route path="/BibleReading" element={
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <BibleReading />
            </motion.div>
          } />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App