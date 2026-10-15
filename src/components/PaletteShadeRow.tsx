import React, { useState } from 'react';
import { PaletteShade, ColorBlindnessType } from '../types';
import { simulateColorBlindness, rgbToHex } from '../utils/color';
import { Copy, Check } from 'lucide-react';

interface PaletteShadeRowProps {
  shade: PaletteShade;
  darkMode: boolean;
  colorBlindness?: ColorBlindnessType;
  onCopyNotice: (hex: string) => void;
}

export const PaletteShadeRow: React.FC<PaletteShadeRowProps> = ({
  shade,
  darkMode,
  colorBlindness = 'normal',
  onCopyNotice,
}) => {
  const [copied, setCopied] = useState(false);

  const displayHex = shade.hex;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shade.hex);
      setCopied(true);
      onCopyNotice(shade.hex);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback
    }
  };

  // Metric bar percentages
  const hPercent = Math.min(100, Math.max(0, (shade.hsl.h / 360) * 100));
  const sPercent = Math.min(100, Math.max(0, shade.hsl.s));
  const lPercent = Math.min(100, Math.max(0, shade.hsl.l));

  return (
    <div
      className={`group flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 sm:gap-4 p-2.5 sm:px-4 sm:py-2.5 rounded-xl transition-all ${
        darkMode
          ? 'hover:bg-slate-800/40 text-slate-200'
          : 'hover:bg-slate-100/70 text-slate-800'
      }`}
    >
      {/* Left: Swatch + Step + Hex code */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Color Swatch */}
        <button
          onClick={handleCopy}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg shadow-sm shrink-0 border border-black/10 dark:border-white/10 relative transition-transform hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ backgroundColor: displayHex }}
          title={`Click to copy ${shade.hex}`}
          aria-label={`Copy shade ${shade.step} ${shade.hex}`}
        >
          {copied && (
            <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
          )}
        </button>

        {/* Step Number */}
        <span className="font-bold text-base sm:text-lg w-10 shrink-0 font-mono tabular-nums">
          {shade.step}
        </span>

        {/* Hex Code & Copy Button */}
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs sm:text-sm font-mono tracking-wide transition-colors ${
            darkMode
              ? 'hover:bg-slate-800 text-slate-300 hover:text-white'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
          title="Copy HEX"
          aria-label={`Copy HEX code ${shade.hex}`}
        >
          <span>{shade.hex}</span>
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-300" />
          )}
        </button>
      </div>

      {/* Right: H, S, L indicators with mini horizontal bars */}
      <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-end">
        {/* Hue Metric */}
        <div className="flex flex-col gap-1 w-14 sm:w-16">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>H</span>
            <span className="tabular-nums">{shade.hsl.h}</span>
          </div>
          <div className="h-1 w-full bg-slate-700/30 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${hPercent}%` }}
            />
          </div>
        </div>

        {/* Saturation Metric */}
        <div className="flex flex-col gap-1 w-14 sm:w-16">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>S</span>
            <span className="tabular-nums">{shade.hsl.s}</span>
          </div>
          <div className="h-1 w-full bg-slate-700/30 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${sPercent}%` }}
            />
          </div>
        </div>

        {/* Lightness Metric */}
        <div className="flex flex-col gap-1 w-14 sm:w-16">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>L</span>
            <span className="tabular-nums">{shade.hsl.l}</span>
          </div>
          <div className="h-1 w-full bg-slate-700/30 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${lPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
