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
  const maxRegAct30d = Math.max(
    kpis["6am"]["30d"].maxRegAct ?? 0,
    kpis["2pm"]["30d"].maxRegAct ?? 0
  );

  const cards = [
    {
      label: "Ejec. 6am · 7 días",
      value: fmtMin(kpis["6am"]["7d"].prom),
      sub: `Promedio · Tasa éxito: ${kpis["6am"]["7d"].tasa}%`,
      color: C.blue,
      tooltip: "Tiempo promedio de ejecución del turno 6am durante los últimos 7 días.",
    },
    {
      label: "Ejec. 2pm · 7 días",
      value: fmtMin(kpis["2pm"]["7d"].prom),
      sub: `Promedio · Tasa éxito: ${kpis["2pm"]["7d"].tasa}%`,
      color: C.amber,
      tooltip: "Tiempo promedio de ejecución del turno 2pm durante los últimos 7 días.",
    },
    {
      label: "Tasa éxito 6am · 30d",
      value: `${kpis["6am"]["30d"].tasa}%`,
      sub: "Ejecución mañana reciente",
      color: C.green,
      tooltip: "Porcentaje de ejecuciones del turno 6am que finalizaron sin errores en los últimos 30 días.",
    },
    {
      label: "Tasa éxito 2pm · 30d",
      value: `${kpis["2pm"]["30d"].tasa}%`,
      sub: "Ejecución tarde reciente",
      color: C.teal,
      tooltip: "Porcentaje de ejecuciones del turno 2pm que finalizaron sin errores en los últimos 30 días.",
    },
    {
      label: "Umbral advertencia",
      value: fmtMin(banda.advertencia),
      sub: "Media + 1.5σ (30d)",
      color: C.amber,
      tooltip: "Tiempo límite de advertencia. Se calcula como el promedio de los últimos 30 días más 1.5 desviaciones estándar. Si una ejecución supera este valor se clasifica como ADVERTENCIA.",
    },
    {
      label: "Umbral crítico",
      value: fmtMin(banda.critico),
      sub: "Media + 2σ (30d)",
      color: C.red,
      tooltip: "Tiempo límite crítico. Se calcula como el promedio de los últimos 30 días más 2 desviaciones estándar. Si una ejecución supera este valor se clasifica como CRÍTICO.",
    },
    {
      label: "Fallos · 7 días",
      value: fallos7d,
      sub: "ejecuciones fallidas",
      color: C.red,
      tooltip: "Número de ejecuciones que terminaron con errores en los últimos 7 días.",
    },
    {
      label: "Pico cargados · 30d",
      value: fmtM(maxReg30d),
      sub: "Máx reg. cargados/día",
      color: C.purple,
      tooltip: "Máximo de registros cargados en un solo día durante los últimos 30 días. Útil para detectar días con volumetría de entrada inusualmente alta.",
    },
    {
      label: "Pico actualizados · 30d",
      value: fmtM(maxRegAct30d),
      sub: "Máx reg. actualizados/día",
      color: C.teal,
      tooltip: "Máximo de registros actualizados (delta) en un solo día durante los últimos 30 días. Un valor muy alto indica una recarga masiva de datos como el evento del 14 de abril con 120.9M registros.",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {cards.map((card) => (
        <KpiCard key={card.label} {...card} />
      ))}
    </div>
  );
};
