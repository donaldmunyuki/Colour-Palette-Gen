import React, { useRef, useEffect, useCallback } from 'react';
import { HSV } from '../types';
import { hexToHsv, hsvToHex, hexToRgb } from '../utils/color';
import { RotateCw, Check, Copy } from 'lucide-react';

interface ColorPicker2DProps {
  colorHex: string;
  onChange: (newHex: string) => void;
  onRandomize: () => void;
  darkMode: boolean;
}

export const ColorPicker2D: React.FC<ColorPicker2DProps> = ({
  colorHex,
  onChange,
  onRandomize,
  darkMode,
}) => {
  const [hsv, setHsv] = React.useState<HSV>(() => hexToHsv(colorHex));
  const [hexInput, setHexInput] = React.useState(colorHex);
  const [copied, setCopied] = React.useState(false);

  const svAreaRef = useRef<HTMLDivElement>(null);
  const hueSliderRef = useRef<HTMLDivElement>(null);
  const isDraggingSV = useRef(false);
  const isDraggingHue = useRef(false);

  // Sync internal HSV when external colorHex changes (unless user is actively dragging)
  useEffect(() => {
    if (!isDraggingSV.current && !isDraggingHue.current) {
      setHsv(hexToHsv(colorHex));
      setHexInput(colorHex);
    }
  }, [colorHex]);

  // Handle 2D Saturation / Value updates
  const updateSVFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      if (!svAreaRef.current) return;
      const rect = svAreaRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, clientY - rect.top));

      const s = Math.round((x / rect.width) * 100);
      const v = Math.round((1 - y / rect.height) * 100);

      const newHsv: HSV = { ...hsv, s, v };
      setHsv(newHsv);
      const nextHex = hsvToHex(newHsv);
      setHexInput(nextHex);
      onChange(nextHex);
    },
    [hsv, onChange]
  );

  // Handle 1D Hue updates
  const updateHueFromPointer = useCallback(
    (clientX: number) => {
      if (!hueSliderRef.current) return;
      const rect = hueSliderRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));

      const h = Math.round((x / rect.width) * 360) % 360;
      const newHsv: HSV = { ...hsv, h };
      setHsv(newHsv);
      const nextHex = hsvToHex(newHsv);
      setHexInput(nextHex);
      onChange(nextHex);
    },
    [hsv, onChange]
  );

  // Global pointer move / up listeners for drag
  useEffect(() => {
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (isDraggingSV.current) {
        updateSVFromPointer(clientX, clientY);
      } else if (isDraggingHue.current) {
        updateHueFromPointer(clientX);
      }
    };

    const handlePointerUp = () => {
      isDraggingSV.current = false;
      isDraggingHue.current = false;
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [updateSVFromPointer, updateHueFromPointer]);

  // Pointer down on SV box
  const handleSVPointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDraggingSV.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    updateSVFromPointer(clientX, clientY);
  };

  // Pointer down on Hue slider
  const handleHuePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDraggingHue.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    updateHueFromPointer(clientX);
  };

  // Direct Hex input change handler
  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setHexInput(val);
    const validHex = val.startsWith('#') ? val : `#${val}`;
    if (hexToRgb(validHex)) {
      onChange(validHex);
      setHsv(hexToHsv(validHex));
    }
  };

  const handleCopyHex = async () => {
    try {
      await navigator.clipboard.writeText(colorHex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // fallback
    }
  };

  // Calculate thumb positions
  const svThumbX = `${hsv.s}%`;
  const svThumbY = `${100 - hsv.v}%`;
  const hueThumbX = `${(hsv.h / 360) * 100}%`;

  return (
    <div
      className={`rounded-2xl p-5 border transition-colors ${
        darkMode
          ? 'bg-[#0B132B]/70 border-slate-800/80 shadow-lg'
          : 'bg-white border-slate-200/90 shadow-sm'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <span
          className={`font-semibold tracking-wide text-sm ${
            darkMode ? 'text-slate-200' : 'text-slate-800'
          }`}
        >
          Base Color
        </span>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRandomize}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all active:scale-95 ${
              darkMode
                ? 'bg-[#14203D] hover:bg-[#1A2A4F] text-slate-200 border-slate-700/60'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title="Generate random harmonious base color"
            aria-label="Randomize base color"
          >
            <RotateCw className="w-3.5 h-3.5 text-blue-400" />
            <span>Randomize</span>
          </button>

          {/* Quick Base Color Preview Square */}
          <div
            className="w-8 h-8 rounded-lg shadow-inner border border-white/20 transition-transform hover:scale-105"
            style={{ backgroundColor: colorHex }}
            title={`Active color: ${colorHex}`}
          />
        </div>
      </div>

      {/* 2D Saturation / Value Color Area */}
      <div
        ref={svAreaRef}
        onMouseDown={handleSVPointerDown}
        onTouchStart={handleSVPointerDown}
        className="w-full h-44 rounded-xl cursor-crosshair relative overflow-hidden select-none touch-none shadow-inner"
        style={{
          backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
        }}
        role="slider"
        aria-label="2D Saturation and Value Picker"
        tabIndex={0}
      >
        {/* White horizontal gradient (saturation) */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, #FFFFFF, transparent)',
          }}
        />
        {/* Black vertical gradient (value / brightness) */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, #000000, transparent)',
          }}
        />

        {/* Draggable Indicator Ring Thumb */}
        <div
          className="absolute w-6 h-6 rounded-full border-2 border-white pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 shadow-[0_0_6px_rgba(0,0,0,0.6)]"
          style={{
            left: svThumbX,
            top: svThumbY,
          }}
        />
      </div>

      {/* Rainbow Hue Slider */}
      <div className="mt-4">
        <div
          ref={hueSliderRef}
          onMouseDown={handleHuePointerDown}
          onTouchStart={handleHuePointerDown}
          className="w-full h-4 rounded-full cursor-pointer relative select-none touch-none shadow-inner border border-black/10 dark:border-white/10"
          style={{
            background:
              'linear-gradient(to right, #FF0000 0%, #FFFF00 17%, #00FF00 33%, #00FFFF 50%, #0000FF 67%, #FF00FF 83%, #FF0000 100%)',
          }}
          role="slider"
          aria-label="Hue Slider"
          tabIndex={0}
        >
          {/* Draggable Hue Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-2 border-white pointer-events-none shadow-[0_1px_4px_rgba(0,0,0,0.7)]"
            style={{
              left: hueThumbX,
              backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
            }}
          />
        </div>
      </div>

      {/* Swatch & Hex Input Row */}
      <div className="mt-4 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg shrink-0 shadow-inner border border-black/10 dark:border-white/20"
          style={{ backgroundColor: colorHex }}
        />

        <div
          className={`flex-1 flex items-center justify-between px-3 py-2 rounded-xl border text-sm font-mono tracking-wider transition-colors ${
            darkMode
              ? 'bg-[#101935] border-slate-700/70 text-slate-200 focus-within:border-blue-500'
              : 'bg-slate-50 border-slate-300 text-slate-800 focus-within:border-blue-500'
          }`}
        >
          <div className="flex items-center gap-1 w-full">
            <span className="text-slate-400 select-none">#</span>
            <input
              type="text"
              value={hexInput.replace('#', '')}
              onChange={(e) => handleHexInputChange(e)}
              maxLength={7}
              placeholder="15437F"
              className="bg-transparent uppercase w-full outline-none font-mono text-sm tracking-wider"
              aria-label="Hex color value"
            />
          </div>

          <button
            onClick={handleCopyHex}
            className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-slate-400 hover:text-slate-200"
            title="Copy Hex Code"
            aria-label="Copy Hex Code"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
