import { HSL, HSV, RGB, ShadeStep, PaletteShade, ContrastPair, WCAGLevel, ColorBlindnessType } from '../types';

// Convert Hex to RGB
export function hexToRgb(hex: string): RGB | null {
  const cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return { r, g, b };
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return { r, g, b };
  }
  return null;
}

// Convert RGB to Hex
export function rgbToHex({ r, g, b }: RGB): string {
  const clampR = Math.max(0, Math.min(255, Math.round(r)));
  const clampG = Math.max(0, Math.min(255, Math.round(g)));
  const clampB = Math.max(0, Math.min(255, Math.round(b)));
  const hexR = clampR.toString(16).padStart(2, '0').toUpperCase();
  const hexG = clampG.toString(16).padStart(2, '0').toUpperCase();
  const hexB = clampB.toString(16).padStart(2, '0').toUpperCase();
  return `#${hexR}${hexG}${hexB}`;
}

// Convert RGB to HSL
export function rgbToHsl({ r, g, b }: RGB): HSL {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Convert HSL to RGB
export function hslToRgb({ h, s, l }: HSL): RGB {
  const hNorm = ((h % 360) + 360) % 360 / 360;
  const sNorm = Math.max(0, Math.min(100, s)) / 100;
  const lNorm = Math.max(0, Math.min(100, l)) / 100;

  if (sNorm === 0) {
    const val = Math.round(lNorm * 255);
    return { r: val, g: val, b: val };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    let tNorm = t;
    if (tNorm < 0) tNorm += 1;
    if (tNorm > 1) tNorm -= 1;
    if (tNorm < 1 / 6) return p + (q - p) * 6 * tNorm;
    if (tNorm < 1 / 2) return q;
    if (tNorm < 2 / 3) return p + (q - p) * (2 / 3 - tNorm) * 6;
    return p;
  };

  const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
  const p = 2 * lNorm - q;

  const r = Math.round(hue2rgb(p, q, hNorm + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, hNorm) * 255);
  const b = Math.round(hue2rgb(p, q, hNorm - 1 / 3) * 255);

  return { r, g, b };
}

// Convert RGB to HSV
export function rgbToHsv({ r, g, b }: RGB): HSV {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const diff = max - min;

  let h = 0;
  const s = max === 0 ? 0 : (diff / max) * 100;
  const v = max * 100;

  if (diff !== 0) {
    switch (max) {
      case rNorm:
        h = ((gNorm - bNorm) / diff) % 6;
        break;
      case gNorm:
        h = (bNorm - rNorm) / diff + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / diff + 4;
        break;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  return {
    h: Math.round(h),
    s: Math.round(s),
    v: Math.round(v),
  };
}

// Convert HSV to RGB
export function hsvToRgb({ h, s, v }: HSV): RGB {
  const hNorm = ((h % 360) + 360) % 360;
  const sNorm = Math.max(0, Math.min(100, s)) / 100;
  const vNorm = Math.max(0, Math.min(100, v)) / 100;

  const c = vNorm * sNorm;
  const x = c * (1 - Math.abs(((hNorm / 60) % 2) - 1));
  const m = vNorm - c;

  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (hNorm >= 0 && hNorm < 60) {
    rPrime = c;
    gPrime = x;
    bPrime = 0;
  } else if (hNorm >= 60 && hNorm < 120) {
    rPrime = x;
    gPrime = c;
    bPrime = 0;
  } else if (hNorm >= 120 && hNorm < 180) {
    rPrime = 0;
    gPrime = c;
    bPrime = x;
  } else if (hNorm >= 180 && hNorm < 240) {
    rPrime = 0;
    gPrime = x;
    bPrime = c;
  } else if (hNorm >= 240 && hNorm < 300) {
    rPrime = x;
    gPrime = 0;
    bPrime = c;
  } else {
    rPrime = c;
    gPrime = 0;
    bPrime = x;
  }

  return {
    r: Math.round((rPrime + m) * 255),
    g: Math.round((gPrime + m) * 255),
    b: Math.round((bPrime + m) * 255),
  };
}

// Convert HSV to Hex
export function hsvToHex(hsv: HSV): string {
  return rgbToHex(hsvToRgb(hsv));
}

// Convert Hex to HSV
export function hexToHsv(hex: string): HSV {
  const rgb = hexToRgb(hex) || { r: 21, g: 67, b: 127 };
  return rgbToHsv(rgb);
}

// WCAG 2.1 Relative Luminance calculation
export function getRelativeLuminance({ r, g, b }: RGB): number {
  const sRGB = [r / 255, g / 255, b / 255].map((val) => {
    return val <= 0.04045 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

// Contrast ratio between two colors (returns e.g. 16.33 for 16.33:1)
export function getContrastRatio(rgb1: RGB, rgb2: RGB): number {
  const lum1 = getRelativeLuminance(rgb1);
  const lum2 = getRelativeLuminance(rgb2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Determine WCAG Level
export function getWCAGLevel(ratio: number): WCAGLevel {
  if (ratio >= 7.0) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3.0) return 'AA Large';
  return 'Fail';
}

// Standard shade steps
export const SHADE_STEPS: ShadeStep[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

// Step definitions for target Lightness and base Saturation weights
const STEP_LIGHTNESS: Record<ShadeStep, number> = {
  50: 96,
  100: 90,
  200: 80,
  300: 70,
  400: 60,
  500: 50,
  600: 40,
  700: 30,
  800: 20,
  900: 10,
};

// Saturation curve multiplier per shade step
const STEP_SAT_WEIGHT: Record<ShadeStep, number> = {
  50: 0.40,
  100: 0.50,
  200: 0.80,
  300: 0.90,
  400: 1.00,
  500: 0.92,
  600: 0.94,
  700: 1.00,
  800: 0.95,
  900: 0.95,
};

/**
 * Generate 10-shade palette from base color, vibrancy, and hue shift.
 * - vibrancy: 0 to 100 (50 is neutral/balanced)
 * - hueShift: -60 to +60 degrees
 */
export function generatePalette(baseHex: string, vibrancy = 50, hueShift = 0): PaletteShade[] {
  const baseRgb = hexToRgb(baseHex) || { r: 21, g: 67, b: 127 };
  const baseHsl = rgbToHsl(baseRgb);

  // Vibrancy multiplier: at 50% = 1.0, at 0% = 0.2, at 100% = 1.6
  const vibrancyMultiplier = (vibrancy / 50);

  return SHADE_STEPS.map((step) => {
    // Lightness follows exact systematic progression
    const targetL = STEP_LIGHTNESS[step];

    // Saturation modulates with step curve & vibrancy
    const rawS = baseHsl.s * STEP_SAT_WEIGHT[step] * vibrancyMultiplier;
    // Cap saturation reasonably between 2 and 100
    const clampedS = Math.round(Math.max(2, Math.min(100, rawS)));

    // Hue shift progression: shifts smoothly from light tints to dark shades
    // Normalized step from -0.5 (step 50) to +0.5 (step 900)
    const stepOffset = (step - 500) / 450;
    const shiftedH = (baseHsl.h + hueShift * stepOffset + 360) % 360;
    const clampedH = Math.round(shiftedH);

    const shadeHsl: HSL = {
      h: clampedH,
      s: clampedS,
      l: targetL,
    };

    const shadeRgb = hslToRgb(shadeHsl);
    const shadeHex = rgbToHex(shadeRgb);

    return {
      step,
      hex: shadeHex,
      rgb: shadeRgb,
      hsl: shadeHsl,
    };
  });
}

/**
 * Analyze accessibility pairs across the 10 shades.
 * Typically compares high contrast pairings (e.g. 50 with 900, 800, 700, 600, etc. and low contrast fails).
 * Total 15 standard pairing evaluations matching the screenshot.
 */
export function analyzeAccessibilityPairs(palette: PaletteShade[]): {
  accessible: ContrastPair[];
  inaccessible: ContrastPair[];
  totalPassing: number;
  totalEvaluated: number;
} {
  const shadeMap = new Map<ShadeStep, PaletteShade>();
  palette.forEach((shade) => shadeMap.set(shade.step, shade));

  // The 15 canonical evaluation pairs between light backgrounds/dark texts and test combinations
  const pairTuples: [ShadeStep, ShadeStep][] = [
    [50, 900],
    [100, 900],
    [200, 900],
    [50, 700],
    [50, 800],
    [100, 800],
    [100, 700],
    [200, 800],
    [300, 900],
    [200, 500],
    [500, 700],
    [700, 900],
    [50, 200],
    [300, 600],
    [400, 500],
  ];

  const results: ContrastPair[] = pairTuples.map(([s1, s2]) => {
    const shade1 = shadeMap.get(s1)!;
    const shade2 = shadeMap.get(s2)!;
    const ratio = getContrastRatio(shade1.rgb, shade2.rgb);
    const level = getWCAGLevel(ratio);
    return {
      shade1,
      shade2,
      ratio: Math.round(ratio * 100) / 100,
      level,
      isAccessible: ratio >= 4.5, // WCAG AA for normal text
    };
  });

  const accessible = results
    .filter((p) => p.isAccessible)
    .sort((a, b) => b.ratio - a.ratio);

  const inaccessible = results
    .filter((p) => !p.isAccessible)
    .sort((a, b) => b.ratio - a.ratio);

  return {
    accessible,
    inaccessible,
    totalPassing: accessible.length,
    totalEvaluated: results.length,
  };
}

/**
 * Color Blindness Simulation (Brettel et al. matrix in linear RGB)
 */
export function simulateColorBlindness(rgb: RGB, type: ColorBlindnessType): RGB {
  if (type === 'normal') return rgb;

  // Convert sRGB to linear RGB
  const toLinear = (c: number) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const toSRGB = (v: number) => {
    const c = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(0, v), 1 / 2.4) - 0.055;
    return Math.max(0, Math.min(255, Math.round(c * 255)));
  };

  const lr = toLinear(rgb.r);
  const lg = toLinear(rgb.g);
  const lb = toLinear(rgb.b);

  let rSim = lr;
  let gSim = lg;
  let bSim = lb;

  switch (type) {
    case 'protanopia': // Red-blind
      rSim = 0.56667 * lr + 0.43333 * lg;
      gSim = 0.55833 * lr + 0.44167 * lg;
      bSim = 0.0 * lr + 0.24167 * lg + 0.75833 * lb;
      break;
    case 'deuteranopia': // Green-blind
      rSim = 0.625 * lr + 0.375 * lg;
      gSim = 0.70 * lr + 0.30 * lg;
      bSim = 0.0 * lr + 0.30 * lg + 0.70 * lb;
      break;
    case 'tritanopia': // Blue-blind
      rSim = 0.95 * lr + 0.05 * lg;
      gSim = 0.0 * lr + 0.43333 * lg + 0.56667 * lb;
      bSim = 0.0 * lr + 0.475 * lg + 0.525 * lb;
      break;
    case 'achromatopsia': // Complete monochromatic
      const gray = 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
      rSim = gray;
      gSim = gray;
      bSim = gray;
      break;
  }

  return {
    r: toSRGB(rSim),
    g: toSRGB(gSim),
    b: toSRGB(bSim),
  };
}

// Export formatters
export function formatAsJson(palette: PaletteShade[], baseHex: string): string {
  const shadesObj: Record<string, { hex: string; rgb: string; hsl: string }> = {};
  palette.forEach((p) => {
    shadesObj[p.step.toString()] = {
      hex: p.hex,
      rgb: `rgb(${p.rgb.r}, ${p.rgb.g}, ${p.rgb.b})`,
      hsl: `hsl(${p.hsl.h}, ${p.hsl.s}%, ${p.hsl.l}%)`,
    };
  });

  return JSON.stringify(
    {
      name: 'Accessible Color Palette',
      baseColor: baseHex,
      shades: shadesObj,
      wcagCompliance: {
        standards: 'WCAG 2.1 AA / AAA',
        generatedAt: new Date().toISOString(),
      },
    },
    null,
    2
  );
}

export function formatAsCss(palette: PaletteShade[]): string {
  const lines = palette.map((p) => `  --color-primary-${p.step}: ${p.hex};`);
  return `:root {\n${lines.join('\n')}\n}`;
}

export function formatAsTailwind(palette: PaletteShade[]): string {
  const lines = palette.map((p) => `      ${p.step}: '${p.hex}',`);
  return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        primary: {\n${lines.join('\n')}\n        }\n      }\n    }\n  }\n};`;
}

export function formatAsCsv(palette: PaletteShade[]): string {
  const header = 'Step,HEX,RGB,HSL';
  const rows = palette.map(
    (p) => `${p.step},${p.hex},"rgb(${p.rgb.r}, ${p.rgb.g}, ${p.rgb.b})","hsl(${p.hsl.h}, ${p.hsl.s}%, ${p.hsl.l}%)"`
  );
  return [header, ...rows].join('\n');
}

export function formatAsSvg(palette: PaletteShade[], baseHex: string): string {
  const width = 1000;
  const height = 240;
  const swatchWidth = width / palette.length;

  const rects = palette
    .map((p, i) => {
      const textColor = p.step <= 400 ? '#0F172A' : '#FFFFFF';
      return `
    <g transform="translate(${i * swatchWidth}, 0)">
      <rect width="${swatchWidth}" height="${height - 60}" fill="${p.hex}" />
      <text x="${swatchWidth / 2}" y="${height - 80}" fill="${textColor}" font-family="monospace" font-size="14" font-weight="bold" text-anchor="middle">${p.step}</text>
      <text x="${swatchWidth / 2}" y="${height - 25}" fill="#334155" font-family="monospace" font-size="12" text-anchor="middle">${p.hex}</text>
    </g>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="#FFFFFF" rx="8" />
  ${rects}
</svg>`;
}

// Popular curated harmonious base color presets
export const PRESET_BASE_COLORS = [
  { name: 'Royal Blue (Default)', hex: '#15437F' },
  { name: 'Electric Indigo', hex: '#4F46E5' },
  { name: 'Teal Forest', hex: '#0D9488' },
  { name: 'Emerald Jewel', hex: '#059669' },
  { name: 'Amber Solar', hex: '#D97706' },
  { name: 'Crimson Rose', hex: '#E11D48' },
  { name: 'Deep Violet', hex: '#7C3AED' },
  { name: 'Slate Steel', hex: '#334155' },
];
