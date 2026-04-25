import { C } from "../../constants/colors";

// ─── Estilos de tabla compartidos ─────────────────────────────────────────────
export const tableStyles = {
  th: {
    padding:        "10px 14px",
    textAlign:      "left",
    color:          C.textDim,
    fontWeight:     600,
    fontSize:       11,
    textTransform:  "uppercase",
    letterSpacing:  0.5,
  },
  td: { padding: "11px 14px" },
  theadRow: { background: C.cardAlt },
};
