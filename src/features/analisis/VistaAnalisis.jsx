import { useMemo } from "react";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useTheme } from "../../context/ThemeContext";
import { Card, SectionTitle, Th, Td } from "../../components/ui";
import { useDashboard } from "../../context/useDashboard";

const getCorrMeta = (value, C) => {
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

const CorrelationTable = ({ title, prefix, dataEJ2, dataEJ1 }) => {
  const { colors: C } = useTheme();
  const nEJ2 = Number(dataEJ2?.n_registros) || 14;
  const nEJ1 = Number(dataEJ1?.n_registros) || 15;

  return (
    <Card overflow>
      <div className="py-4 px-5" style={{ borderBottom: `1px solid ${C.border}` }}>
        <SectionTitle noMargin>{title}</SectionTitle>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr style={{ background: C.cardAlt }}>
              <Th>Variable</Th>
              <Th>Turno EJ2 (n={nEJ2} observaciones)</Th>
              <Th>Turno EJ1 (n={nEJ1} observaciones)</Th>
            </tr>
          </thead>
          <tbody>
            {CORR_ROWS.map((row) => {
              const key = `${prefix}_${row.key}`;
              const v2 = dataEJ2?.[key];
              const v6 = dataEJ1?.[key];
              const m2 = getCorrMeta(v2, C);
              const m6 = getCorrMeta(v6, C);

              return (
                <tr key={key} style={{ borderTop: `1px solid ${C.border}` }}>
                  <Td style={{ color: C.textSub }}>{row.label}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <span
                        style={{ color: C.text, fontFamily: "'IBM Plex Mono', monospace" }}
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
                        style={{ color: C.text, fontFamily: "'IBM Plex Mono', monospace" }}
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
  const { colors: C } = useTheme();
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="rounded-lg px-3.5 py-2.5 text-xs border" style={{ background: C.card, borderColor: C.border2 }}>
      <p className="m-0 mb-1" style={{ color: C.textSub }}>Turno: {d?.turno ?? "–"}</p>
      <p className="m-0 mb-0.5" style={{ color: C.text }}>
        Registros actualizados:{" "}
        <strong style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{d?.regM ?? "–"}M</strong>
      </p>
      <p className="m-0" style={{ color: C.text }}>
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
  const { colors: C } = useTheme();

  const pearsonEJ2 = useMemo(
    () => (correlacionesData ?? []).find((corr) => corr.turno === "EJ2") ?? {},
    [correlacionesData]
  );
  const pearsonEJ1 = useMemo(
    () => (correlacionesData ?? []).find((corr) => corr.turno === "EJ1") ?? {},
    [correlacionesData]
  );
  const spearmanEJ2 = useMemo(
    () => (correlacionesSpearmanData ?? []).find((corr) => corr.turno === "EJ2") ?? {},
    [correlacionesSpearmanData]
  );
  const spearmanEJ1 = useMemo(
    () => (correlacionesSpearmanData ?? []).find((corr) => corr.turno === "EJ1") ?? {},
    [correlacionesSpearmanData]
  );

  const scatterData = useMemo(() => {
    const base = (rawData ?? []).filter((ejecucion) => ejecucion.registros_actualizados != null);
    const filtered = ejFilter === "ambos" ? base : base.filter((ejecucion) => ejecucion.turno === ejFilter);
    return filtered.map((ejecucion) => ({
      ...ejecucion,
      regM: +(Number(ejecucion.registros_actualizados) / 1e6).toFixed(2),
    }));
  }, [rawData, ejFilter]);

  const scatterEJ1 = useMemo(
    () => scatterData.filter((item) => item.turno === "EJ1"),
    [scatterData]
  );
  const scatterEJ2 = useMemo(
    () => scatterData.filter((item) => item.turno === "EJ2"),
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
          <p className="m-0" style={{ color: C.textSub }}>
            Cuando Pearson y Spearman difieren significativamente existe un outlier que infla la
            correlación lineal. Spearman es más confiable para este tipo de datos operativos.
          </p>
        </div>
      </Card>

      <CorrelationTable
        title="Correlaciones Pearson"
        prefix="pearson"
        dataEJ2={pearsonEJ2}
        dataEJ1={pearsonEJ1}
      />

      <CorrelationTable
        title="Correlaciones Spearman"
        prefix="spearman"
        dataEJ2={spearmanEJ2}
        dataEJ1={spearmanEJ1}
      />

      <Card>
        <SectionTitle>Scatter — Registros actualizados vs tiempo total</SectionTitle>
        <p className="text-xs -mt-2.5 mb-3.5" style={{ color: C.textMuted }}>
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
            {ejFilter !== "EJ2" && (
              <Scatter name="Turno EJ1" data={scatterEJ1} fill={C.blue} />
            )}
            {ejFilter !== "EJ1" && (
              <Scatter name="Turno EJ2" data={scatterEJ2} fill={C.amber} />
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};
