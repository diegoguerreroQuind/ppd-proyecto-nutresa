import { useTheme } from "../../../context/ThemeContext";
import { Card, SectionTitle } from "../../../components/ui";
import { fmtMin, avg } from "../../../utils/format";

export const HabilesVsFinSemana = ({ filtered, banda }) => {
  const { colors: C } = useTheme();

  return (
    <Card>
      <SectionTitle>Hábiles vs Fin de semana</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        {[false, true].map((esFinSemana) => {
          const grupo  = (filtered ?? []).filter((e) => e.es_fin_semana === esFinSemana);
          const color  = esFinSemana ? C.amber : C.blue;
          const prom   = avg(grupo.map((e) => e.total_min));
          const pico   = grupo.length ? Math.max(...grupo.map((e) => e.total_min)) : 0;
          const fallos = grupo.filter((e) => !e.exitoso).length;

          return (
            <div key={String(esFinSemana)} className="rounded-lg p-3.5" style={{ background: C.cardAlt }}>
              <p className="text-[13px] font-bold m-0 mb-2.5" style={{ color }}>
                {esFinSemana ? "Fin de semana" : "Días hábiles"}
              </p>
              {[
                ["Promedio",    fmtMin(prom)],
                ["Pico",        fmtMin(pico)],
                ["Ejecuciones", grupo.length],
                ["Fallos",      fallos],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between mb-1">
                  <span className="text-xs" style={{ color: C.textMuted }}>{label}</span>
                  <span
                    className="text-xs font-bold"
                    style={{ color: label === "Fallos" && value > 0 ? C.red : C.text }}
                  >
                    {value}
                  </span>
                </div>
              ))}
              <div className="mt-2 rounded h-2 overflow-hidden relative" style={{ background: C.border }}>
                <div
                  className="h-full rounded transition-[width] duration-500"
                  style={{ background: color, width: `${Math.min(100, (prom / (banda.critico || 1)) * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
