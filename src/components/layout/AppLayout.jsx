import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Users, Settings, PlusCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/Home", icon: Home, label: "Home" },
  { path: "/Feed", icon: Users, label: "Feed" },
  { path: "/CreatePost", icon: PlusCircle, label: "Post" },
  { path: "/Scripture", icon: BookOpen, label: "Scripture" },
  { path: "/Settings", icon: Settings, label: "Settings" },
];

export default function AppLayout() {
  const location = useLocation();
  const [navPosition, setNavPosition] = useState("right");
  const [themeColor, setThemeColor] = useState(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    const user = await base44.auth.me();
    if (user?.nav_position) setNavPosition(user.nav_position);
    if (user?.theme_color) {
      setThemeColor(user.theme_color);
      applyThemeColor(user.theme_color);
    }
  };

  const applyThemeColor = (color) => {
    if (!color) return;
    const root = document.documentElement;
    root.style.setProperty("--primary", color);
    root.style.setProperty("--ring", color);
  };

  const isActive = (path) => location.pathname === path;

  const navContent = (
    <nav className="flex flex-col gap-1 p-2">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
            isActive(item.path)
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <item.icon className="w-5 h-5" />
          <span className={cn(
            navPosition === "bottom" || navPosition === "top" ? "hidden sm:inline" : ""
          )}>{item.label}</span>
        </Link>
      ))}
    </nav>
  );

  const horizontalNavContent = (
    <nav className="flex items-center justify-center gap-1 p-2">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={cn(
            "flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200",
            isActive(item.path)
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <item.icon className="w-5 h-5" />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );

  if (navPosition === "bottom") {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 overflow-y-auto pb-24">
          <Outlet context={{ navPosition, setNavPosition, themeColor, setThemeColor, applyThemeColor }} />
        </main>
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t z-50">
          {horizontalNavContent}
        </div>
      </div>
    );
  }

  if (navPosition === "top") {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="sticky top-0 bg-card/95 backdrop-blur-md border-b z-50">
          {horizontalNavContent}
        </div>
        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ navPosition, setNavPosition, themeColor, setThemeColor, applyThemeColor }} />
        </main>
      </div>
    );
  }

  if (navPosition === "left") {
    return (
      <div className="min-h-screen flex">
        <div className="hidden md:flex w-56 flex-col fixed left-0 top-0 bottom-0 bg-card/95 backdrop-blur-md border-r z-50">
          <div className="p-4 border-b">
            <h1 className="text-lg font-display font-bold text-primary">BibleSocial</h1>
          </div>
          {navContent}
        </div>
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t z-50">
          {horizontalNavContent}
        </div>
        <main className="flex-1 md:ml-56 overflow-y-auto pb-20 md:pb-0">
          <Outlet context={{ navPosition, setNavPosition, themeColor, setThemeColor, applyThemeColor }} />
        </main>
      </div>
    );
  }

  // Default: right
  return (
    <div className="min-h-screen flex">
      <main className="flex-1 md:mr-56 overflow-y-auto pb-20 md:pb-0">
        <Outlet context={{ navPosition, setNavPosition, themeColor, setThemeColor, applyThemeColor }} />
      </main>
      <div className="hidden md:flex w-56 flex-col fixed right-0 top-0 bottom-0 bg-card/95 backdrop-blur-md border-l z-50">
        <div className="p-4 border-b">
          <h1 className="text-lg font-display font-bold text-primary">BibleSocial</h1>
        </div>
        {navContent}
      </div>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t z-50">
        {horizontalNavContent}
      </div>
    </div>
  );
}