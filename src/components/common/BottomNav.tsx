import React from 'react';
import { Users, CalendarClock, Package, ReceiptText } from 'lucide-react';

export type NavTab = 'patients' | 'followups' | 'inventory' | 'billing';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  followUpAlertCount?: number;
  lowStockAlertCount?: number;
  isMobileFrame?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  followUpAlertCount = 0,
  lowStockAlertCount = 0,
  isMobileFrame = false,
}) => {
  const tabs = [
    {
      id: 'patients' as NavTab,
      label: 'Patients',
      icon: Users,
      badge: 0,
    },
    {
      id: 'followups' as NavTab,
      label: 'Follow-ups',
      icon: CalendarClock,
      badge: followUpAlertCount,
      badgeColor: 'bg-amber-600',
    },
    {
      id: 'inventory' as NavTab,
      label: 'Medicines',
      icon: Package,
      badge: lowStockAlertCount,
      badgeColor: 'bg-rose-600',
    },
    {
      id: 'billing' as NavTab,
      label: 'Billing',
      icon: ReceiptText,
      badge: 0,
    },
  ];

  return (
    <nav
      className={`${
        isMobileFrame
          ? 'w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-all'
          : 'fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg transition-all'
      }`}
    >
      <div className="max-w-md mx-auto grid grid-cols-4 items-center h-14 sm:h-16 px-1 sm:px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 transition-all group min-h-[44px] ${
                isActive
                  ? 'font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              style={{ color: isActive ? 'var(--primary-color)' : undefined }}
            >
              {/* Icon Container with subtle pill highlight when active */}
              <div
                className={`relative flex items-center justify-center w-9 sm:w-10 h-6 sm:h-7 rounded-full transition-all ${
                  isActive
                    ? 'font-bold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
                style={{
                  backgroundColor: isActive ? 'var(--primary-light)' : undefined,
                  color: isActive ? 'var(--primary-color)' : undefined,
                }}
              >
                <Icon
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
                    isActive ? 'scale-105 stroke-[2.2]' : 'stroke-[1.8]'
                  }`}
                />

                {/* Badge alert for Follow-ups or Low stock */}
                {tab.badge > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 min-w-[16px] sm:min-w-[18px] h-4 sm:h-[18px] px-1 text-[9px] sm:text-[10px] font-black text-white rounded-full flex items-center justify-center shadow-2xs ${
                      tab.badgeColor || 'bg-teal-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] sm:text-[11px] tracking-tight mt-0.5 whitespace-nowrap leading-none ${
                  isActive ? 'font-bold' : 'font-medium text-slate-500 dark:text-slate-400'
                }`}
                style={{ color: isActive ? 'var(--primary-color)' : undefined }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
