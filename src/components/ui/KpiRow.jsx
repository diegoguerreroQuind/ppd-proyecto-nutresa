import { KpiCard } from "./index";
import { fmtMin, fmtM } from "../../utils/format";
import { useTheme } from "../../context/ThemeContext";

/**
 * KpiRow
 *
 * Muestra los 8 KPIs principales.
 * Recibe kpis (por ejecución y ventana) y banda (tolerancia estadística).
 * No calcula nada: solo formatea y presenta.
 */
export const KpiRow = ({ kpis, banda }) => {
  const { colors: C } = useTheme();

  const fallos7d = kpis["EJ1"]["7d"].fallos + kpis["EJ2"]["7d"].fallos;
  const maxReg30d = Math.max(kpis["EJ1"]["30d"].maxReg, kpis["EJ2"]["30d"].maxReg);
  const maxRegAct30d = Math.max(
    kpis["EJ1"]["30d"].maxRegAct ?? 0,
    kpis["EJ2"]["30d"].maxRegAct ?? 0
  );

  const cards = [
    {
      label: "Promedio. EJ1 · 7 días",
      value: fmtMin(kpis["EJ1"]["7d"].prom),
      sub: `Promedio · Tasa éxito: ${kpis["EJ1"]["7d"].tasa}%`,
      color: C.blue,
      tooltip: "Tiempo promedio de ejecución del turno EJ1 durante los últimos 7 días.",
    },
    {
      label: "Promedio. EJ2 · 7 días",
      value: fmtMin(kpis["EJ2"]["7d"].prom),
      sub: `Promedio · Tasa éxito: ${kpis["EJ2"]["7d"].tasa}%`,
      color: C.amber,
      tooltip: "Tiempo promedio de ejecución del turno EJ2 durante los últimos 7 días.",
    },
    {
      label: "Tasa éxito EJ1 · 30d",
      value: `${kpis["EJ1"]["30d"].tasa}%`,
      sub: "Ejecución 1 (mañana)",
      color: C.green,
      tooltip: "Porcentaje de ejecuciones del turno EJ1 que finalizaron sin errores en los últimos 30 días.",
    },
    {
      label: "Tasa éxito EJ2 · 30d",
      value: `${kpis["EJ2"]["30d"].tasa}%`,
      sub: "Ejecución 2 (tarde)",
      color: C.teal,
      tooltip: "Porcentaje de ejecuciones del turno EJ2 que finalizaron sin errores en los últimos 30 días.",
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
      {(cards ?? []).map((card) => (
        <KpiCard key={card.label} {...card} />
      ))}
    </div>
  );
};
