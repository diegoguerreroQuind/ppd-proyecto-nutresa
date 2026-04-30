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
  // Backgrounds — layered depth
  bg:        "#eef0f5",
  card:      "#ffffff",
  cardAlt:   "#f5f6fa",

  // Borders — visible but not aggressive
  border:    "#dde1ec",
  border2:   "#c8cdde",

  // Typography — high contrast hierarchy
  text:      "#0d1117",
  textSub:   "#374151",
  textMuted: "#6b7280",
  textDim:   "#9ca3af",

  // Brand accent colors — slightly deeper for light bg
  green:     "#059669",
  blue:      "#1d4ed8",
  amber:     "#b45309",
  purple:    "#6d28d9",
  teal:      "#0f766e",
  red:       "#b91c1c",

  // Alert backgrounds — soft tints
  redBg:     "#fff1f2",
  redBdr:    "#fecdd3",

  // Card shadow (light mode specific)
  shadow:    "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
  shadowMd:  "0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)",
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
