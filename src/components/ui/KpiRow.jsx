import { KpiCard } from "./index";
import { fmtMin, fmtM } from "../../utils/format";
import { C } from "../../constants/colors";

/**
 * KpiRow
 *
 * Muestra los 8 KPIs principales.
 * Recibe kpis (por ejecución y ventana) y banda (tolerancia estadística).
 * No calcula nada: solo formatea y presenta.
 */
export const KpiRow = ({ kpis, banda }) => {
  const fallos7d = kpis["6am"]["7d"].fallos + kpis["2pm"]["7d"].fallos;
  const maxReg30d = Math.max(kpis["6am"]["30d"].maxReg, kpis["2pm"]["30d"].maxReg);

  const cards = [
    { label: "Ejec. 6am · 7 días",   value: fmtMin(kpis["6am"]["7d"].prom),  sub: `Tasa éxito: ${kpis["6am"]["7d"].tasa}%`,  color: C.blue   },
    { label: "Ejec. 2pm · 7 días",   value: fmtMin(kpis["2pm"]["7d"].prom),  sub: `Tasa éxito: ${kpis["2pm"]["7d"].tasa}%`,  color: C.amber  },
    { label: "Tasa éxito 6am · 30d", value: `${kpis["6am"]["30d"].tasa}%`,   sub: "Ejecución mañana reciente",               color: C.green  },
    { label: "Tasa éxito 2pm · 30d", value: `${kpis["2pm"]["30d"].tasa}%`,   sub: "Ejecución tarde reciente",                color: C.teal   },
    { label: "Umbral advertencia",   value: fmtMin(banda.advertencia),        sub: "Media + 1.5σ (30d)",                      color: C.amber  },
    { label: "Umbral crítico",       value: fmtMin(banda.critico),            sub: "Media + 2σ (30d)",                        color: C.red    },
    { label: "Fallos · 7 días",      value: fallos7d,                         sub: "ejecuciones fallidas",                    color: C.red    },
    { label: "Pico volumetría · 30d",value: fmtM(maxReg30d),                  sub: "Máx registros/día",                       color: C.purple },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {cards.map((card) => (
        <KpiCard key={card.label} {...card} />
      ))}
    </div>
  );
};
