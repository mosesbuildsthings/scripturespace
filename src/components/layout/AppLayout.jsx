import React, { useState, useEffect, useCallback, memo } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Home, BookOpen, Users, Settings, PlusCircle, GraduationCap,
  UserCircle, HandHeart, NotebookPen, TrendingUp, BookMarked, LogOut
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/Home", icon: Home, label: "Home" },
  { path: "/Feed", icon: Users, label: "Feed" },
  { path: "/CreatePost", icon: PlusCircle, label: "Post" },
  { path: "/Scripture", icon: BookOpen, label: "Scripture" },
  { path: "/BibleStudy", icon: GraduationCap, label: "Study" },
  { path: "/Devotional", icon: BookOpen, label: "Devotional" },
  { path: "/Journal", icon: NotebookPen, label: "Journal" },
  { path: "/Growth", icon: TrendingUp, label: "Growth" },
  { path: "/BibleReading", icon: BookMarked, label: "Reading" },
  { path: "/PrayerBoard", icon: HandHeart, label: "Prayer" },
  { path: "/UserProfile", icon: UserCircle, label: "Profile" },
  { path: "/Settings", icon: Settings, label: "Settings" },
];

// Memoized nav link to avoid re-renders
const NavLink = memo(({ item, isActive, vertical }) => (
  <Link
    to={item.path}
    className={cn(
      "flex items-center gap-3 rounded-xl font-medium transition-colors duration-150",
      vertical
        ? "px-4 py-2.5 text-sm"
        : "flex-col px-3 py-2 text-xs gap-1",
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    )}
  >
    <item.icon className="w-5 h-5 shrink-0" />
    <span className={vertical ? "" : ""}>{item.label}</span>
  </Link>
));

const SidebarNav = memo(({ currentPath, title }) => (
  <div className="flex flex-col h-full">
    <div className="p-4 border-b shrink-0">
      <h1 className="text-lg font-display font-bold text-primary">{title}</h1>
    </div>
    <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
      {NAV_ITEMS.map((item) => (
        <NavLink key={item.path} item={item} isActive={currentPath === item.path} vertical />
      ))}
    </nav>
    <div className="p-2 border-t shrink-0">
      <button
        onClick={() => base44.auth.logout()}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors duration-150"
      >
        <LogOut className="w-5 h-5 shrink-0" />
        Sign Out
      </button>
    </div>
  </div>
));

const BottomNav = memo(({ currentPath }) => (
  <nav className="flex items-center justify-around px-1 py-1 overflow-x-auto scrollbar-none">
    {NAV_ITEMS.map((item) => (
      <NavLink key={item.path} item={item} isActive={currentPath === item.path} vertical={false} />
    ))}
  </nav>
));

export default function AppLayout() {
  const location = useLocation();
  const [navPosition, setNavPosition] = useState("right");
  const [themeColor, setThemeColor] = useState(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = useCallback(async () => {
    const user = await base44.auth.me();
    if (user?.nav_position) setNavPosition(user.nav_position);
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
  }, []);

  const path = location.pathname;
  const outletCtx = { navPosition, setNavPosition, themeColor, setThemeColor, applyThemeColor };

  const sidebarClass = "hidden md:flex flex-col fixed top-0 bottom-0 w-56 bg-card/95 backdrop-blur-md border z-50";
  const mobileNavClass = "md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t z-50 safe-bottom";
  const topNavClass = "fixed top-0 left-0 right-0 bg-card/95 backdrop-blur-md border-b z-50";

  if (navPosition === "bottom") {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 overflow-y-auto" style={{ paddingBottom: "4.5rem" }}>
          <Outlet context={outletCtx} />
        </main>
        <div className={cn(topNavClass, "hidden")} />
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t z-50">
          <BottomNav currentPath={path} />
        </div>
      </div>
    );
  }

  if (navPosition === "top") {
    return (
      <div className="min-h-screen flex flex-col">
        <div className={topNavClass}>
          <BottomNav currentPath={path} />
        </div>
        <main className="flex-1 overflow-y-auto" style={{ paddingTop: "4.5rem" }}>
          <Outlet context={outletCtx} />
        </main>
      </div>
    );
  }

  if (navPosition === "left") {
    return (
      <div className="min-h-screen flex">
        <div className={cn(sidebarClass, "left-0 border-r")}>
          <SidebarNav currentPath={path} title="BibleSocial" />
        </div>
        <div className={mobileNavClass}>
          <BottomNav currentPath={path} />
        </div>
        <main className="flex-1 overflow-y-auto md:ml-56" style={{ paddingBottom: "0" }}>
          <div className="md:pb-0 pb-20">
            <Outlet context={outletCtx} />
          </div>
        </main>
      </div>
    );
  }

  // Default: right
  return (
    <div className="min-h-screen flex">
      <main className="flex-1 overflow-y-auto md:mr-56">
        <div className="pb-20 md:pb-0">
          <Outlet context={outletCtx} />
        </div>
      </main>
      <div className={cn(sidebarClass, "right-0 border-l")}>
        <SidebarNav currentPath={path} title="BibleSocial" />
      </div>
      <div className={mobileNavClass}>
        <BottomNav currentPath={path} />
      </div>
    </div>
  );
}