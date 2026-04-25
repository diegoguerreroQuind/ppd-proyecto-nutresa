import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, Legend, ResponsiveContainer,
} from "recharts";
import { C } from "../../constants/colors";
import { Card, SectionTitle, Badge, CustomTooltip, Th, Td } from "../../components/ui";
import { fmtMin, fmtM } from "../../utils/format";
import { useDashboard } from "../../context/useDashboard";

// ─── Gráfico de área semanal ──────────────────────────────────────────────────
const GraficoSemanal = ({ weeklyData, ejFilter, banda }) => (
  <Card>
    <SectionTitle>Tendencia Semanal — Promedio por Ejecución</SectionTitle>
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={weeklyData ?? []}>
        <defs>
          <linearGradient id="g6am" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={C.blue}  stopOpacity={0.3} />
            <stop offset="95%" stopColor={C.blue}  stopOpacity={0}   />
          </linearGradient>
          <linearGradient id="g2pm" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={C.amber} stopOpacity={0.3} />
            <stop offset="95%" stopColor={C.amber} stopOpacity={0}   />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
        <XAxis dataKey="semana" tick={{ fill: C.textMuted, fontSize: 11 }} />
        <YAxis tickFormatter={(v) => `${Math.round(v)}m`} tick={{ fill: C.textMuted, fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={banda?.advertencia ?? 0} stroke={`${C.amber}66`} strokeDasharray="4 4" label={{ value: "Adv.", fill: C.amber, fontSize: 9 }} />
        <ReferenceLine y={banda?.critico ?? 0}     stroke={`${C.red}66`}   strokeDasharray="4 4" label={{ value: "Crít.", fill: C.red,   fontSize: 9 }} />
        <Legend wrapperStyle={{ fontSize: 11, color: C.textSub }} />
        {ejFilter !== "2pm" && <Area type="monotone" dataKey="prom6am" name="Ejecución 6am" stroke={C.blue}  fill="url(#g6am)" strokeWidth={2} dot={{ fill: C.blue,  r: 3 }} />}
        {ejFilter !== "6am" && <Area type="monotone" dataKey="prom2pm" name="Ejecución 2pm" stroke={C.amber} fill="url(#g2pm)" strokeWidth={2} dot={{ fill: C.amber, r: 3 }} />}
      </AreaChart>
    </ResponsiveContainer>
  </Card>
);

// ─── Tabla semanal ────────────────────────────────────────────────────────────
const TablaSemanal = ({ weeklyData, ejFilter, banda, onRowClick }) => (
  <Card overflow>
    <div className="py-4 px-5 border-b border-border">
      <SectionTitle>Resumen Semanal · Clic para detalle</SectionTitle>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="thead-row">
            {["Semana","Ejec. 6am","Ejec. 2pm","Mínimo","Máximo","% Directo","Pico Registros","Fallos"].map((h) => (
              <Th key={h}>{h}</Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(weeklyData ?? []).map((semanaInfo, i) => (
            <tr
              key={i}
              onClick={() => onRowClick(semanaInfo)}
              className="table-row-hover border-t border-border cursor-pointer"
            >
              <Td className="text-quind-green font-semibold">{semanaInfo.semana}</Td>
              <Td className={ejFilter === "2pm" ? "text-text-muted" : "text-quind-blue"}>{semanaInfo.prom6am != null ? fmtMin(semanaInfo.prom6am) : "–"}</Td>
              <Td className={ejFilter === "6am" ? "text-text-muted" : "text-quind-amber"}>{semanaInfo.prom2pm != null ? fmtMin(semanaInfo.prom2pm) : "–"}</Td>
              <Td className="text-quind-green text-xs">{semanaInfo.minTotal != null ? fmtMin(semanaInfo.minTotal) : "–"}</Td>
              <Td className={`text-xs ${semanaInfo.maxTotal > (banda?.critico ?? 0) ? "text-quind-red" : "text-text-base"}`}>{semanaInfo.maxTotal != null ? fmtMin(semanaInfo.maxTotal) : "–"}</Td>
              <Td className="text-quind-purple">{semanaInfo.pctDir != null ? `${semanaInfo.pctDir.toFixed(0)}%` : "–"}</Td>
              <Td className="text-text-muted text-[11px]">{semanaInfo.picoReg != null ? fmtM(semanaInfo.picoReg) : "–"}</Td>
              <Td>
                {semanaInfo.fallos > 0
                  ? <Badge label={`⚠ ${semanaInfo.fallos}`} color={C.red} />
                  : <span className="text-[#166534] text-[11px]">✓ OK</span>}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

// ─── Feature principal ────────────────────────────────────────────────────────
export const VistaSemana = () => {
  const { ejFilter, setDetail, weeklyData, banda } = useDashboard();

  const handleRowClick = (semanaInfo) => setDetail({ type: "semana", data: semanaInfo });

  return (
    <div className="flex flex-col gap-5">
      <GraficoSemanal weeklyData={weeklyData} ejFilter={ejFilter} banda={banda} />
      <TablaSemanal   weeklyData={weeklyData} ejFilter={ejFilter} banda={banda} onRowClick={handleRowClick} />
    </div>
  );
};
