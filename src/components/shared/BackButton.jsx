import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Native-style back button for mobile child screens.
 * Shows on mobile, hides on desktop.
 * Ensures 44x44px minimum tap target.
 */
export default function BackButton({ 
  onBack = null, 
  showOnDesktop = false, 
  variant = 'ghost',
  className = '',
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Check if we're at a child page (not at root tab)
  const isChildPage = !['Home', 'Feed', 'Study', 'BibleStudy', 'Groups', 'UserProfile']
    .some(tab => location.pathname === `/${tab}`);

  if (!isChildPage && !showOnDesktop) return null;
  if (!isMobile && !showOnDesktop) return null;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleBack}
      aria-label="Go back"
      className={cn(
        'inline-flex items-center justify-center rounded-full',
        'touch:w-touch touch:h-touch w-9 h-9',
        'transition-all duration-200 active:scale-90',
        'text-muted-foreground hover:text-foreground',
        variant === 'ghost' && 'hover:bg-accent/60 active:bg-accent',
        variant === 'outline' && 'border border-input hover:bg-accent/40',
        className
      )}
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
  );
}