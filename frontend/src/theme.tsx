import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ProviderProps } from './types';

export type ThemeName =
  | 'apple'
  | 'monsoon'
  | 'tropical-air'
  | 'storm-watch'
  | 'heat-index'
  | 'rainglass'
  | 'tide-cloud'
  | 'terminal-forecast'
  | 'festival-sky'
  | 'clean-horizon'
  | 'sunrise'
  | 'night';

export interface ThemeConfig {
  name: ThemeName;
  label: string;
  accent: string;
}

const THEME_STORAGE_KEY = 'weather-starter-theme';

export const THEMES: ThemeConfig[] = [
  { name: 'apple', label: 'Apple', accent: '#f59e0b' },
  { name: 'monsoon', label: 'Monsoon Metro', accent: '#38bdf8' },
  { name: 'tropical-air', label: 'Tropical Air', accent: '#22c55e' },
  { name: 'storm-watch', label: 'Storm Watch', accent: '#facc15' },
  { name: 'heat-index', label: 'Heat Index', accent: '#fb923c' },
  { name: 'rainglass', label: 'Rainglass', accent: '#67e8f9' },
  { name: 'tide-cloud', label: 'Tide & Cloud', accent: '#7dd3fc' },
  { name: 'terminal-forecast', label: 'Terminal Forecast', accent: '#84cc16' },
  { name: 'festival-sky', label: 'Festival Sky', accent: '#c084fc' },
  { name: 'clean-horizon', label: 'Clean Horizon', accent: '#3b82f6' },
  { name: 'sunrise', label: 'Sunrise', accent: '#fb7185' },
  { name: 'night', label: 'Night', accent: '#22d3ee' },
];

interface ThemeValue {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  themeConfig: ThemeConfig;
}

const ThemeContext = createContext<ThemeValue | null>(null);

function isThemeName(value: string | null): value is ThemeName {
  return THEMES.some((theme) => theme.name === value);
}

export function ThemeProvider({ children }: ProviderProps) {
  const [theme, setTheme] = useState<ThemeName>('apple');

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemeName(stored)) setTheme(stored);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const value = useMemo<ThemeValue>(() => {
    const themeConfig = THEMES.find((entry) => entry.name === theme) ?? THEMES[0];
    return {
      theme,
      setTheme,
      themeConfig,
    };
  }, [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
