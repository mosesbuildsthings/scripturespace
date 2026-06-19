import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { base44 } from '@/api/base44Client';
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// Always eager — needed on first load
import AppLayout from './components/layout/AppLayout';
import LeaderOnboarding from './components/onboarding/LeaderOnboarding';
import Home from './pages/Home';

// Lazy-load all other pages — only fetched when navigated to
const Feed               = lazy(() => import('./pages/Feed'));
const CreatePost         = lazy(() => import('./pages/CreatePost'));
const Scripture          = lazy(() => import('./pages/Scripture'));
const Settings           = lazy(() => import('./pages/Settings'));
const Study              = lazy(() => import('./pages/Study'));
const BibleStudy         = lazy(() => import('./pages/BibleStudy'));
const CreateBibleStudyPlan  = lazy(() => import('./pages/CreateBibleStudyPlan'));
const BibleStudyPlanDetail  = lazy(() => import('./pages/BibleStudyPlanDetail'));
const ScheduleSession    = lazy(() => import('./pages/ScheduleSession'));
const BibleStudyRoom     = lazy(() => import('./pages/BibleStudyRoom'));
const UserProfile        = lazy(() => import('./pages/UserProfile'));
const PrayerBoard        = lazy(() => import('./pages/PrayerBoard'));
const Devotional         = lazy(() => import('./pages/Devotional'));
const Journal            = lazy(() => import('./pages/Journal'));
const Growth             = lazy(() => import('./pages/Growth'));
const BibleReading       = lazy(() => import('./pages/BibleReading'));
const Groups             = lazy(() => import('./pages/Groups'));
const LeaderDashboard    = lazy(() => import('./pages/LeaderDashboard'));
const AdminVerifications = lazy(() => import('./pages/AdminVerifications'));
const LeaderPremium      = lazy(() => import('./pages/LeaderPremium'));
const PrivacyPolicy      = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService     = lazy(() => import('./pages/TermsOfService'));

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

  // Tab roots never slide — only child/detail pages get a slide-in
  const TAB_ROOTS = ["/Home", "/Feed", "/Study", "/BibleStudy", "/Groups", "/UserProfile", "/Settings"];
  const isTabRoot = TAB_ROOTS.includes(location.pathname);

  const slideVariants = {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit:    { x: "-30%", opacity: 0 },
  };
  const tabVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit:    { opacity: 0 },
  };

  const PageLoader = () => (
    <div className="flex items-center justify-center py-20">
      <div className="w-7 h-7 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={location.pathname}
        variants={isTabRoot ? tabVariants : slideVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.15, ease: "easeOut" }}
        style={{ width: "100%", minHeight: "100%" }}
      >
    <Suspense fallback={<PageLoader />}>
    <Routes location={location}>
      <Route path="/" element={<Navigate to="/Home" replace />} />
      <Route element={<AppLayout />}>
        <Route path="/Home" element={<Home />} />
        <Route path="/Feed" element={<Feed />} />
        <Route path="/CreatePost" element={<CreatePost />} />
        <Route path="/Study" element={<Study />} />
        <Route path="/Scripture" element={<Scripture />} />
        <Route path="/Settings" element={<Settings />} />
        <Route path="/Groups" element={<Groups />} />
        <Route path="/LeaderDashboard" element={<LeaderDashboard />} />
        <Route path="/AdminVerifications" element={<AdminVerifications />} />
        <Route path="/LeaderPremium" element={<LeaderPremium />} />
        <Route path="/BibleStudy" element={<BibleStudy />} />
        <Route path="/CreateBibleStudyPlan" element={<CreateBibleStudyPlan />} />
        <Route path="/BibleStudyPlanDetail" element={<BibleStudyPlanDetail />} />
        <Route path="/ScheduleSession" element={<ScheduleSession />} />
        <Route path="/BibleStudyRoom" element={<BibleStudyRoom />} />
        <Route path="/UserProfile" element={<UserProfile />} />
        <Route path="/PrayerBoard" element={<PrayerBoard />} />
        <Route path="/Devotional" element={<Devotional />} />
        <Route path="/Journal" element={<Journal />} />
        <Route path="/Growth" element={<Growth />} />
        <Route path="/BibleReading" element={<BibleReading />} />
      </Route>
      <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
      <Route path="/TermsOfService" element={<TermsOfService />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </Suspense>
      </motion.div>
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