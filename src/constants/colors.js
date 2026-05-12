export const darkTheme = {
  // Backgrounds
  bg:        "#0d1117",
  card:      "#161b22",
  cardAlt:   "#21262d",

  // Borders
  border:    "#30363d",
  border2:   "#484f58",

  // Typography
  text:      "#c9d1d9",
  textSub:   "#8b949e",
  textMuted: "#6e7681",
  textDim:   "#484f58",

  // Accents
  green:     "#238636",
  blue:      "#1f6feb",
  amber:     "#d29922",
  purple:    "#8957e5",
  teal:      "#2ea043",
  red:       "#da3633",

  // Alertas
  redBg:     "#2a1111",
  redBdr:    "#671616",

  // Shadows
  shadow:    "none",
  shadowMd:  "none",
};

export const lightTheme = {
  // Backgrounds
  bg:        "#F3F7FA",
  card:      "#FFFFFF",
  cardAlt:   "#F2F5F8",

  // Borders
  border:    "#E2E8EF",
  border2:   "#CBD5E1",

  // Typography  — todos superan contraste WCAG AA sobre blanco
  text:      "#0F172A",   // 18:1  — slate-900
  textSub:   "#334155",   // 10:1  — slate-700
  textMuted: "#64748B",   // 4.7:1 — slate-500
  textDim:   "#94A3B8",   // 2.9:1 — slate-400 (solo para elementos desactivados)

  // Acentos — versiones oscuras para legibilidad sobre fondo claro
  green:     "#16A34A",   // 4.5:1 — green-600
  blue:      "#1D4ED8",   // 7.2:1 — blue-700  (acento primario del dashboard)
  amber:     "#B45309",   // 5.5:1 — amber-700
  purple:    "#7C3AED",   // 6.5:1 — violet-600
  teal:      "#0E7490",   // 6.3:1 — cyan-700
  red:       "#DC2626",   // 5.9:1 — red-600

  // Alert backgrounds
  redBg:     "#FFF1F2",
  redBdr:    "#FECDD3",

  // Sombras con tinte azul-frío para armonizar con el fondo
  shadow:    "0 1px 3px rgba(14,30,54,0.08), 0 1px 2px rgba(14,30,54,0.05)",
  shadowMd:  "0 4px 16px rgba(14,30,54,0.10), 0 2px 6px rgba(14,30,54,0.06)",
};

// Keep C as the default dark theme for backward compatibility
// Components that use useTheme() will get the correct theme
export const C = darkTheme;

export const ejColor = (ej, theme = darkTheme) =>
  ej === "EJ1" ? theme.blue : theme.amber;

export const nivelColorMap = (theme = darkTheme) => ({
  "FALLO":       theme.red,
  "CRÍTICO":     theme.red,
  "ADVERTENCIA": theme.amber,
  "RÁPIDO":      theme.green,
  "NORMAL":      theme.textSub,
});
