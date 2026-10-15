import React, { useState } from 'react';
import { PaletteShade } from '../types';
import {
  formatAsJson,
  formatAsCss,
  formatAsTailwind,
  formatAsCsv,
  formatAsSvg,
} from '../utils/color';
import { X, Copy, Check, Download, FileJson, Code, Palette, FileSpreadsheet } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  palette: PaletteShade[];
  baseHex: string;
  darkMode: boolean;
}

type TabType = 'json' | 'css' | 'tailwind' | 'svg' | 'csv';

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  palette,
  baseHex,
  darkMode,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('json');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getExportContent = () => {
    switch (activeTab) {
      case 'json':
        return formatAsJson(palette, baseHex);
      case 'css':
        return formatAsCss(palette);
      case 'tailwind':
        return formatAsTailwind(palette);
      case 'csv':
        return formatAsCsv(palette);
      case 'svg':
        return formatAsSvg(palette, baseHex);
      default:
        return '';
    }
  };

  const currentContent = getExportContent();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    const slug = baseHex.replace('#', '').toLowerCase();
    let filename = `palette-${slug}.json`;
    let mimeType = 'application/json';

    if (activeTab === 'css') {
      filename = `palette-${slug}.css`;
      mimeType = 'text/css';
    } else if (activeTab === 'tailwind') {
      filename = `tailwind-palette-${slug}.js`;
      mimeType = 'application/javascript';
    } else if (activeTab === 'csv') {
      filename = `palette-${slug}.csv`;
      mimeType = 'text/csv';
    } else if (activeTab === 'svg') {
      filename = `palette-${slug}.svg`;
      mimeType = 'image/svg+xml';
    }

    const blob = new Blob([currentContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'json', label: 'JSON', icon: <FileJson className="w-4 h-4" /> },
    { id: 'css', label: 'CSS Variables', icon: <Code className="w-4 h-4" /> },
    { id: 'tailwind', label: 'Tailwind CSS', icon: <Palette className="w-4 h-4" /> },
    { id: 'svg', label: 'SVG Swatches', icon: <Palette className="w-4 h-4" /> },
    { id: 'csv', label: 'CSV', icon: <FileSpreadsheet className="w-4 h-4" /> },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          darkMode ? 'bg-[#0B132B] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className="w-5 h-5 rounded border border-black/10 dark:border-white/20"
              style={{ backgroundColor: baseHex }}
            />
            <h2 className="font-semibold text-lg">Export Palette ({baseHex})</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 pt-4 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-lg transition-all border-b-2 -mb-[1px] whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-500 bg-blue-500/10'
                  : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/20'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Code Content Viewport */}
        <div className="p-6">
          <div
            className={`relative rounded-xl border p-4 max-h-80 overflow-y-auto font-mono text-xs leading-relaxed ${
              darkMode
                ? 'bg-[#060D1E] border-slate-800 text-slate-300'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <pre className="whitespace-pre-wrap select-all">{currentContent}</pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#070E22]/60">
          <span className="text-xs text-slate-400">
            WCAG 2.1 compliant tokens ready for production
          </span>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border transition-all active:scale-95 ${
                darkMode
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy to Clipboard</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
