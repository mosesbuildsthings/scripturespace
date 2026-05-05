import React, { useState, useEffect, useCallback, memo } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Home, Rss, BookOpen, Mic2, Users, UserCircle, LogOut, Settings, ChevronRight, Crown
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";

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

/* ─── Bottom tab item ─── */
const BottomTab = memo(({ item, isActive }) => (
  <Link
    to={item.path}
    className={cn(
      "flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl min-w-[52px] transition-all duration-200",
      isActive
        ? "text-primary"
        : "text-muted-foreground hover:text-foreground"
    )}
  >
    <div className={cn(
      "flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200",
      isActive
        ? "bg-primary/12 shadow-[0_0_12px_hsl(var(--primary)/0.30)]"
        : "group-hover:bg-accent/50"
    )}>
      <item.icon className="w-[18px] h-[18px]" />
    </div>
    <span className={cn("text-[10px] font-medium leading-none", isActive ? "text-primary" : "")}>{item.label}</span>
  </Link>
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
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-[0_2px_10px_hsl(var(--primary)/0.45)]">
          <BookOpen className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-display font-bold text-base text-foreground tracking-tight">BibleSocial</span>
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
      <button
        onClick={() => base44.auth.logout()}
        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-all duration-200"
      >
        <LogOut className="w-[18px] h-[18px] shrink-0" />
        Sign Out
      </button>
    </div>
  </aside>
));

/* ─── Mobile bottom nav ─── */
const BottomNav = memo(({ currentPath }) => (
  <nav className={cn(
    "md:hidden fixed bottom-0 left-0 right-0 z-50 safe-bottom",
    "bg-card/85 backdrop-blur-2xl border-t border-border/50",
    "shadow-[0_-4px_24px_hsl(var(--foreground)/0.07)]"
  )}>
    <div className="flex items-center justify-around px-2 py-1">
      {PRIMARY_NAV.map(item => (
        <BottomTab key={item.path} item={item} isActive={isPathActive(item.path, currentPath)} />
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

  useEffect(() => { loadPreferences(); }, []);

  const loadPreferences = useCallback(async () => {
    const user = await base44.auth.me();
    if (user?.nav_position) setNavPosition(user.nav_position);
    if (["admin", "leader", "pastor"].includes(user?.role)) setIsLeader(true);
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

  const path = location.pathname;
  const outletCtx = { navPosition, setNavPosition, themeColor, setThemeColor, applyThemeColor, isLeader };

  const topBarClass = "fixed top-0 left-0 right-0 z-50 bg-card/85 backdrop-blur-2xl border-b border-border/50 shadow-[0_4px_24px_hsl(var(--foreground)/0.05)]";

  if (navPosition === "bottom") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-1 overflow-y-auto pb-[4.5rem]">
          <Outlet context={outletCtx} />
        </main>
        <div className={cn("fixed bottom-0 left-0 right-0 z-50 safe-bottom bg-card/85 backdrop-blur-2xl border-t border-border/50 shadow-[0_-4px_24px_hsl(var(--foreground)/0.07)]")}>
          <TopNavBar currentPath={path} />
        </div>
      </div>
    );
  }

  if (navPosition === "top") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className={topBarClass}>
          <TopNavBar currentPath={path} />
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
        <main className="flex-1 overflow-y-auto md:ml-60 pb-20 md:pb-0">
          <Outlet context={outletCtx} />
        </main>
        <BottomNav currentPath={path} />
      </div>
    );
  }

  // Default: right
  return (
    <div className="min-h-screen flex bg-background">
      <main className="flex-1 overflow-y-auto md:mr-60 pb-20 md:pb-0">
        <Outlet context={outletCtx} />
      </main>
      <Sidebar currentPath={path} side="right" isLeader={isLeader} />
      <BottomNav currentPath={path} />
    </div>
  );
}