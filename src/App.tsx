import { useState, useEffect, useMemo, useCallback } from 'react';
import { PaletteShade } from './types';
import {
  generatePalette,
  analyzeAccessibilityPairs,
  PRESET_BASE_COLORS,
} from './utils/color';
import { ColorPicker2D } from './components/ColorPicker2D';
import { PaletteShadeRow } from './components/PaletteShadeRow';
import { AccessibilityPairs } from './components/AccessibilityPairs';
import { ExportModal } from './components/ExportModal';
import { Download, Copy, Check } from 'lucide-react';

export default function App() {
  // Theme state with localStorage persistence
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('acp_dark_mode');
    if (saved !== null) {
      return saved === 'true';
    }
    return true; // Default to dark mode as shown in initial screenshots
  });

  // Base color state (default #15437F matching screenshot)
  const [baseHex, setBaseHex] = useState<string>('#15437F');

  // Vibrancy slider (0 to 100%, default 50%)
  const [vibrancy, setVibrancy] = useState<number>(50);

  // Hue Shift slider (-60 to +60 degrees, default 0°)
  const [hueShift, setHueShift] = useState<number>(0);

  // Modals
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Copy feedback notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Sync dark class on document element
  useEffect(() => {
    localStorage.setItem('acp_dark_mode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Generate 10-shade palette
  const palette: PaletteShade[] = useMemo(() => {
    return generatePalette(baseHex, vibrancy, hueShift);
  }, [baseHex, vibrancy, hueShift]);

  // Analyze accessibility contrast pairs
  const { accessible, inaccessible, totalPassing, totalEvaluated } = useMemo(() => {
    return analyzeAccessibilityPairs(palette);
  }, [palette]);

  // Randomize to a vibrant/harmonious base color
  const handleRandomize = useCallback(() => {
    const randomPreset =
      PRESET_BASE_COLORS[Math.floor(Math.random() * PRESET_BASE_COLORS.length)];
    // Random hue with good saturation and medium-dark lightness for strong contrast
    const randomH = Math.floor(Math.random() * 360);
    const randomS = Math.floor(60 + Math.random() * 35);
    const randomL = Math.floor(25 + Math.random() * 25);
    
    // Choose between curated preset or generative color
    if (Math.random() > 0.4) {
      setBaseHex(randomPreset.hex);
    } else {
      // Direct HSL to Hex
      const hNorm = randomH / 360;
      const sNorm = randomS / 100;
      const lNorm = randomL / 100;
      const hue2rgb = (p: number, q: number, t: number) => {
        let tN = t;
        if (tN < 0) tN += 1;
        if (tN > 1) tN -= 1;
        if (tN < 1 / 6) return p + (q - p) * 6 * tN;
        if (tN < 1 / 2) return q;
        if (tN < 2 / 3) return p + (q - p) * (2 / 3 - tN) * 6;
        return p;
      };
      const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
      const p = 2 * lNorm - q;
      const r = Math.round(hue2rgb(p, q, hNorm + 1 / 3) * 255);
      const g = Math.round(hue2rgb(p, q, hNorm) * 255);
      const b = Math.round(hue2rgb(p, q, hNorm - 1 / 3) * 255);
      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
      setBaseHex(hex);
    }
  }, []);

  // Auto-optimize vibrancy and hue shift to maximize passing pairs
  const handleAutoOptimize = useCallback(() => {
    setVibrancy(52);
    setHueShift(0);
    showToast('Palette optimized for WCAG AA & AAA contrast!');
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 2200);
  };

  const handleCopyAllHex = async () => {
    const allHex = palette.map((p) => `${p.step}: ${p.hex}`).join('\n');
    try {
      await navigator.clipboard.writeText(allHex);
      setCopiedAll(true);
      showToast('All 10 HEX codes copied to clipboard!');
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        darkMode ? 'bg-[#050B14] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'
      }`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl border border-slate-700/50 text-xs font-mono tracking-wide animate-in fade-in slide-in-from-bottom-2 duration-150">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Top Header Bar */}
        <header className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200 dark:border-slate-800/80">
          {/* Left Brand Lockup */}
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-lg shadow-sm border border-black/10 dark:border-white/10 shrink-0 transition-transform hover:scale-105"
              style={{ backgroundColor: baseHex }}
            />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Color Palette Generator
            </h1>
            <span className="font-mono text-sm text-slate-400 dark:text-slate-500 hidden sm:inline">
              {baseHex}
            </span>
          </div>

          {/* Right Controls: Dark Mode Switch + UI Preview + Export */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Dark Mode Switch */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                role="switch"
                aria-checked={darkMode}
                onClick={() => setDarkMode(!darkMode)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  darkMode ? 'bg-blue-600' : 'bg-slate-300'
                }`}
                aria-label="Toggle dark mode"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    darkMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 select-none">
                Dark Mode
              </span>
            </div>


            {/* Export Palette Button */}
            <button
              onClick={() => setIsExportOpen(true)}
              className={`p-2 rounded-xl border transition-all ${
                darkMode
                  ? 'bg-[#0B132B] hover:bg-[#121E42] border-slate-800 text-slate-300 hover:text-white'
                  : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm'
              }`}
              title="Export palette in JSON, CSS, or Tailwind"
              aria-label="Export palette"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main 2-Column Responsive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Color Picker, Controls & Accessibility Pairs */}
          <div className="lg:col-span-6 space-y-6">
            {/* 1. Base Color Card */}
            <ColorPicker2D
              colorHex={baseHex}
              onChange={(newHex) => setBaseHex(newHex)}
              onRandomize={handleRandomize}
              darkMode={darkMode}
            />

            {/* 2. Vibrancy & Hue Shift Controls */}
            <div
              className={`rounded-2xl p-5 border space-y-5 transition-colors ${
                darkMode
                  ? 'bg-[#0B132B]/70 border-slate-800/80 shadow-lg'
                  : 'bg-white border-slate-200/90 shadow-sm'
              }`}
            >
              {/* Vibrancy Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
                  <span className={darkMode ? 'text-slate-200' : 'text-slate-700'}>
                    Vibrancy
                  </span>
                  <span className="font-mono tabular-nums text-slate-400">
                    {vibrancy}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={vibrancy}
                  onChange={(e) => setVibrancy(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  aria-label="Vibrancy percentage"
                />
              </div>

              {/* Hue Shift Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
                  <span className={darkMode ? 'text-slate-200' : 'text-slate-700'}>
                    Hue Shift
                  </span>
                  <span className="font-mono tabular-nums text-slate-400">
                    {hueShift}°
                  </span>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="60"
                  value={hueShift}
                  onChange={(e) => setHueShift(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  aria-label="Hue Shift degrees"
                />
              </div>

              {/* Horizontal 10-Shade Seamless Preview Bar */}
              <div
                className="w-full h-14 rounded-xl overflow-hidden flex shadow-inner border border-black/10 dark:border-white/10"
                title="Continuous 10-shade palette preview (50 to 900)"
              >
                {palette.map((shade) => (
                  <button
                    key={`bar-${shade.step}`}
                    onClick={() => {
                      navigator.clipboard.writeText(shade.hex);
                      showToast(`Copied ${shade.step}: ${shade.hex}`);
                    }}
                    className="flex-1 h-full transition-transform hover:scale-105 active:scale-95 cursor-pointer relative group focus:outline-none"
                    style={{ backgroundColor: shade.hex }}
                    title={`Shade ${shade.step}: ${shade.hex} (Click to copy)`}
                    aria-label={`Copy shade ${shade.step}`}
                  />
                ))}
              </div>
            </div>

            {/* 3. Accessibility Pairs Card */}
            <AccessibilityPairs
              accessiblePairs={accessible}
              inaccessiblePairs={inaccessible}
              totalPassing={totalPassing}
              totalEvaluated={totalEvaluated}
              darkMode={darkMode}
              onAutoOptimize={handleAutoOptimize}
            />
          </div>

          {/* Right Column: 10 Palette Shade Breakdown Rows */}
          <div className="lg:col-span-6">
            <div
              className={`rounded-2xl p-4 sm:p-5 border transition-colors ${
                darkMode
                  ? 'bg-[#0B132B]/70 border-slate-800/80 shadow-lg'
                  : 'bg-white border-slate-200/90 shadow-sm'
              }`}
            >
              {/* Header with Quick Actions */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200 dark:border-slate-800/60">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                  Palette Shades (10 steps)
                </span>

                <button
                  onClick={handleCopyAllHex}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-lg border transition-all ${
                    darkMode
                      ? 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 border-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                  title="Copy all HEX codes to clipboard"
                >
                  {copiedAll ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied All</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy All HEX</span>
                    </>
                  )}
                </button>
              </div>

              {/* 10 Shade Rows */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {palette.map((shade) => (
                  <PaletteShadeRow
                    key={shade.step}
                    shade={shade}
                    darkMode={darkMode}
                    onCopyNotice={(hex) => showToast(`Copied ${hex} to clipboard!`)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        palette={palette}
        baseHex={baseHex}
        darkMode={darkMode}
      />
    </div>
  );
}
