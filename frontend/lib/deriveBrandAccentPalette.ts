// deriveBrandAccentPalette.ts
//
// The backend's visual-direction stage produces a written color mood
// description (e.g. "warm, optimistic, low-saturation"), not literal hex
// codes — Groq's text model isn't asked to invent swatch values. To give
// the brand kit book one real accent color "derived from the brand's
// generated palette" (per design brief), this scans that description for
// mood/color vocabulary and maps it to a curated hex value, then builds a
// small tonal ramp (tint / base / deep / ink) from that single hue so the
// kit has a cohesive, book-like palette rather than an arbitrary color.
//
// This is a deliberate design device, not a claim that these are "the"
// brand colors the AI specified — the kit's copy should frame it as a
// suggested palette direction, matching what the visual brief actually is.

interface KeywordToAccentEntry {
  keyword: string;
  accentHex: string;
}

// Curated, not default reds/blues — chosen to read as considered editorial
// choices for each mood word, in priority order (first match wins).
const KEYWORD_TO_ACCENT: KeywordToAccentEntry[] = [
  { keyword: "luxury", accentHex: "#5B3A29" },
  { keyword: "premium", accentHex: "#5B3A29" },
  { keyword: "sophisticated", accentHex: "#33322E" },
  { keyword: "trust", accentHex: "#1F4E5F" },
  { keyword: "professional", accentHex: "#2B3A42" },
  { keyword: "corporate", accentHex: "#2B3A42" },
  { keyword: "serious", accentHex: "#2B3A42" },
  { keyword: "tech", accentHex: "#3457D5" },
  { keyword: "digital", accentHex: "#3457D5" },
  { keyword: "academic", accentHex: "#4B3F72" },
  { keyword: "scholarly", accentHex: "#4B3F72" },
  { keyword: "playful", accentHex: "#C1447E" },
  { keyword: "youthful", accentHex: "#F2A541" },
  { keyword: "energetic", accentHex: "#C23B22" },
  { keyword: "bold", accentHex: "#C23B22" },
  { keyword: "vibrant", accentHex: "#E63946" },
  { keyword: "friendly", accentHex: "#E07A5F" },
  { keyword: "warm", accentHex: "#C1592A" },
  { keyword: "optimistic", accentHex: "#D98E3B" },
  { keyword: "bright", accentHex: "#F4A300" },
  { keyword: "natural", accentHex: "#5E7150" },
  { keyword: "organic", accentHex: "#5E7150" },
  { keyword: "earthy", accentHex: "#8A6D3B" },
  { keyword: "calm", accentHex: "#7C8B7A" },
  { keyword: "soft", accentHex: "#9C9384" },
  { keyword: "muted", accentHex: "#9C9384" },
  { keyword: "minimal", accentHex: "#3B3B38" },
  { keyword: "clean", accentHex: "#3B3B38" },
  { keyword: "cool", accentHex: "#2E5266" },
  { keyword: "dark", accentHex: "#22201D" },
];

const DEFAULT_ACCENT_HEX = "#3B4A3F"; // deep forest ink — deliberate fallback, not navy/black

function hexToHsl(hex: string): [number, number, number] {
  const sanitizedHex = hex.replace("#", "");
  const r = parseInt(sanitizedHex.slice(0, 2), 16) / 255;
  const g = parseInt(sanitizedHex.slice(2, 4), 16) / 255;
  const b = parseInt(sanitizedHex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hue = 0;
  let saturation = 0;
  const lightness = (max + min) / 2;

  if (max !== min) {
    const delta = max - min;
    saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    switch (max) {
      case r:
        hue = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        hue = ((b - r) / delta + 2) / 6;
        break;
      case b:
        hue = ((r - g) / delta + 4) / 6;
        break;
    }
  }
  return [hue * 360, saturation * 100, lightness * 100];
}

function hslToHex(hue: number, saturation: number, lightness: number): string {
  const s = saturation / 100;
  const l = lightness / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (hue < 60) [r, g, b] = [c, x, 0];
  else if (hue < 120) [r, g, b] = [x, c, 0];
  else if (hue < 180) [r, g, b] = [0, c, x];
  else if (hue < 240) [r, g, b] = [0, x, c];
  else if (hue < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (channel: number) =>
    Math.round((channel + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export interface BrandAccentPalette {
  tintHex: string;   // light wash — backgrounds, subtle highlights
  baseHex: string;   // the derived accent itself — primary use
  deepHex: string;   // darker variant — text-on-light, emphasis
  inkOnAccentHex: string; // near-white or near-black, for text placed on baseHex
}

export function deriveBrandAccentPalette(colorMoodDescription: string): BrandAccentPalette {
  const normalizedDescription = colorMoodDescription.toLowerCase();
  const matchedEntry = KEYWORD_TO_ACCENT.find((entry) =>
    normalizedDescription.includes(entry.keyword)
  );
  const baseHex = matchedEntry?.accentHex || DEFAULT_ACCENT_HEX;

  const [hue, saturation, lightness] = hexToHsl(baseHex);

  const tintHex = hslToHex(hue, Math.max(saturation - 25, 15), Math.min(lightness + 38, 94));
  const deepHex = hslToHex(hue, Math.min(saturation + 8, 100), Math.max(lightness - 18, 12));
  const inkOnAccentHex = lightness > 55 ? "#1A1A18" : "#FAFAF9";

  return { tintHex, baseHex, deepHex, inkOnAccentHex };
}
