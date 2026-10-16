export type AccentColor = 'teal' | 'emerald' | 'blue' | 'indigo' | 'purple' | 'rose';

export interface ThemeColors {
  id: AccentColor;
  label: string;
  hex: string;
  hoverHex: string;
  lightHex: string;
  primary: string; // Tailwind class equivalent e.g. bg-teal-600
  primaryHover: string;
  lightBg: string;
  border: string;
  text: string;
  ring: string;
}

export const ACCENT_PRESETS: Record<AccentColor, ThemeColors> = {
  teal: {
    id: 'teal',
    label: 'Medical Teal',
    hex: '#0d9488',
    hoverHex: '#0f766e',
    lightHex: '#f0fdfa',
    primary: 'bg-teal-600',
    primaryHover: 'hover:bg-teal-700',
    lightBg: 'bg-teal-50 dark:bg-teal-950/40',
    border: 'border-teal-200 dark:border-teal-800',
    text: 'text-teal-700 dark:text-teal-300',
    ring: 'focus:ring-teal-600',
  },
  emerald: {
    id: 'emerald',
    label: 'Emerald Green',
    hex: '#059669',
    hoverHex: '#047857',
    lightHex: '#ecfdf5',
    primary: 'bg-emerald-600',
    primaryHover: 'hover:bg-emerald-700',
    lightBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-700 dark:text-emerald-300',
    ring: 'focus:ring-emerald-600',
  },
  blue: {
    id: 'blue',
    label: 'Royal Blue',
    hex: '#2563eb',
    hoverHex: '#1d4ed8',
    lightHex: '#eff6ff',
    primary: 'bg-blue-600',
    primaryHover: 'hover:bg-blue-700',
    lightBg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-300',
    ring: 'focus:ring-blue-600',
  },
  indigo: {
    id: 'indigo',
    label: 'Deep Indigo',
    hex: '#4f46e5',
    hoverHex: '#4338ca',
    lightHex: '#eef2ff',
    primary: 'bg-indigo-600',
    primaryHover: 'hover:bg-indigo-700',
    lightBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    border: 'border-indigo-200 dark:border-indigo-800',
    text: 'text-indigo-700 dark:text-indigo-300',
    ring: 'focus:ring-indigo-600',
  },
  purple: {
    id: 'purple',
    label: 'Holistic Purple',
    hex: '#9333ea',
    hoverHex: '#7e22ce',
    lightHex: '#faf5ff',
    primary: 'bg-purple-600',
    primaryHover: 'hover:bg-purple-700',
    lightBg: 'bg-purple-50 dark:bg-purple-950/40',
    border: 'border-purple-200 dark:border-purple-800',
    text: 'text-purple-700 dark:text-purple-300',
    ring: 'focus:ring-purple-600',
  },
  rose: {
    id: 'rose',
    label: 'Coral Rose',
    hex: '#e11d48',
    hoverHex: '#be123c',
    lightHex: '#fff1f2',
    primary: 'bg-rose-600',
    primaryHover: 'hover:bg-rose-700',
    lightBg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-200 dark:border-rose-800',
    text: 'text-rose-700 dark:text-rose-300',
    ring: 'focus:ring-rose-600',
  },
};

export function applyTheme(isDark: boolean, accent: AccentColor) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const body = document.body;

  if (isDark) {
    root.classList.add('dark');
    if (body) body.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    if (body) body.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
  }

  const theme = ACCENT_PRESETS[accent] || ACCENT_PRESETS.teal;
  root.style.setProperty('--primary-color', theme.hex);
  root.style.setProperty('--primary-hover', theme.hoverHex);
  root.style.setProperty('--primary-light', theme.lightHex);
}
