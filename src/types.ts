export interface HSL {
  h: number; // 0 - 360
  s: number; // 0 - 100
  l: number; // 0 - 100
}

export interface HSV {
  h: number; // 0 - 360
  s: number; // 0 - 100
  v: number; // 0 - 100
}

export interface RGB {
  r: number; // 0 - 255
  g: number; // 0 - 255
  b: number; // 0 - 255
}

export type ShadeStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export interface PaletteShade {
  step: ShadeStep;
  hex: string;
  rgb: RGB;
  hsl: HSL;
  isBase?: boolean;
}

export type WCAGLevel = 'AAA' | 'AA' | 'AA Large' | 'Fail';

export interface ContrastPair {
  shade1: PaletteShade;
  shade2: PaletteShade;
  ratio: number;
  level: WCAGLevel;
  isAccessible: boolean;
}

export type ColorBlindnessType =
  | 'normal'
  | 'protanopia' // Red blind
  | 'deuteranopia' // Green blind
  | 'tritanopia' // Blue blind
  | 'achromatopsia'; // Complete color blindness (monochrome)
