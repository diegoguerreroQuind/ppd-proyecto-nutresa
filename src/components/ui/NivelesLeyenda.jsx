import { useTheme } from "../../context/ThemeContext";

const NIVELES = [
  { nivel: "FALLO",       desc: "Sin registro de tiempo. Falla o cancelación del proceso." },
  { nivel: "CRÍTICO",     desc: "Supera media + 2σ (30d). Posible impacto operativo." },
  { nivel: "ADVERTENCIA", desc: "Supera media + 1.5σ (30d). Requiere monitoreo." },
  { nivel: "NORMAL",      desc: "Dentro de la banda esperada. Incluido por fallo." },
  { nivel: "RÁPIDO",      desc: "Por debajo de media − 1.5σ. Ejecución inusualmente rápida." },
];

const getNivelColors = (nivel, C) => {
  switch (nivel) {
    case "FALLO":
    case "CRÍTICO":      return { color: C.red,     bg: C.redBg,          bdr: C.redBdr };
    case "ADVERTENCIA":  return { color: C.amber,   bg: `${C.amber}18`,   bdr: `${C.amber}44` };
    case "RÁPIDO":       return { color: C.green,   bg: `${C.green}18`,   bdr: `${C.green}44` };
    default:             return { color: C.textSub, bg: `${C.border}88`,  bdr: C.border2 };
  }
};

export const NivelesLeyenda = () => {
  const { colors: C } = useTheme();

  return (
    <div
      className="px-5 py-4 flex flex-col gap-3"
      style={{ borderTop: `1px solid ${C.border}`, background: C.cardAlt }}
    >
      <p
        className="text-[11px] uppercase tracking-widest font-semibold m-0"
        style={{ color: C.textMuted }}
      >
        Significado de alertas
      </p>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}
      >
        {NIVELES.map(({ nivel, desc }) => {
          const { color, bg, bdr } = getNivelColors(nivel, C);
          return (
            <div
              key={nivel}
              className="flex items-start gap-2.5 rounded-lg p-2.5"
              style={{ background: bg, border: `1px solid ${bdr}` }}
            >
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded shrink-0 mt-0.5 uppercase tracking-wide"
                style={{ color, background: `${color}18`, border: `1px solid ${color}44` }}
              >
                {nivel}
              </span>
              <span className="text-[11px] leading-relaxed" style={{ color: C.textMuted }}>
                {desc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
