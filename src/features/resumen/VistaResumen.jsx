import { useMemo } from "react";
import { C, ejColor } from "../../constants/colors";
import { Badge, Card, SectionTitle, Th, Td } from "../../components/ui";
import { fmtMin, fmtM, avg } from "../../utils/format";
import { clasificarNivel, colorDeNivel } from "../../utils/anomalias";
import { useDashboard } from "../../context/useDashboard";

// ─── Tarjeta de stats por ejecución ──────────────────────────────────────────
const EjecucionCard = ({ ej, kpis }) => {
  const d7  = kpis[ej]?.["7d"] ?? {};
  const d30 = kpis[ej]?.["30d"] ?? {};
  const clr = ejColor(ej);

  const stats = [
    { l: "Promedio",    v: fmtMin(d7.prom),            colorClass: ej === "6am" ? "text-quind-blue" : "text-quind-amber" },
    { l: "Mínimo",      v: fmtMin(d7.min),             colorClass: "text-quind-green" },
    { l: "Máximo",      v: fmtMin(d7.max),             colorClass: "text-quind-red"   },
    { l: "% Directo",   v: `${(d7.pctDir ?? 0).toFixed(0)}%`, colorClass: "text-quind-blue"  },
    { l: "% Indirecto", v: `${(d7.pctInd ?? 0).toFixed(0)}%`, colorClass: "text-quind-purple"},
    { l: "Fallos",      v: d7.fallos ?? 0,             colorClass: d7.fallos > 0 ? "text-quind-red" : "text-quind-green" },
  ];

  const prom7 = d7.prom ?? 0;
  const prom30 = d30.prom ?? 0;

  return (
    <Card style={{ borderLeft: `3px solid ${clr}` }}>
      <SectionTitle color={clr}>
        Ejecución {ej} — Últimos 7 días
      </SectionTitle>
      <div className="grid grid-cols-3 gap-2.5 mb-3.5">
        {stats.map(({ l, v, colorClass }) => (
          <div key={l} className="stat-mini">
            <p className="text-[9px] text-text-muted m-0 mb-[3px] uppercase">{l}</p>
            <p className={`text-base font-bold m-0 ${colorClass}`}>{v}</p>
          </div>
        ))}
      </div>
      <div className="pt-3 border-t border-border">
        <p className="text-[10px] text-text-muted m-0 mb-1.5 uppercase">vs 30 días</p>
        <div className="flex gap-2.5">
          <span className="text-xs text-text-sub">
            Prom 30d: <strong style={{ color: clr }}>{fmtMin(prom30)}</strong>
          </span>
          <span className={`text-xs ${prom7 > prom30 ? "text-quind-red" : "text-quind-green"}`}>
            {prom7 > prom30 ? "↑" : "↓"} {fmtMin(Math.abs(prom7 - prom30))}
          </span>
        </div>
      </div>
    </Card>
  );
};

// ─── Comparativa hábiles vs fin de semana ────────────────────────────────────
const HabilesVsFinSemana = ({ filtered, banda }) => {
  return (
    <Card>
      <SectionTitle>Hábiles vs Fin de semana</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        {[false, true].map((esFS) => {
          const data = (filtered ?? []).filter((ejecucion) => ejecucion.es_fin_semana === esFS);
          const clrClass  = esFS ? "text-quind-amber" : "text-quind-blue";
          const bgClass   = esFS ? "bg-quind-amber" : "bg-quind-blue";
          const prom = avg(data.map((ejecucion) => ejecucion.total_min));
          const pico = data.length ? Math.max(...data.map((ejecucion) => ejecucion.total_min)) : 0;
          
          return (
            <div key={String(esFS)} className="bg-card-alt rounded-lg p-3.5">
              <p className={`text-[13px] font-bold m-0 mb-2.5 ${clrClass}`}>
                {esFS ? "Fin de semana" : "Días hábiles"}
              </p>
              {[
                ["Promedio", fmtMin(prom)], 
                ["Pico", fmtMin(pico)], 
                ["Ejecuciones", data.length], 
                ["Fallos", data.filter((ejecucion) => !ejecucion.exitoso).length]
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between mb-1">
                  <span className="text-xs text-text-muted">{l}</span>
                  <span className={`text-xs font-bold ${l === "Fallos" && v > 0 ? "text-quind-red" : "text-text-base"}`}>{v}</span>
                </div>
              ))}
              <div className="mt-2 band-bar-track h-1.5">
                <div className={`band-bar-fill ${bgClass}`} style={{ width: `${Math.min(100, (prom / (banda.critico || 1)) * 100)}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// ─── Tabla de alertas recientes ───────────────────────────────────────────────
const AlertasTable = ({ filtered, banda }) => {
  const alertas = useMemo(() => {
    return (filtered ?? []).filter((ejecucion) => !ejecucion.exitoso || ejecucion.total_min > banda.advertencia);
  }, [filtered, banda]);

  if (!alertas.length) return null;

  return (
    <Card overflow>
      <div className="py-4 px-5 border-b border-border flex justify-between items-center">
        <SectionTitle>⚠ Alertas recientes</SectionTitle>
        <Badge label={`${alertas.length} alertas`} color={C.red} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="thead-row">
              {["Fecha","Día","Ejecución","Tiempo","vs Media","Nivel","Registros","Notas"].map((h) => (
                <Th key={h}>{h}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {alertas.map((ejecucion, i) => {
              const nivel = clasificarNivel(ejecucion.total_min, banda);
              const diff  = ejecucion.total_min - banda.media;
              return (
                <tr key={i} className="border-t border-border bg-quind-red-bg">
                  <Td>{ejecucion.fecha?.slice(5)}</Td>
                  <Td className="text-text-sub">{ejecucion.dia_semana}</Td>
                  <Td className="font-bold" style={{ color: ejColor(ejecucion.turno) }}>{ejecucion.turno}</Td>
                  <Td className="font-bold text-quind-red">{fmtMin(ejecucion.total_min)}</Td>
                  <Td className="text-[11px] text-quind-red">{diff > 0 ? "+" : ""}{fmtMin(diff)}</Td>
                  <Td><Badge label={nivel} color={colorDeNivel(nivel)} /></Td>
                  <Td className="text-text-muted text-[11px]">{ejecucion.registros_cargados != null ? fmtM(ejecucion.registros_cargados) : "–"}</Td>
                  <Td className="text-text-muted text-[11px]">{ejecucion.notas || "–"}</Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// ─── Feature principal ────────────────────────────────────────────────────────
export const VistaResumen = () => {
  const { ejFilter, filtered, kpis, banda } = useDashboard();
  const ejecuciones = ejFilter === "ambos" ? ["6am", "2pm"] : [ejFilter];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4">
        {ejecuciones.map((ej) => (
          <EjecucionCard key={ej} ej={ej} kpis={kpis} />
        ))}
      </div>
      <HabilesVsFinSemana filtered={filtered} banda={banda} />
      <AlertasTable filtered={filtered} banda={banda} />
    </div>
  );
};
