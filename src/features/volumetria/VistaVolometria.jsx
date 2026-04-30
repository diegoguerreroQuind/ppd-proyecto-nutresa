import { useMemo } from "react";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "../../context/ThemeContext";
import { 
  ejColor as ejColorFn, 
  nivelColorMap as nivelColorMapFn 
} from "../../constants/colors";
import { Badge, Card, SectionTitle, Th, Td, MonoTd } from "../../components/ui";
import { colorDeVolumen as colorDeVolumenFn } from "../../utils/anomalias";
import { useDashboard } from "../../context/useDashboard";

// ─── Tooltip de volumetría ────────────────────────────────────────────────────
const VolTooltip = ({ active, payload, label }) => {
  const { colors: C } = useTheme();
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  const ratio = item?.ratio_actualizados ?? item?.ratio_cargados ?? 0;
  return (
    <div className="rounded-lg px-3.5 py-2.5 text-xs border" style={{ background: C.card, borderColor: C.border2, boxShadow: C.shadowMd ?? "none" }}>
      <p className="mb-1" style={{ color: C.textSub }}>{label}</p>
      <p className="m-0 mb-0.5" style={{ color: C.text }}>Registros: <strong style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{item?.reg_M}M</strong></p>
      <p className="m-0 mb-0.5" style={{ color: ratio > 2 ? C.red : ratio > 1.5 ? C.amber : C.green }}>
        Ratio: <strong style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{ratio}x</strong>
      </p>
      <p className="m-0" style={{ color: colorDeVolumenFn(item?.alerta_volumetria, C) }}>{item?.alerta_volumetria}</p>
    </div>
  );
};

// ─── Gráfico de barras de volumetría ─────────────────────────────────────────
const GraficoVolumen = ({ volData }) => {
  const { colors: C, theme } = useTheme();
  const chartData = useMemo(() => {
    return (volData ?? []).map(item => ({
      ...item,
      reg_M: item.registros_actualizados != null
        ? +(item.registros_actualizados / 1e6).toFixed(2)
        : item.registros_cargados != null
          ? +(item.registros_cargados / 1e6).toFixed(2)
          : 0,
      label: `${item.fecha?.slice(5)} ${item.turno}`,
    }));
  }, [volData]);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={C.border}
          strokeOpacity={theme === "light" ? 0.8 : 0.5}
          vertical={false}
        />
        <XAxis dataKey="label" tick={{ fill: C.textSub, fontSize: 9 }} angle={-30} textAnchor="end" height={50} />
        <YAxis tickFormatter={(v) => `${v}M`} tick={{ fill: C.textSub, fontSize: 11 }} />
        <Tooltip content={<VolTooltip />} />
        <Bar dataKey="reg_M" name="Registros actualizados (M)" radius={[3, 3, 0, 0]} fill={C.blue}>
          {(chartData ?? []).map((entry, index) => (
            <Cell key={`c-${index}`} fill={colorDeVolumenFn(entry.alerta_volumetria, C)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// ─── Tabla de alertas de volumetría ──────────────────────────────────────────
const TablaVolumen = ({ volData }) => {
  const { colors: C, theme } = useTheme();
  const sortedData = useMemo(() => {
    return [...(volData ?? [])].sort(
      (a, b) => (b.registros_actualizados || b.registros_cargados || 0) - (a.registros_actualizados || a.registros_cargados || 0)
    );
  }, [volData]);

  return (
    <Card
      overflow
      style={{
        border: theme === "light" ? `1px solid #c8cdde` : `1px solid ${C.border}`,
        borderRadius: 12,
      }}
    >
      <div className="py-4 px-5" style={{ borderBottom: `1px solid ${C.border}` }}>
        <SectionTitle noMargin>Detalle de alertas</SectionTitle>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr style={{ background: C.cardAlt }}>
              {["Fecha","Ejecución","Reg. actualizados","vs Promedio (ratio)","Promedio histórico","Alerta"].map((h) => (
                <Th key={h}>{h}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(sortedData ?? []).map((item, index) => {
              const ratio = item.ratio_actualizados ?? item.ratio_cargados ?? 0;
              const regM = +((item.registros_actualizados || item.registros_cargados || 0) / 1e6).toFixed(2);
              const mediaM = +((item.media_actualizados || 0) / 1e6).toFixed(2);
              const colorAlerta = colorDeVolumenFn(item.alerta_volumetria, C);
              const isSpecial = item.alerta_volumetria === "DELTA_MASIVO";
              const isAlternate = theme === "light" && index % 2 === 0 && !isSpecial;
              const rowBg = isSpecial ? C.redBg : (isAlternate ? C.cardAlt : "transparent");

              return (
                <tr
                  key={index}
                  className="transition-colors"
                  style={{
                    background: rowBg,
                    color: C.text
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = isSpecial ? `${C.redBg}EE` : C.cardAlt;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = rowBg;
                  }}
                >
                  <Td>{item.fecha?.slice(5)}</Td>
                  <Td style={{ fontWeight: 700, color: ejColorFn(item.turno, C) }}>{item.turno}</Td>
                  <MonoTd style={{ fontWeight: 600, color: item.alerta_volumetria !== "NORMAL" ? C.red : C.text }}>{regM}M</MonoTd>
                  <MonoTd style={{ fontWeight: 700, color: ratio > 2 ? C.red : ratio > 1.5 ? C.amber : C.green }}>{ratio}x</MonoTd>
                  <MonoTd style={{ color: C.textMuted }}>{mediaM}M</MonoTd>
                  <Td><Badge label={item.alerta_volumetria} color={colorAlerta} /></Td>
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
  const { colors: C } = useTheme();

  const filteredVolData = useMemo(() => {
    if (!volData || volData.length === 0) return [];
    if (ejFilter === "ambos") return volData;
    return volData.filter(item => item.turno === ejFilter);
  }, [volData, ejFilter]);

  if (!filteredVolData || !filteredVolData.length) {
    return (
      <Card>
        <p className="text-[13px] m-0" style={{ color: C.textMuted }}>
          No hay datos de volumetría para la ejecución seleccionada.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <SectionTitle>Alertas de volumetría — Registros actualizados</SectionTitle>
        <p className="text-xs -mt-2.5 mb-3.5" style={{ color: C.textMuted }}>
          Ratio vs promedio histórico{ejFilter !== "ambos" ? ` · Ejecución ${ejFilter}` : ""} · Rojo = Delta masivo (&gt;2σ) · Amarillo = Delta alto (&gt;1.5σ)
        </p>
        <GraficoVolumen volData={filteredVolData} />
      </Card>
      <TablaVolumen volData={filteredVolData} />
    </div>
  );
};
