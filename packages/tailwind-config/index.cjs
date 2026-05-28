/* eslint-disable @typescript-eslint/no-var-requires */
const { fontFamily } = require('tailwindcss/defaultTheme');
const { default: flattenColorPalette } = require('tailwindcss/lib/util/flattenColorPalette');
const { BRAND } = require('@documenso/branding');

/**
 * Brand primary palette. Drives `brand-*` Tailwind classes used in emails
 * (where CSS variables don't resolve in clients, so we need literal hex values
 * baked into inline styles).
 */
const brandPrimaryScale = BRAND.colors.primaryScale ?? generateScale(BRAND.colors.primaryHex);

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['variant', '&:is(.dark:not(.dark-mode-disabled) *)'],
  content: ['src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
        signature: ['var(--font-signature)'],
      },
      zIndex: {
        9999: '9999',
      },
      aspectRatio: {
        'signature-pad': '16 / 7',
      },
      colors: {
        border: 'hsl(var(--border))',
        'field-border': 'hsl(var(--field-border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        'field-card': {
          DEFAULT: 'hsl(var(--field-card))',
          border: 'hsl(var(--field-card-border))',
          foreground: 'hsl(var(--field-card-foreground))',
        },
        widget: {
          DEFAULT: 'hsl(var(--widget))',
          foreground: 'hsl(var(--widget-foreground))',
        },
        // Legacy alias — old `text-documenso-*` classes still resolve. New
        // code should use `brand-*`. Both map to the active brand palette.
        documenso: {
          DEFAULT: BRAND.colors.primaryHex,
          ...brandPrimaryScale,
        },
        brand: {
          DEFAULT: BRAND.colors.primaryHex,
          foreground: BRAND.colors.primaryForegroundHsl
            ? `hsl(${BRAND.colors.primaryForegroundHsl})`
            : '#ffffff',
          ...brandPrimaryScale,
        },
        dawn: {
          DEFAULT: '#aaa89f',
          50: '#f8f8f8',
          100: '#f1f1ef',
          200: '#e6e5e2',
          300: '#d4d3cd',
          400: '#b9b7b0',
          500: '#aaa89f',
          600: '#88857a',
          700: '#706e65',
          800: '#5f5d55',
          900: '#52514a',
          950: '#2a2925',
        },
        water: {
          DEFAULT: '#d7e4f3',
          50: '#f3f6fb',
          100: '#e3ebf6',
          200: '#d7e4f3',
          300: '#abc7e5',
          400: '#82abd8',
          500: '#658ecc',
          600: '#5175bf',
          700: '#4764ae',
          800: '#3e538f',
          900: '#364772',
          950: '#252d46',
        },
        recipient: {
          green: 'hsl(var(--recipient-green))',
          blue: 'hsl(var(--recipient-blue))',
          purple: 'hsl(var(--recipient-purple))',
          orange: 'hsl(var(--recipient-orange))',
          yellow: 'hsl(var(--recipient-yellow))',
          pink: 'hsl(var(--recipient-pink))',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      borderRadius: {
        DEFAULT: 'calc(var(--radius) - 3px)',
        '2xl': 'calc(var(--radius) + 4px)',
        xl: 'calc(var(--radius) + 2px)',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
        'caret-blink': {
          '0%,70%,100%': { opacity: '1' },
          '20%,50%': { opacity: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'caret-blink': 'caret-blink 1.25s ease-out infinite',
      },
      screens: {
        '3xl': '1920px',
        '4xl': '2560px',
        '5xl': '3840px',
        print: { raw: 'print' },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/container-queries'),
    addVariablesForColors,
  ],
};

function addVariablesForColors({ addBase, theme }) {
  let allColors = flattenColorPalette(theme('colors'));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val]),
  );

  addBase({
    ':root': newVars,
  });
}

/**
 * Generate a 50–950 palette from a hex anchor. Mirrors
 * `packages/branding/src/palette.ts` — kept in sync intentionally because the
 * Tailwind config is CJS and can't import the TS helper directly.
 */
function generateScale(anchorHex) {
  const [h, s] = hexToHsl(anchorHex);
  const stops = [
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

function hexToHsl(hex) {
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

function hslToHex(h, s, l) {
  const sN = s / 100;
  const lN = l / 100;
  const k = (n) => (n + h / 30) % 12;
  const a = sN * Math.min(lN, 1 - lN);
  const f = (n) => {
    const v = lN - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(v * 255)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
