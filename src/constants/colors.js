// Paleta principal del dashboard PPD — basada en identidad Quind
export const C = {
  bg:        "#080a0f",
  card:      "#0f1117",
  cardAlt:   "#0a0c12",
  border:    "#1e2130",
  border2:   "#2a2d3a",
  text:      "#e2e4ed",
  textSub:   "#8b8fa8",
  textMuted: "#4b5060",
  textDim:   "#3a3d4d",
  green:     "#00e5a0",
  blue:      "#3b82f6",
  amber:     "#f59e0b",
  purple:    "#a78bfa",
  teal:      "#34d399",
  red:       "#ef4444",
  redBg:     "#1c0a0a",
  redBdr:    "#7f1d1d",
};

// Color por tipo de ejecución
export const ejColor = (ej) => (ej === "6am" ? C.blue : C.amber);

// Colores semánticos para niveles de alerta
export const nivelColorMap = {
  CRÍTICO:     C.red,
  ADVERTENCIA: C.amber,
  RÁPIDO:      C.green,
  NORMAL:      C.textSub,
};
