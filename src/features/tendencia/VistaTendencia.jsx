import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, Legend, ResponsiveContainer,
} from "recharts";
import { C, ejColor } from "../../constants/colors";
import { Badge, Card, SectionTitle, CustomTooltip, Th, Td, MonoTd } from "../../components/ui";
import { fmtMin } from "../../utils/format";
import { clasificarNivel, colorDeNivel } from "../../utils/anomalias";
import { useDashboard } from "../../context/useDashboard";

// ─── Mini-cards de referencia de la banda ────────────────────────────────────
const BandaReferencia = ({ banda }) => (
  <div className="flex gap-4 mb-3 flex-wrap">
    {[
      { label: "Media 30d",         value: fmtMin(banda?.media ?? 0),       color: C.green },
      { label: "Umbral advertencia",value: fmtMin(banda?.advertencia ?? 0), color: C.amber },
      { label: "Umbral crítico",    value: fmtMin(banda?.critico ?? 0),     color: C.red   },
    ].map(({ label, value, color }) => (
      <div key={label} className="bg-card-alt rounded-lg py-2 px-3.5" style={{ borderLeft: `3px solid ${color}` }}>
        <p className="text-[9px] text-text-muted m-0 mb-0.5 uppercase">{label}</p>
        <p className="text-base font-bold m-0" style={{ color, fontFamily: "'IBM Plex Mono', monospace" }}>{value}</p>
      </div>
    ))}
  </div>
);

// ─── Dot personalizado con color según nivel ──────────────────────────────────
const buildDot = (banda, defaultColor) => (props) => {
  const { cx, cy, value, index } = props;
  if (!value) return null;
  const color = value > (banda?.critico ?? 0) ? C.red : value > (banda?.advertencia ?? 0) ? C.amber : defaultColor;
  return <circle key={`dot-${index}`} cx={cx} cy={cy} r={value > (banda?.advertencia ?? 0) ? 5 : 3} fill={color} stroke={C.bg} strokeWidth={1} />;
};

// ─── Gráfico de tendencia ─────────────────────────────────────────────────────
const GraficoTendencia = ({ dailyData, ejFilter, banda }) => (
  <Card>
    <SectionTitle>Tendencia diaria con banda de tolerancia (30 días)</SectionTitle>
    <BandaReferencia banda={banda} />
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={dailyData ?? []}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
        <XAxis dataKey="label" tick={{ fill: C.textMuted, fontSize: 9 }} interval={2} angle={-30} textAnchor="end" height={50} />
        <YAxis tickFormatter={(v) => `${Math.round(v)}m`} tick={{ fill: C.textMuted, fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={banda?.advertencia ?? 0} stroke={`${C.amber}88`} strokeDasharray="5 3" label={{ value: "Adv",   fill: C.amber, fontSize: 9 }} />
        <ReferenceLine y={banda?.critico ?? 0}     stroke={`${C.red}88`}   strokeDasharray="5 3" label={{ value: "Crít",  fill: C.red,   fontSize: 9 }} />
        <ReferenceLine y={banda?.media ?? 0}       stroke={`${C.green}66`} strokeDasharray="3 3" label={{ value: "Media", fill: C.green, fontSize: 9 }} />
        <Legend wrapperStyle={{ fontSize: 11, color: C.textSub }} />
        {ejFilter !== "2pm" && (
          <Line type="monotone" dataKey="ej6am" name="Ejecución 6am" stroke={C.blue}  strokeWidth={2} dot={buildDot(banda, C.blue)}  />
        )}
        {ejFilter !== "6am" && (
          <Line type="monotone" dataKey="ej2pm" name="Ejecución 2pm" stroke={C.amber} strokeWidth={2} dot={buildDot(banda, C.amber)} />
        )}
      </LineChart>
    </ResponsiveContainer>
  </Card>
);

// ─── Tabla de clasificación ───────────────────────────────────────────────────
const TablaClasificacion = ({ filtered, banda }) => (
  <Card overflow>
    <div className="py-4 px-5 border-b border-border">
      <SectionTitle>Clasificación de ejecuciones</SectionTitle>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="thead-row">
            {["Fecha","Día","Ejecución","Tiempo","vs Media","Clasificación","Exitoso","Notas"].map((h) => (
              <Th key={h}>{h}</Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(filtered ?? []).map((ejecucion, i) => {
            const nivel = clasificarNivel(ejecucion.total_min, banda);
            const diff  = ejecucion.total_min - (banda?.media ?? 0);
            return (
              <tr key={i} className={`border-t border-border ${nivel === "CRÍTICO" ? "bg-quind-red-bg" : "bg-transparent"}`}>
                <Td>{ejecucion.fecha?.slice(5)}</Td>
                <Td className="text-text-sub">{ejecucion.dia_semana}</Td>
                <Td className="font-bold" style={{ color: ejColor(ejecucion.turno) }}>{ejecucion.turno}</Td>
                <MonoTd className={`font-semibold ${nivel === "CRÍTICO" ? "text-quind-red" : "text-text-base"}`}>{ejecucion.total_min != null ? fmtMin(ejecucion.total_min) : "–"}</MonoTd>
                <MonoTd className={`text-[11px] ${diff > 0 ? "text-quind-red" : "text-quind-green"}`}>{diff > 0 ? "+" : ""}{fmtMin(diff)}</MonoTd>
                <Td><Badge label={nivel} color={colorDeNivel(nivel)} /></Td>
                <Td>{ejecucion.exitoso ? <span className="text-quind-green">✓</span> : <span className="text-quind-red">⚠</span>}</Td>
                <Td className="text-text-muted text-[11px]">{ejecucion.notas || "–"}</Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </Card>
);

// ─── Feature principal ────────────────────────────────────────────────────────
export const VistaTendencia = () => {
  const { ejFilter, filtered, dailyData, banda } = useDashboard();
  return (
    <div className="flex flex-col gap-6">
      <GraficoTendencia dailyData={dailyData} ejFilter={ejFilter} banda={banda} />
      <TablaClasificacion filtered={filtered} banda={banda} />
    </div>
  );
};
