import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import AppLayout from './components/layout/AppLayout';
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

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground font-inter">Loading BibleSocial...</p>
        </div>
      </div>
    );
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
    <Routes>
      <Route path="/" element={<Navigate to="/Home" replace />} />
      <Route element={<AppLayout />}>
        <Route path="/Home" element={<Home />} />
        <Route path="/Feed" element={<Feed />} />
        <Route path="/CreatePost" element={<CreatePost />} />
        <Route path="/Study" element={<Study />} />
        <Route path="/Scripture" element={<Scripture />} />
        <Route path="/Settings" element={<Settings />} />
        <Route path="/Groups" element={<Groups />} />
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
      <Route path="*" element={<PageNotFound />} />
    </Routes>
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