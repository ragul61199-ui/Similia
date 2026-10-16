import React from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

interface AndroidFrameProps {
  isMobileFrame: boolean;
  header?: React.ReactNode;
  children: React.ReactNode;
  bottomNav?: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  isMobileFrame,
  header,
  children,
  bottomNav,
}) => {
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (!isMobileFrame) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 transition-colors flex flex-col w-full overflow-x-hidden">
        {header}
        <div className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 min-w-0">
          {children}
        </div>
        {bottomNav}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900/90 py-2 sm:py-6 px-1 sm:px-2 flex justify-center items-center overflow-y-auto">
      {/* Android Device Shell */}
      <div className="relative w-full max-w-[420px] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-[44px] shadow-2xl border-[10px] border-slate-800 overflow-hidden flex flex-col h-[850px] max-h-[96vh] transition-colors">
        {/* Android Status Bar */}
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-5 pt-3 pb-2 flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 select-none z-30 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <span className="font-mono text-[11px]">{timeString}</span>

          {/* Camera Punchhole */}
          <div className="w-3.5 h-3.5 rounded-full bg-slate-900 ring-2 ring-slate-800/20" />

          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <BatteryMedium className="w-4 h-4" />
          </div>
        </div>

        {/* Top Header Docked in Phone */}
        {header && <div className="shrink-0 z-20">{header}</div>}

        {/* Scrollable Screen Content */}
        <div className="flex-1 overflow-y-auto relative overscroll-contain px-2.5 py-3">
          {children}
        </div>

        {/* Docked Bottom Navigation Bar inside Android phone */}
        {bottomNav && (
          <div className="shrink-0 z-30 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            {bottomNav}
          </div>
        )}

        {/* Android Gesture Bar */}
        <div className="h-3.5 flex items-center justify-center bg-white dark:bg-slate-900 shrink-0 pb-1">
          <div className="w-28 h-1 bg-slate-400 dark:bg-slate-600 rounded-full" />
        </div>
      </div>
    </div>
  );
};
