import React, { useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Native-style select component for mobile WebView environments.
 * Uses a modal bottom sheet on mobile, standard dropdown on desktop.
 */
const NativeSelect = React.forwardRef(
  ({ value, onChange, children, className, label, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    if (!isMobile) {
      // Desktop: Use standard select styling
      return (
        <div className={cn('relative', className)}>
          <select
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              'w-full appearance-none text-sm border border-input rounded-lg px-3 py-2 bg-background text-foreground',
              'focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring',
              'cursor-pointer',
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      );
    }

    // Mobile: Render a native-style modal
    const selectedOption = React.Children.toArray(children).find(
      (child) => child.props.value === value
    );
    const selectedLabel = selectedOption?.props.children || 'Select...';

    return (
      <>
        {/* Trigger button */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={cn(
            'w-full text-sm border border-input rounded-lg px-3 py-2 bg-background text-foreground text-left',
            'flex items-center justify-between',
            'active:bg-accent/50 transition-colors',
            'min-h-[2.75rem]',
            className
          )}
        >
          <span>{selectedLabel}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </button>

        {/* Modal overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 z-50"
            onClick={() => setIsOpen(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 transition-opacity duration-200" />

            {/* Bottom sheet */}
            <div
              className={cn(
                'absolute bottom-0 left-0 right-0 z-50',
                'bg-card rounded-t-2xl border border-border',
                'shadow-[0_-4px_24px_rgba(0,0,0,0.15)]',
                'max-h-[80vh] flex flex-col',
                'safe-bottom'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle bar */}
              <div className="flex justify-center py-2 pt-3">
                <div className="w-12 h-1 bg-muted rounded-full" />
              </div>

              {/* Header */}
              {label && (
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                </div>
              )}

              {/* Options list */}
              <div className="overflow-y-auto flex-1 scrollbar-none">
                {React.Children.map(children, (child, idx) => {
                  if (!child || child.type !== 'option') return null;
                  const isSelected = child.props.value === value;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        onChange(child.props.value);
                        setIsOpen(false);
                      }}
                      className={cn(
                        'w-full text-left px-4 py-3 text-sm border-b border-border/50 last:border-0',
                        'active:bg-primary/10 transition-colors',
                        'min-h-[2.75rem] flex items-center',
                        isSelected && 'bg-primary/5 font-semibold text-primary'
                      )}
                    >
                      {child.props.children}
                      {isSelected && (
                        <span className="ml-auto text-primary">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Cancel button */}
              <div className="border-t border-border p-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'w-full px-4 py-2.5 rounded-lg font-medium text-sm',
                    'bg-muted text-foreground active:bg-muted/80',
                    'min-h-[2.75rem]'
                  )}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
);

NativeSelect.displayName = 'NativeSelect';

export { NativeSelect };