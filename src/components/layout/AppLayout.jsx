import React, { useState, useEffect, useCallback, memo } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Home, Rss, BookOpen, Mic2, Users, UserCircle, LogOut, Settings, ChevronRight, Crown, Sun, Moon, Monitor
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";

/* ─── Theme toggle (cycles: system → light → dark) ─── */
function useThemeToggle() {
  const getMode = () => {
    const stored = localStorage.getItem("bs_theme");
    if (stored) return stored;
    return "system";
  };
  const [mode, setMode] = useState(getMode);

  const apply = (m) => {
    const html = document.documentElement;
    if (m === "dark") html.classList.add("dark");
    else if (m === "light") html.classList.remove("dark");
    else {
      // system
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      html.classList.toggle("dark", prefersDark);
    }
  };

  useEffect(() => { apply(mode); }, [mode]);

  const toggle = async () => {
    const next = mode === "system" ? "light" : mode === "light" ? "dark" : "system";
    setMode(next);
    localStorage.setItem("bs_theme", next);
    apply(next);
    // Persist to user profile
    try {
      await base44.auth.updateMe({ dark_mode: next === "dark" ? true : next === "light" ? false : undefined });
    } catch (_) {}
  };

  return { mode, toggle };
}

const ThemeToggleBtn = memo(({ compact = false }) => {
  const { mode, toggle } = useThemeToggle();
  const Icon = mode === "dark" ? Moon : mode === "light" ? Sun : Monitor;
  const label = mode === "dark" ? "Dark" : mode === "light" ? "Light" : "System";
  return (
    <button
      onClick={toggle}
      title={`Theme: ${label}`}
      className={cn(
        "flex items-center gap-2 rounded-xl transition-all duration-200",
        compact
          ? "w-8 h-8 justify-center text-muted-foreground hover:text-foreground hover:bg-accent/60"
          : "px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 w-full"
      )}
    >
      <Icon className="w-[18px] h-[18px] shrink-0" />
      {!compact && <span>{label} Mode</span>}
    </button>
  );
});

const PRIMARY_NAV = [
  { path: "/Home",        icon: Home,      label: "Home"   },
  { path: "/Feed",        icon: Rss,       label: "Feed"   },
  { path: "/Study",       icon: BookOpen,  label: "Study"  },
  { path: "/BibleStudy",  icon: Mic2,      label: "Rooms"  },
  { path: "/Groups",      icon: Users,     label: "Groups" },
  { path: "/UserProfile", icon: UserCircle,label: "Profile"},
];

// A path is "active" if it exactly matches OR if the current path starts with it
// (handles nested pages like /BibleStudyPlanDetail, /BibleStudyRoom, etc.)
const isPathActive = (navPath, currentPath) => {
  if (navPath === "/Home") return currentPath === "/Home";
  return currentPath === navPath || currentPath.startsWith(navPath);
};

/* ─── Sidebar nav link ─── */
const SidebarLink = memo(({ item, isActive }) => (
  <Link
    to={item.path}
    className={cn(
      "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
      isActive
        ? "bg-gradient-to-r from-primary to-primary/85 text-primary-foreground shadow-[0_2px_14px_hsl(var(--primary)/0.40)]"
        : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
    )}
  >
    <item.icon className={cn("w-[18px] h-[18px] shrink-0 transition-transform duration-200", !isActive && "group-hover:scale-110")} />
    <span className="flex-1">{item.label}</span>
    {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
  </Link>
));

/* ─── Bottom tab item (44x44px minimum tap target) ─── */
const BottomTab = memo(({ item, isActive, onTabSelect }) => (
  <button
    onClick={(e) => {
      e.preventDefault();
      onTabSelect(item.path);
    }}
    className={cn(
      "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl w-11 h-11 transition-all duration-200 select-none touch-none",
      isActive
        ? "text-primary"
        : "text-muted-foreground active:text-foreground"
    )}
    aria-label={item.label}
    aria-current={isActive ? "page" : undefined}
  >
    <div className={cn(
      "flex items-center justify-center w-6 h-6 rounded-lg transition-all duration-200",
      isActive
        ? "bg-primary/12 shadow-[0_0_12px_hsl(var(--primary)/0.30)]"
        : ""
    )}>
      <item.icon className="w-5 h-5 select-none pointer-events-none" />
    </div>
    <span className={cn("text-[9px] font-medium leading-tight select-none pointer-events-none", isActive ? "text-primary" : "")}>{item.label}</span>
  </button>
));

/* ─── Sidebar ─── */
const Sidebar = memo(({ currentPath, side = "right", isLeader = false }) => (
  <aside className={cn(
    "hidden md:flex flex-col fixed top-0 bottom-0 w-60 z-50",
    "bg-card/80 backdrop-blur-2xl",
    side === "right"
      ? "right-0 border-l border-border/50 shadow-[-4px_0_32px_hsl(var(--foreground)/0.04)]"
      : "left-0 border-r border-border/50 shadow-[4px_0_32px_hsl(var(--foreground)/0.04)]"
  )}>
    {/* Brand */}
    <div className="px-5 py-5 border-b border-border/40 shrink-0">
      <div className="flex items-center gap-2.5">
        <img src="https://media.base44.com/images/public/69bade136722a0dcaf7f2a0e/480e392cd_ScriptureSpace_Icon_Only_App_256x256.png" alt="Scripture Space" className="w-8 h-8 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.15)]" />
        <span className="font-display font-bold text-base text-foreground tracking-tight">Scripture Space</span>
      </div>
    </div>

    {/* Nav */}
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 scrollbar-none">
      <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest px-4 mb-2">Navigation</p>
      {PRIMARY_NAV.map(item => (
        <SidebarLink key={item.path} item={item} isActive={isPathActive(item.path, currentPath)} />
      ))}
    </nav>

    {/* Footer actions */}
    <div className="px-3 py-4 border-t border-border/40 shrink-0 space-y-0.5">
      {isLeader && (
        <Link
          to="/LeaderDashboard"
          className={cn(
            "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
            currentPath === "/LeaderDashboard"
              ? "bg-gradient-to-r from-amber-500 to-amber-400 text-white shadow-[0_2px_12px_hsl(36,88%,50%/0.40)]"
              : "text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
          )}
        >
          <Crown className="w-[18px] h-[18px] shrink-0" />
          Leader Dashboard
        </Link>
      )}
      <Link
        to="/Settings"
        className={cn(
          "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
          currentPath === "/Settings"
            ? "bg-gradient-to-r from-primary to-primary/85 text-primary-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
        )}
      >
        <Settings className="w-[18px] h-[18px] shrink-0" />
        Settings
      </Link>
      <ThemeToggleBtn />
      <button
        onClick={() => base44.auth.logout()}
        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-all duration-200 select-none"
      >
        <LogOut className="w-[18px] h-[18px] shrink-0" />
        Sign Out
      </button>
    </div>
  </aside>
));

/* ─── Mobile top bar with theme toggle ─── */
const MobileTopBar = memo(() => (
  <div className={cn(
    "md:hidden fixed top-0 left-0 right-0 z-50",
    "bg-card/85 backdrop-blur-2xl border-b border-border/50",
    "shadow-[0_2px_12px_hsl(var(--foreground)/0.05)]",
    "flex items-center justify-between px-4 py-2.5",
    "pt-[env(safe-area-inset-top)]"
  )}>
    <div className="flex items-center gap-2">
      <img src="https://media.base44.com/images/public/69bade136722a0dcaf7f2a0e/480e392cd_ScriptureSpace_Icon_Only_App_256x256.png" alt="Scripture Space" className="w-6 h-6 rounded-lg shadow-sm" />
      <span className="font-display font-bold text-sm text-foreground">Scripture Space</span>
    </div>
    <ThemeToggleBtn compact />
  </div>
));

/* ─── Mobile bottom nav with persistent stacks ─── */
const BottomNav = memo(({ currentPath, onTabSelect }) => (
  <nav className={cn(
    "md:hidden fixed bottom-0 left-0 right-0 z-50 safe-bottom",
    "bg-card/85 backdrop-blur-2xl border-t border-border/50",
    "shadow-[0_-4px_24px_hsl(var(--foreground)/0.07)]"
  )}>
    <div className="flex items-center justify-around px-1 py-0.5 overscroll-none">
      {PRIMARY_NAV.map(item => (
        <BottomTab key={item.path} item={item} isActive={isPathActive(item.path, currentPath)} onTabSelect={onTabSelect} />
      ))}
    </div>
  </nav>
));

/* ─── Top nav bar (for top/bottom layout settings) ─── */
const TopNavBar = memo(({ currentPath }) => (
  <nav className="flex items-center justify-around px-2 py-1 overflow-x-auto scrollbar-none">
    {PRIMARY_NAV.map(item => (
      <BottomTab key={item.path} item={item} isActive={isPathActive(item.path, currentPath)} />
    ))}
  </nav>
));

export default function AppLayout() {
  const location = useLocation();
  const [navPosition, setNavPosition] = useState("right");
  const [themeColor, setThemeColor] = useState(null);
  const [isLeader, setIsLeader] = useState(false);
  const [displayPath, setDisplayPath] = useState(location.pathname);
  const [selectedTab, setSelectedTab] = useState(location.pathname);

  useEffect(() => { loadPreferences(); }, []);

  useEffect(() => {
    setDisplayPath(location.pathname);
    // Update selected tab based on current path
    const tabRoot = PRIMARY_NAV.find(nav => location.pathname.startsWith(nav.path));
    if (tabRoot) setSelectedTab(tabRoot.path);
  }, [location.pathname]);

  const loadPreferences = useCallback(async () => {
    const user = await base44.auth.me();
    if (user?.nav_position) setNavPosition(user.nav_position);
    if (["admin", "leader", "pastor"].includes(user?.role) || user?.is_leader === true) setIsLeader(true);
    if (user?.theme_color) {
      setThemeColor(user.theme_color);
      applyThemeColor(user.theme_color);
    }
    if (user?.dark_mode !== undefined) {
      document.documentElement.classList.toggle("dark", user.dark_mode);
    }
  }, []);

  const applyThemeColor = useCallback((color) => {
    if (!color) return;
    document.documentElement.style.setProperty("--primary", color);
    document.documentElement.style.setProperty("--ring", color);
    document.documentElement.style.setProperty("--glow-primary", color);
  }, []);

  const handleTabSelect = useCallback((tabPath) => {
    if (selectedTab === tabPath) {
      // Double-tap resets to root
      setDisplayPath(tabPath);
    }
    setSelectedTab(tabPath);
  }, [selectedTab]);

  const path = displayPath;
  const outletCtx = { navPosition, setNavPosition, themeColor, setThemeColor, applyThemeColor, isLeader };

  const topBarClass = "fixed top-0 left-0 right-0 z-50 bg-card/85 backdrop-blur-2xl border-b border-border/50 shadow-[0_4px_24px_hsl(var(--foreground)/0.05)]";

  if (navPosition === "bottom") {
    return (
      <div className="min-h-screen flex flex-col bg-background overscroll-none">
        <MobileTopBar />
        <main className="flex-1 overflow-y-auto pb-[4.5rem] pt-[44px] md:pt-0" style={{ overscrollBehavior: 'none' }}>
          <Outlet context={outletCtx} />
        </main>
        <BottomNav currentPath={path} onTabSelect={handleTabSelect} />
      </div>
    );
  }

  if (navPosition === "top") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className={topBarClass}>
          <div className="flex items-center justify-between pr-2">
            <TopNavBar currentPath={path} />
            <ThemeToggleBtn compact />
          </div>
        </div>
        <main className="flex-1 overflow-y-auto pt-[4.5rem]">
          <Outlet context={outletCtx} />
        </main>
      </div>
    );
  }

  if (navPosition === "left") {
    return (
      <div className="min-h-screen flex bg-background">
        <Sidebar currentPath={path} side="left" isLeader={isLeader} />
        <main className="flex-1 overflow-y-auto md:ml-60 pb-20 md:pb-0 pt-[44px] md:pt-0">
          <Outlet context={outletCtx} />
        </main>
        <MobileTopBar />
        <BottomNav currentPath={path} />
      </div>
    );
  }

  // Default: right
  return (
    <div className="min-h-screen flex bg-background">
      <main className="flex-1 overflow-y-auto md:mr-60 pb-20 md:pb-0 pt-[44px] md:pt-0" style={{ overscrollBehavior: 'none' }}>
        <Outlet context={outletCtx} />
      </main>
      <MobileTopBar />
      <Sidebar currentPath={path} side="right" isLeader={isLeader} />
      <BottomNav currentPath={path} onTabSelect={handleTabSelect} />
    </div>
  );
}