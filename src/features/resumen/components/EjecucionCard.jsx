import { useTheme } from "../../../context/ThemeContext";
import { ejColor as ejColorFn } from "../../../constants/colors";
import { Card, SectionTitle } from "../../../components/ui";
import { fmtMin } from "../../../utils/format";

export const EjecucionCard = ({ ej, kpis }) => {
  const { colors: C, theme } = useTheme();
  const d7  = kpis[ej]?.["7d"]  ?? {};
  const d30 = kpis[ej]?.["30d"] ?? {};
  const clr = ejColorFn(ej, C);

  const stats = [
    { l: "Promedio", v: fmtMin(d7.prom), color: ej === "EJ1" ? C.blue : C.amber },
    { l: "Mínimo",   v: fmtMin(d7.min),  color: C.green },
    { l: "Máximo",   v: fmtMin(d7.max),  color: C.red   },
    { l: "Fallos",   v: d7.fallos ?? 0,  color: d7.fallos > 0 ? C.red : C.green },
  ];

  const prom7  = d7.prom  ?? 0;
  const prom30 = d30.prom ?? 0;
  const boxBg  = theme === "light" ? (ej === "EJ1" ? "#EEF2FD" : "#FEF3E2") : C.cardAlt;

  return (
    <Card style={{ borderLeft: `3px solid ${clr}`, boxShadow: C.shadow ?? "none" }}>
      <SectionTitle color={clr}>Ejecución {ej} — Últimos 7 días</SectionTitle>
      <div className="grid grid-cols-3 gap-2.5 mb-3.5">
        {stats.map((stat) => (
          <div key={stat.l} className="text-center rounded-lg py-2.5 px-1.5" style={{ background: boxBg }}>
            <p className="text-[9px] m-0 mb-[3px] uppercase" style={{ color: C.textMuted }}>{stat.l}</p>
            <p className="text-base font-bold m-0" style={{ color: stat.color }}>{stat.v}</p>
          </div>
        ))}
      </div>
      <div className="pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
        <p className="text-[10px] m-0 mb-1.5 uppercase" style={{ color: C.textMuted }}>vs 30 días</p>
        <div className="flex gap-2.5">
          <span className="text-xs" style={{ color: C.textSub }}>
            Prom 30d: <strong style={{ color: clr }}>{fmtMin(prom30)}</strong>
          </span>
          <span className="text-xs" style={{ color: prom7 > prom30 ? C.red : C.green }}>
            {prom7 > prom30 ? "↑" : "↓"} {fmtMin(Math.abs(prom7 - prom30))}
          </span>
        </div>
      </div>
    </Card>
  );
};
