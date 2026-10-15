import React from 'react';
import { ContrastPair, ColorBlindnessType } from '../types';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface AccessibilityPairsProps {
  accessiblePairs: ContrastPair[];
  inaccessiblePairs: ContrastPair[];
  totalPassing: number;
  totalEvaluated: number;
  darkMode: boolean;
  colorBlindness?: ColorBlindnessType;
  onColorBlindnessChange?: (type: ColorBlindnessType) => void;
  onAutoOptimize?: () => void;
}

export const AccessibilityPairs: React.FC<AccessibilityPairsProps> = ({
  accessiblePairs,
  inaccessiblePairs,
  totalPassing,
  totalEvaluated,
  darkMode,
  onAutoOptimize,
}) => {
  return (
    <div
      className={`rounded-2xl p-5 border transition-colors ${
        darkMode
          ? 'bg-[#0B132B]/70 border-slate-800/80 shadow-lg'
          : 'bg-white border-slate-200/90 shadow-sm'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className={`font-semibold tracking-wide text-sm font-mono ${
              darkMode ? 'text-slate-200' : 'text-slate-800'
            }`}
          >
            Accessibility Pairs
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono tabular-nums text-slate-400">
            {totalPassing} passing / {totalEvaluated} total
          </span>

          {onAutoOptimize && (
            <button
              onClick={onAutoOptimize}
              className={`flex items-center px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
                darkMode
                  ? 'bg-blue-950/40 hover:bg-blue-900/40 text-blue-300 border-blue-800/60'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
              }`}
              title="Automatically tweak curve to maximize accessible pairs"
            >
              <span>Optimize</span>
            </button>
          )}
        </div>
      </div>

      {/* Accessible Combinations Section */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-2 text-xs font-mono font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" style={{ borderColor: '#16a34a' }} />
          <span style={{ color: '#16a34a' }}>Accessible Combinations</span>
        </div>

        <div
          className={`space-y-1.5 max-h-52 overflow-y-auto pr-1 rounded-xl border p-2 ${
            darkMode
              ? 'bg-[#061C18]/40 border-emerald-900/40 divide-y divide-emerald-950/20'
              : 'bg-emerald-50/50 border-emerald-200/70'
          }`}
        >
          {accessiblePairs.map((pair, idx) => (
            <div
              key={`acc-${pair.shade1.step}-${pair.shade2.step}-${idx}`}
              className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-emerald-950/40' : 'hover:bg-emerald-100/50'
              }`}
            >
              {/* Left: Swatch pair badges & label */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {/* Badge 1: bg shade1, text shade2 */}
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center font-bold text-[11px] shadow-sm border border-black/10 dark:border-white/10"
                    style={{ backgroundColor: pair.shade1.hex, color: pair.shade2.hex }}
                    title={`Background: ${pair.shade1.hex}, Text: ${pair.shade2.hex}`}
                  >
                    A
                  </div>
                  {/* Badge 2: bg shade2, text shade1 */}
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center font-bold text-[11px] shadow-sm border border-black/10 dark:border-white/10"
                    style={{ backgroundColor: pair.shade2.hex, color: pair.shade1.hex }}
                    title={`Background: ${pair.shade2.hex}, Text: ${pair.shade1.hex}`}
                  >
                    A
                  </div>
                </div>

                <span
                  className={`font-mono text-xs ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  {pair.shade1.step} + {pair.shade2.step}
                </span>
              </div>

              {/* Right: Ratio & Grade badge */}
              <div className="flex items-center gap-2.5">
                <span
                  className={`font-mono text-xs tabular-nums ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  {pair.ratio.toFixed(2)}:1
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                    pair.level === 'AAA'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-emerald-600/15 text-emerald-500 border border-emerald-600/20'
                  }`}
                >
                  {pair.level}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inaccessible Combinations Section */}
      <div>
        <div className="flex items-center gap-1.5 mb-2 text-xs font-mono font-medium">
          <AlertCircle className="w-4 h-4 text-rose-500" style={{ borderColor: '#dc2626' }} />
          <span style={{ color: '#dc2626' }}>Inaccessible Combinations</span>
        </div>

        <div
          className={`space-y-1.5 max-h-52 overflow-y-auto pr-1 rounded-xl border p-2 ${
            darkMode
              ? 'bg-[#240A10]/40 border-rose-900/40 divide-y divide-rose-950/20'
              : 'bg-rose-50/50 border-rose-200/70'
          }`}
        >
          {inaccessiblePairs.map((pair, idx) => (
            <div
              key={`inacc-${pair.shade1.step}-${pair.shade2.step}-${idx}`}
              className={`flex items-center justify-between p-2 rounded-lg transition-colors border ${
                darkMode ? 'hover:bg-rose-950/40' : 'hover:bg-rose-100/50'
              }`}
              style={{ borderWidth: '1px', borderColor: '#dc2626' }}
            >
              {/* Left: Swatch pair badges & label */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center font-bold text-[11px] shadow-sm border border-black/10 dark:border-white/10"
                    style={{ backgroundColor: pair.shade1.hex, color: pair.shade2.hex }}
                  >
                    A
                  </div>
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center font-bold text-[11px] shadow-sm border border-black/10 dark:border-white/10"
                    style={{ backgroundColor: pair.shade2.hex, color: pair.shade1.hex }}
                  >
                    A
                  </div>
                </div>

                <span
                  className={`font-mono text-xs ${
                    darkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {pair.shade1.step} + {pair.shade2.step}
                </span>
              </div>

              {/* Right: Ratio & Fail badge */}
              <div className="flex items-center gap-2.5">
                <span
                  className={`font-mono text-xs tabular-nums ${
                    darkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {pair.ratio.toFixed(2)}:1
                </span>
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-500/20 border border-rose-500/30"
                  style={{ color: '#dc2626' }}
                >
                  Fail
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
