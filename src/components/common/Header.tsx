import React from 'react';
import { Smartphone, Monitor, Settings, Download, Plus, Moon, Sun } from 'lucide-react';
import { ClinicConfig } from '../../types';

interface HeaderProps {
  clinicConfig: ClinicConfig;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  onOpenNewPatient: () => void;
  onOpenSettings: () => void;
  onExportData: () => void;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  clinicConfig,
  isMobileFrame,
  onToggleMobileFrame,
  onOpenNewPatient,
  onOpenSettings,
  onExportData,
  onToggleTheme,
}) => {
  const isDark = clinicConfig.themeMode === 'dark';

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shrink-0">
      <div className="max-w-6xl mx-auto px-2.5 sm:px-4 py-2 flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Brand & Doctor Info */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {clinicConfig.clinicLogo ? (
            <img
              src={clinicConfig.clinicLogo}
              alt={clinicConfig.clinicName}
              className="w-8 h-8 rounded-lg object-contain bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 shrink-0 shadow-2xs"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-lg text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs"
              style={{ backgroundColor: 'var(--primary-color, #0d9488)' }}
            >
              {clinicConfig.clinicName?.charAt(0) || 'S'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight truncate">
              {clinicConfig.clinicName}
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight truncate">
              {clinicConfig.doctorName} · {clinicConfig.qualifications}
            </p>
          </div>
        </div>

        {/* Action Controls - Non-overlapping on mobile screens */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Theme Toggle (Dark / Light) */}
          <button
            type="button"
            onClick={onToggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-8 h-8 sm:w-9 sm:h-9 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center shrink-0"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Viewport Frame Toggle */}
          <button
            type="button"
            onClick={onToggleMobileFrame}
            title={isMobileFrame ? 'Switch to Desktop Full View' : 'Switch to Android Frame'}
            className="h-8 sm:h-9 px-2 sm:px-2.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 shrink-0"
          >
            {isMobileFrame ? (
              <>
                <Monitor className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span className="hidden sm:inline">Desktop</span>
              </>
            ) : (
              <>
                <Smartphone className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span className="hidden sm:inline">Android</span>
              </>
            )}
          </button>

          {/* Quick Backup/Export (visible on desktop) */}
          <button
            type="button"
            onClick={onExportData}
            title="Download Clinic Backup JSON"
            className="w-8 h-8 sm:w-9 sm:h-9 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors hidden md:flex items-center justify-center shrink-0"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Clinic Settings */}
          <button
            type="button"
            onClick={onOpenSettings}
            title="Clinic Profile & Visual Identity"
            className="w-8 h-8 sm:w-9 sm:h-9 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center shrink-0"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* New Patient Button */}
          <button
            type="button"
            onClick={onOpenNewPatient}
            className="h-8 sm:h-9 px-2 sm:px-2.5 text-xs font-semibold text-white active:scale-[0.98] rounded-lg transition-all shadow-sm flex items-center gap-1 shrink-0"
            style={{ backgroundColor: 'var(--primary-color, #0d9488)' }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Patient</span>
          </button>
        </div>
      </div>
    </header>
  );
};
