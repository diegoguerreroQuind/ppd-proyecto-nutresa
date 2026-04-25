import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, Legend, ResponsiveContainer,
} from "recharts";
import { C } from "../../constants/colors";
import { Card, SectionTitle, CustomTooltip, Th, Td } from "../../components/ui";
import { fmtMin, fmtM } from "../../utils/format";
import { useDashboard } from "../../context/useDashboard";

// ─── Gráfico de barras diario ─────────────────────────────────────────────────
const GraficoDiario = ({ dailyData, ejFilter, banda }) => (
  <Card>
    <SectionTitle>Tiempo por Día — Comparativa Ejecuciones</SectionTitle>
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={dailyData ?? []} barGap={2}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
        <XAxis dataKey="label" tick={{ fill: C.textMuted, fontSize: 9 }} interval={1} angle={-30} textAnchor="end" height={50} />
        <YAxis tickFormatter={(v) => `${Math.round(v)}m`} tick={{ fill: C.textMuted, fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={banda?.advertencia ?? 0} stroke={`${C.amber}66`} strokeDasharray="3 3" />
        <ReferenceLine y={banda?.critico ?? 0}     stroke={`${C.red}44`}   strokeDasharray="3 3" />
        <Legend wrapperStyle={{ fontSize: 11, color: C.textSub }} />
        {ejFilter !== "2pm" && <Bar dataKey="ej6am" name="Ejecución 6am" fill={C.blue}  radius={[3, 3, 0, 0]} />}
        {ejFilter !== "6am" && <Bar dataKey="ej2pm" name="Ejecución 2pm" fill={C.amber} radius={[3, 3, 0, 0]} />}
      </BarChart>
    </ResponsiveContainer>
  </Card>
);

// ─── Tabla diaria ─────────────────────────────────────────────────────────────
const TablaDiaria = ({ dailyData, ejFilter, onRowClick }) => (
  <Card overflow>
    <div className="py-4 px-5 border-b border-border">
      <SectionTitle>Detalle Diario · Clic para expandir</SectionTitle>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="thead-row">
            {["Fecha","Día","Ejec. 6am","Ejec. 2pm","Δ Entre ejecuciones","Registros día","Estado"].map((h) => (
              <Th key={h}>{h}</Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(dailyData ?? []).map((diaInfo, i) => (
            <tr
              key={i}
              onClick={() => onRowClick(diaInfo)}
              className={`table-row-hover border-t border-border cursor-pointer ${diaInfo.tieneFallo ? "bg-quind-red-bg" : "bg-transparent"}`}
            >
              <Td>{diaInfo.fecha?.slice(5)}</Td>
              <Td className="text-text-sub">{diaInfo.dia}{diaInfo.fin_semana ? " 🗓" : ""}</Td>
              <Td className={`font-semibold ${ejFilter === "2pm" ? "text-text-muted" : "text-quind-blue"}`}>{diaInfo.ej6am != null ? fmtMin(diaInfo.ej6am) : "–"}</Td>
              <Td className={`font-semibold ${ejFilter === "6am" ? "text-text-muted" : "text-quind-amber"}`}>{diaInfo.ej2pm != null ? fmtMin(diaInfo.ej2pm) : "–"}</Td>
              <Td className={`text-xs ${diaInfo.deltaTurnos > 30 ? "text-quind-red" : "text-quind-green"}`}>{diaInfo.deltaTurnos != null ? fmtMin(diaInfo.deltaTurnos) : "–"}</Td>
              <Td className="text-text-muted text-[11px]">{diaInfo.regDia != null ? fmtM(diaInfo.regDia) : "–"}</Td>
              <Td>
                {diaInfo.tieneFallo
                  ? <span className="text-quind-red text-[11px]">⚠ Fallo</span>
                  : <span className="text-quind-teal text-[11px]">✓</span>}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

// ─── Feature principal ────────────────────────────────────────────────────────
export const VistaDia = () => {
  const { ejFilter, setDetail, dailyData, banda } = useDashboard();

  return (
    <div className="flex flex-col gap-5">
      <GraficoDiario dailyData={dailyData} ejFilter={ejFilter} banda={banda} />
      <TablaDiaria   dailyData={dailyData} ejFilter={ejFilter} onRowClick={(diaInfo) => setDetail({ type: "dia", data: diaInfo })} />
    </div>
  );
};
