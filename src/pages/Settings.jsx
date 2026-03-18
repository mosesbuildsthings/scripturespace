import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useOutletContext } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, Monitor, AlignRight, AlignLeft, ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const THEME_COLORS = [
  { name: "Warm Earth", value: "25 45% 42%", preview: "hsl(25, 45%, 42%)" },
  { name: "Sage Green", value: "150 25% 40%", preview: "hsl(150, 25%, 40%)" },
  { name: "Dusty Rose", value: "350 30% 52%", preview: "hsl(350, 30%, 52%)" },
  { name: "Ocean Blue", value: "210 35% 45%", preview: "hsl(210, 35%, 45%)" },
  { name: "Lavender", value: "270 25% 52%", preview: "hsl(270, 25%, 52%)" },
  { name: "Golden Amber", value: "38 55% 48%", preview: "hsl(38, 55%, 48%)" },
  { name: "Deep Teal", value: "180 30% 38%", preview: "hsl(180, 30%, 38%)" },
  { name: "Soft Plum", value: "290 20% 45%", preview: "hsl(290, 20%, 45%)" },
  { name: "Terracotta", value: "15 50% 50%", preview: "hsl(15, 50%, 50%)" },
  { name: "Forest", value: "140 30% 35%", preview: "hsl(140, 30%, 35%)" },
  { name: "Slate", value: "220 15% 42%", preview: "hsl(220, 15%, 42%)" },
  { name: "Burgundy", value: "340 40% 38%", preview: "hsl(340, 40%, 38%)" },
];

const NAV_POSITIONS = [
  { value: "right", label: "Right", icon: AlignRight },
  { value: "left", label: "Left", icon: AlignLeft },
  { value: "bottom", label: "Bottom", icon: ArrowDown },
  { value: "top", label: "Top", icon: ArrowUp },
];

export default function Settings() {
  const context = useOutletContext();
  const [selectedColor, setSelectedColor] = useState("25 45% 42%");
  const [selectedNav, setSelectedNav] = useState("right");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const user = await base44.auth.me();
    if (user?.theme_color) setSelectedColor(user.theme_color);
    if (user?.nav_position) setSelectedNav(user.nav_position);
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    // Preview immediately
    document.documentElement.style.setProperty("--primary", color);
    document.documentElement.style.setProperty("--ring", color);
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({
      theme_color: selectedColor,
      nav_position: selectedNav,
    });

    if (context?.setNavPosition) context.setNavPosition(selectedNav);
    if (context?.setThemeColor) context.setThemeColor(selectedColor);
    if (context?.applyThemeColor) context.applyThemeColor(selectedColor);

    setSaving(false);
    toast.success("Settings saved! Refresh to see navigation changes.");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Personalize your experience</p>
      </div>

      {/* Theme Color */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Theme Color</CardTitle>
          <CardDescription>Choose a color that speaks to you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {THEME_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => handleColorSelect(color.value)}
                className={cn(
                  "relative w-full aspect-square rounded-xl transition-all duration-200 shadow-sm hover:scale-105",
                  selectedColor === color.value && "ring-2 ring-offset-2 ring-foreground scale-105"
                )}
                style={{ backgroundColor: color.preview }}
                title={color.name}
              >
                {selectedColor === color.value && (
                  <Check className="absolute inset-0 m-auto w-5 h-5 text-white drop-shadow" />
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Selected: {THEME_COLORS.find(c => c.value === selectedColor)?.name || "Custom"}
          </p>
        </CardContent>
      </Card>

      {/* Navigation Position */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Menu Position</CardTitle>
          <CardDescription>Choose where your navigation menu appears</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {NAV_POSITIONS.map((pos) => (
              <button
                key={pos.value}
                onClick={() => setSelectedNav(pos.value)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                  selectedNav === pos.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                )}
              >
                <pos.icon className={cn(
                  "w-5 h-5",
                  selectedNav === pos.value ? "text-primary" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-sm font-medium",
                  selectedNav === pos.value ? "text-primary" : "text-muted-foreground"
                )}>{pos.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl h-12 text-base">
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}