import { useMemo } from "react";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { C } from "../../constants/colors";
import { Card, SectionTitle, Th, Td } from "../../components/ui";
import { useDashboard } from "../../context/useDashboard";

const getCorrMeta = (value) => {
  const absVal = Math.abs(Number(value) || 0);
  if (absVal >= 0.7) return { color: C.green, label: "Fuerte" };
  if (absVal >= 0.4) return { color: C.amber, label: "Moderada" };
  if (absVal >= 0.2) return { color: C.textSub, label: "Débil" };
  return { color: C.textDim, label: "Sin correlación" };
};

const fmtCorr = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(3) : "–";
};

const CORR_ROWS = [
  { label: "Reg. Cargados → Tiempo Total", key: "cargados_total" },
  { label: "Reg. Cargados → Tiempo Directo", key: "cargados_directo" },
  { label: "Reg. Cargados → Tiempo Indirecto", key: "cargados_indirecto" },
  { label: "Reg. Actualizados → Tiempo Total", key: "actualizados_total" },
  { label: "Reg. Actualizados → Tiempo Directo", key: "actualizados_directo" },
  { label: "Reg. Actualizados → Tiempo Indirecto", key: "actualizados_indirecto" },
];

const CorrelationTable = ({ title, prefix, data2pm, data6am }) => {
  const n2pm = Number(data2pm?.n_registros) || 14;
  const n6am = Number(data6am?.n_registros) || 15;

  return (
    <Card overflow>
      <div className="py-4 px-5 border-b border-border">
        <SectionTitle>{title}</SectionTitle>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-card-alt">
              <Th>Variable</Th>
              <Th>Turno 2pm (n={n2pm} observaciones)</Th>
              <Th>Turno 6am (n={n6am} observaciones)</Th>
            </tr>
          </thead>
          <tbody>
            {CORR_ROWS.map((row) => {
              const key = `${prefix}_${row.key}`;
              const v2 = data2pm?.[key];
              const v6 = data6am?.[key];
              const m2 = getCorrMeta(v2);
              const m6 = getCorrMeta(v6);

              return (
                <tr key={key} className="border-t border-border">
                  <Td className="text-text-sub">{row.label}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-text-base"
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      >
                        {fmtCorr(v2)}
                      </span>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-md border"
                        style={{ color: m2.color, borderColor: `${m2.color}55`, background: `${m2.color}22` }}
                      >
                        {m2.label}
                      </span>
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-text-base"
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      >
                        {fmtCorr(v6)}
                      </span>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-md border"
                        style={{ color: m6.color, borderColor: `${m6.color}55`, background: `${m6.color}22` }}
                      >
                        {m6.label}
                      </span>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

const ScatterCorrTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-card border border-border-2 rounded-lg px-3.5 py-2.5 text-xs">
      <p className="text-text-sub m-0 mb-1">Turno: {d?.turno ?? "–"}</p>
      <p className="text-text-base m-0 mb-0.5">
        Registros actualizados:{" "}
        <strong style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{d?.regM ?? "–"}M</strong>
      </p>
      <p className="text-text-base m-0">
        Tiempo total:{" "}
        <strong style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{d?.total_min ?? "–"} min</strong>
      </p>
    </div>
  );
};

export const VistaAnalisis = () => {
  const {
    ejFilter,
    rawData,
    correlacionesData,
    correlacionesSpearmanData,
  } = useDashboard();

  const pearson2pm = useMemo(
    () => (correlacionesData ?? []).find((d) => d.turno === "2pm") ?? {},
    [correlacionesData]
  );
  const pearson6am = useMemo(
    () => (correlacionesData ?? []).find((d) => d.turno === "6am") ?? {},
    [correlacionesData]
  );
  const spearman2pm = useMemo(
    () => (correlacionesSpearmanData ?? []).find((d) => d.turno === "2pm") ?? {},
    [correlacionesSpearmanData]
  );
  const spearman6am = useMemo(
    () => (correlacionesSpearmanData ?? []).find((d) => d.turno === "6am") ?? {},
    [correlacionesSpearmanData]
  );

  const scatterData = useMemo(() => {
    const base = (rawData ?? []).filter((d) => d.registros_actualizados != null);
    const filtered = ejFilter === "ambos" ? base : base.filter((d) => d.turno === ejFilter);
    return filtered.map((d) => ({
      ...d,
      regM: +(Number(d.registros_actualizados) / 1e6).toFixed(2),
    }));
  }, [rawData, ejFilter]);

  const scatter6am = useMemo(
    () => scatterData.filter((d) => d.turno === "6am"),
    [scatterData]
  );
  const scatter2pm = useMemo(
    () => scatterData.filter((d) => d.turno === "2pm"),
    [scatterData]
  );

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <SectionTitle>Interpretación automática</SectionTitle>
        <div className="flex flex-col gap-3 text-[13px] leading-6">
          <p className="m-0" style={{ color: C.blue }}>
            Los registros actualizados muestran correlación fuerte con el tiempo directo según
            Pearson (0.846), pero Spearman indica correlación débil (0.150). Esta diferencia
            sugiere la presencia de un outlier extremo (evento 14/04 con 120M registros) que
            infla el coeficiente lineal. Se recomienda usar Spearman como referencia principal.
          </p>
          <p className="m-0" style={{ color: C.amber }}>
            Los registros cargados muestran correlación moderada con el tiempo total según
            Spearman (0.613), más robusta que Pearson (0.167). Los registros actualizados tienen
            impacto moderado en los tiempos (Spearman: 0.433).
          </p>
          <p className="m-0 text-text-sub">
            Cuando Pearson y Spearman difieren significativamente existe un outlier que infla la
            correlación lineal. Spearman es más confiable para este tipo de datos operativos.
          </p>
        </div>
      </Card>

      <CorrelationTable
        title="Correlaciones Pearson"
        prefix="pearson"
        data2pm={pearson2pm}
        data6am={pearson6am}
      />

      <CorrelationTable
        title="Correlaciones Spearman"
        prefix="spearman"
        data2pm={spearman2pm}
        data6am={spearman6am}
      />

      <Card>
        <SectionTitle>Scatter — Registros actualizados vs tiempo total</SectionTitle>
        <p className="text-xs text-text-muted -mt-2.5 mb-3.5">
          Eje X: registros actualizados (M) · Eje Y: tiempo total (min)
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 10, right: 18, left: 6, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis
              dataKey="regM"
              type="number"
              name="Registros actualizados (M)"
              tick={{ fill: C.textMuted, fontSize: 11 }}
            />
            <YAxis
              dataKey="total_min"
              type="number"
              name="Tiempo total (min)"
              tick={{ fill: C.textMuted, fontSize: 11 }}
            />
            <Tooltip content={<ScatterCorrTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: C.textSub }} />
            {ejFilter !== "2pm" && (
              <Scatter name="Turno 6am" data={scatter6am} fill={C.blue} />
            )}
            {ejFilter !== "6am" && (
              <Scatter name="Turno 2pm" data={scatter2pm} fill={C.amber} />
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};
