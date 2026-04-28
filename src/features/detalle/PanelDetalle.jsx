import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { C, ejColor } from "../../constants/colors";
import { BackButton, Card, CustomTooltip, Th, Td, MonoTd } from "../../components/ui";
import { fmtMin, fmtM } from "../../utils/format";
import { useDashboard } from "../../context/useDashboard";

// ─── Mini gráfico apilado ─────────────────────────────────────────────────────
const MiniChart = ({ items }) => {
  const data = useMemo(() => {
    return (items ?? []).map((ejecucion) => ({
      label:     `${ejecucion.fecha.slice(8)} ${ejecucion.turno ?? ejecucion.ejecucion ?? ""}`,
      directo:   ejecucion.directo_min != null ? Number(ejecucion.directo_min) : null,
      indirecto: ejecucion.indirecto_min != null ? Number(ejecucion.indirecto_min) : null,
    }));
  }, [items]);

  return (
    <ResponsiveContainer width="100%" height={190}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
        <XAxis dataKey="label" tick={{ fill: C.textMuted, fontSize: 9 }} />
        <YAxis tickFormatter={(v) => `${Math.round(v)}m`} tick={{ fill: C.textMuted, fontSize: 10 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="directo"   name="Directo"   stackId="a" fill={C.blue}   />
        <Bar dataKey="indirecto" name="Indirecto" stackId="a" fill={C.purple} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// ─── Tabla de detalle ─────────────────────────────────────────────────────────
const TablaDetalle = ({ items }) => (
  <Card overflow>
    <table className="w-full border-collapse text-xs">
      <thead>
        <tr className="bg-card-alt">
          {["Fecha","Ejecución","Total","Directo","Indirecto","Reg. Cargados","Reg. Actualizados","Estado","Notas"].map((h) => (
            <Th key={h} className="text-[9px]">{h}</Th>
          ))}
        </tr>
      </thead>
      <tbody>
        {(items ?? []).map((item, i) => (
          <tr key={i} className={`border-t border-border ${!item.exitoso ? "bg-quind-red-bg" : "bg-transparent"}`}>
            <Td>{item.fecha?.slice(5)}</Td>
            <Td className="font-bold" style={{ color: ejColor(item.turno ?? item.ejecucion) }}>{item.turno ?? item.ejecucion ?? "–"}</Td>
            <MonoTd className="font-semibold text-quind-green">{item.total_min != null ? fmtMin(item.total_min) : "–"}</MonoTd>
            <MonoTd className="text-text-sub">{item.directo_min != null ? fmtMin(item.directo_min) : "–"}</MonoTd>
            <MonoTd className="text-text-sub">{item.indirecto_min != null ? fmtMin(item.indirecto_min) : "–"}</MonoTd>
            <MonoTd className="text-quind-teal text-[11px]">{item.registros_cargados != null ? fmtM(item.registros_cargados) : "–"}</MonoTd>
            <MonoTd className={`text-[11px] ${item.registros_actualizados > 50e6 ? "text-quind-red" : "text-quind-teal"}`}>
              {item.registros_actualizados != null ? fmtM(item.registros_actualizados) : "–"}
            </MonoTd>
            <Td>
              {item.exitoso
                ? <span className="text-quind-green">✓</span>
                : <span className="text-quind-red">⚠</span>}
            </Td>
            <Td className="text-text-muted text-[11px]">{item.notas || "–"}</Td>
          </tr>
        ))}
      </tbody>
    </table>
  </Card>
);

export const PanelDetalle = () => {
  const { detailData, clearDetail } = useDashboard();
  if (!detailData) return null;

  const { type, data } = detailData;
  const titulo = type === "semana" ? data.semana : data.fecha;

  return (
    <div className="flex flex-col gap-6">
      <BackButton onClick={clearDetail} />

      <Card className="border-border-2">
        <span className="text-[10px] text-quind-green uppercase tracking-[2px] font-bold">
          {type === "semana" ? "Detalle de semana" : "Detalle del día"}
        </span>
        <h2 className="mt-1 mb-0.5 text-[20px] font-bold text-text-base">{titulo}</h2>
        <p className="text-text-muted text-xs m-0 mb-5">
          {data.items?.length ?? 0} ejecuciones
        </p>
        <MiniChart items={data.items ?? []} />
      </Card>

      <TablaDetalle items={data.items ?? []} />
    </div>
  );
};
