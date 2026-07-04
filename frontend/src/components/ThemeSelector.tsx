import { THEMES, useTheme } from '../theme';

export function ThemeSelector() {
  const { theme, setTheme, themeConfig } = useTheme();

  return (
    <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3 py-2 text-xs font-medium text-white/85 shadow-[0_12px_30px_rgba(15,23,42,0.16)] backdrop-blur-xl">
      <span className="whitespace-nowrap uppercase tracking-[0.16em] text-white/50">Theme</span>
      <span
        aria-hidden="true"
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: themeConfig.accent }}
      />
      <select
        aria-label="Theme selector"
        value={theme}
        onChange={(e) => setTheme(e.target.value as typeof theme)}
        className="min-w-[7rem] cursor-pointer bg-transparent text-sm text-white outline-none"
      >
        {THEMES.map((entry) => (
          <option key={entry.name} value={entry.name} className="bg-slate-900 text-white">
            {entry.label}
          </option>
        ))}
      </select>
    </div>
  );
}
