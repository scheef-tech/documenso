import { PROFILE } from './profile';

/**
 * Generate a 50–950 Tailwind palette from a hex anchor. Returns the explicit
 * scale if one is provided on the profile; otherwise computes a perceptual
 * lightness ramp around the anchor.
 *
 * Tailwind config (CJS) imports this via the `.cjs` shim; emails import the TS
 * export directly.
 */
export function getPrimaryScale(): Record<string, string> {
  if (PROFILE.colors.primaryScale) {
    return PROFILE.colors.primaryScale;
  }
  return generateScale(PROFILE.colors.primaryHex);
}

export function getPrimaryHex(): string {
  return PROFILE.colors.primaryHex;
}

export function getPrimaryHsl(): string {
  return PROFILE.colors.primaryHsl;
}

export function getPrimaryForegroundHsl(): string {
  return PROFILE.colors.primaryForegroundHsl;
}

function hexToHsl(hex: string): [number, number, number] {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.slice(0, 2), 16) / 255;
  const g = parseInt(cleaned.slice(2, 4), 16) / 255;
  const b = parseInt(cleaned.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return [h, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  const sN = s / 100;
  const lN = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sN * Math.min(lN, 1 - lN);
  const f = (n: number) => {
    const v = lN - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(v * 255)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function generateScale(anchorHex: string): Record<string, string> {
  const [h, s] = hexToHsl(anchorHex);
  const stops: Array<[string, number]> = [
    ['50', 97],
    ['100', 94],
    ['200', 86],
    ['300', 77],
    ['400', 66],
    ['500', 50],
    ['600', 42],
    ['700', 35],
    ['800', 28],
    ['900', 22],
    ['950', 14],
  ];
  return Object.fromEntries(stops.map(([key, l]) => [key, hslToHex(h, s, l)]));
}
