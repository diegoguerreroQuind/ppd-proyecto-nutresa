import { useMemo } from "react";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { C, ejColor } from "../../constants/colors";
import { Badge, Card, SectionTitle, Th, Td, MonoTd } from "../../components/ui";
import { colorDeVolumen } from "../../utils/anomalias";
import { useDashboard } from "../../context/useDashboard";

// ─── Tooltip de volumetría ────────────────────────────────────────────────────
const VolTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  const ratio = d?.ratio_actualizados ?? d?.ratio_cargados ?? 0;
  return (
    <div className="chart-tooltip">
      <p className="text-text-sub mb-1">{label}</p>
      <p className="text-text-base m-0 mb-0.5">Registros: <strong style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{d?.reg_M}M</strong></p>
      <p className={`m-0 mb-0.5 ${ratio > 2 ? "text-quind-red" : ratio > 1.5 ? "text-quind-amber" : "text-quind-green"}`}>
        Ratio: <strong style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{ratio}x</strong>
      </p>
      <p className="m-0" style={{ color: colorDeVolumen(d?.alerta_volumetria, C) }}>{d?.alerta_volumetria}</p>
    </div>
  );
};

// ─── Gráfico de barras de volumetría ─────────────────────────────────────────
const GraficoVolumen = ({ volData }) => {
  const chartData = useMemo(() => {
    return (volData ?? []).map(d => ({
      ...d,
      reg_M: d.registros_actualizados != null
        ? +(d.registros_actualizados / 1e6).toFixed(2)
        : d.registros_cargados != null
          ? +(d.registros_cargados / 1e6).toFixed(2)
          : 0,
      label: `${d.fecha?.slice(5)} ${d.turno}`,
    }));
  }, [volData]);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
        <XAxis dataKey="label" tick={{ fill: C.textMuted, fontSize: 9 }} angle={-30} textAnchor="end" height={50} />
        <YAxis tickFormatter={(v) => `${v}M`} tick={{ fill: C.textMuted, fontSize: 11 }} />
        <Tooltip content={<VolTooltip />} />
        <Bar dataKey="reg_M" name="Registros actualizados (M)" radius={[3, 3, 0, 0]} fill={C.blue}>
          {chartData.map((entry, index) => (
            <Cell key={`c-${index}`} fill={colorDeVolumen(entry.alerta_volumetria, C)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// ─── Tabla de alertas de volumetría ──────────────────────────────────────────
const TablaVolumen = ({ volData }) => {
  const sortedData = useMemo(() => {
    return [...(volData ?? [])].sort(
      (a, b) => (b.registros_actualizados || b.registros_cargados || 0) - (a.registros_actualizados || a.registros_cargados || 0)
    );
  }, [volData]);

  return (
    <Card overflow>
      <div className="py-4 px-5 border-b border-border">
        <SectionTitle>Detalle de alertas</SectionTitle>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="thead-row">
              {["Fecha","Ejecución","Reg. actualizados","vs Promedio (ratio)","Promedio histórico","Alerta"].map((h) => (
                <Th key={h}>{h}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((d, i) => {
              const ratio = d.ratio_actualizados ?? d.ratio_cargados ?? 0;
              const regM = +(d.registros_actualizados / 1e6 || d.registros_cargados / 1e6).toFixed(2);
              const mediaM = +(d.media_actualizados / 1e6).toFixed(2);

              return (
                <tr key={i} className={`border-t border-border ${d.alerta_volumetria === "DELTA_MASIVO" ? "bg-quind-red-bg" : "bg-transparent"}`}>
                  <Td>{d.fecha?.slice(5)}</Td>
                  <Td className="font-bold" style={{ color: ejColor(d.turno) }}>{d.turno}</Td>
                  <MonoTd className={`font-semibold ${d.alerta_volumetria !== "NORMAL" ? "text-quind-red" : "text-text-base"}`}>{regM}M</MonoTd>
                  <MonoTd className={`font-bold ${ratio > 2 ? "text-quind-red" : ratio > 1.5 ? "text-quind-amber" : "text-quind-green"}`}>{ratio}x</MonoTd>
                  <MonoTd className="text-text-muted">{mediaM}M</MonoTd>
                  <Td><Badge label={d.alerta_volumetria} color={colorDeVolumen(d.alerta_volumetria, C)} /></Td>
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
export const VistaVolometria = () => {
  const { ejFilter, volData } = useDashboard();

  if (!volData || !volData.length) {
    return (
      <Card>
        <p className="text-text-muted text-[13px] m-0">
          No hay datos de volumetría para la ejecución seleccionada.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <SectionTitle>Alertas de volumetría — Registros actualizados</SectionTitle>
        <p className="text-xs text-text-muted -mt-2.5 mb-3.5">
          Ratio vs promedio histórico{ejFilter !== "ambos" ? ` · Ejecución ${ejFilter}` : ""} · Rojo = Delta masivo (&gt;2σ) · Amarillo = Delta alto (&gt;1.5σ)
        </p>
        <GraficoVolumen volData={volData} />
      </Card>
      <TablaVolumen volData={volData} />
    </div>
  );
};
