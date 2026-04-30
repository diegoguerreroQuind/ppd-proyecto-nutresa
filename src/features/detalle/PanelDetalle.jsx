import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { useTheme } from "../../context/ThemeContext";
import { ejColor as ejColorFn } from "../../constants/colors";
import { BackButton, Card, CustomTooltip, Th, Td, MonoTd } from "../../components/ui";
import { fmtMin, fmtM, isIncompleta } from "../../utils/format";
import { useDashboard } from "../../context/useDashboard";

// ─── Mini gráfico apilado ─────────────────────────────────────────────────────
const MiniChart = ({ items }) => {
  const { colors: C, theme } = useTheme();
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
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={C.border}
          strokeOpacity={theme === "light" ? 0.8 : 0.5}
          vertical={false}
        />
        <XAxis dataKey="label" tick={{ fill: C.textSub, fontSize: 9 }} />
        <YAxis tickFormatter={(v) => `${Math.round(v)}m`} tick={{ fill: C.textSub, fontSize: 10 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11, color: C.textSub }} />
        <Bar dataKey="directo"   name="Directo"   stackId="a" fill={C.blue}   />
        <Bar dataKey="indirecto" name="Indirecto" stackId="a" fill={C.purple} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// ─── Tabla de detalle ─────────────────────────────────────────────────────────
const TablaDetalle = ({ items }) => {
  const { colors: C, theme } = useTheme();
  return (
    <Card
      overflow
      style={{
        border: theme === "light" ? `1px solid #c8cdde` : `1px solid ${C.border}`,
        borderRadius: 12,
      }}
    >
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr style={{ background: C.cardAlt }}>
            {["Fecha","Ejecución","Total","Directo","Indirecto","Reg. Cargados","Reg. Actualizados","Estado","Notas"].map((h) => (
              <Th key={h} className="text-[9px]">{h}</Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(items ?? []).map((item, index) => {
            const isSpecial = !item.exitoso || isIncompleta(item);
            const isAlternate = theme === "light" && index % 2 === 0 && !isSpecial;
            const rowBg = isSpecial ? C.redBg : (isAlternate ? C.cardAlt : "transparent");
            
            return (
              <tr
                key={index}
                style={{
                  background: rowBg,
                  color: C.text
                }}
              >
                <Td>{item.fecha?.slice(5)}</Td>
                <Td style={{ fontWeight: 700, color: ejColorFn(item.turno ?? item.ejecucion, C) }}>{item.turno ?? item.ejecucion ?? "–"}</Td>
                <MonoTd style={{ fontWeight: 600, color: C.green }}>{item.total_min != null ? fmtMin(item.total_min) : "–"}</MonoTd>
                <MonoTd style={{ color: C.textSub }}>{item.directo_min != null ? fmtMin(item.directo_min) : "–"}</MonoTd>
                <MonoTd style={{ color: C.textSub }}>{item.indirecto_min != null ? fmtMin(item.indirecto_min) : "–"}</MonoTd>
                <MonoTd style={{ color: C.teal, fontSize: 11 }}>{item.registros_cargados != null ? fmtM(item.registros_cargados) : "–"}</MonoTd>
                <MonoTd style={{ fontSize: 11, color: item.registros_actualizados > 50e6 ? C.red : C.teal }}>
                  {item.registros_actualizados != null ? fmtM(item.registros_actualizados) : "–"}
                </MonoTd>
                <Td>
                  {isIncompleta(item) ? (
                    <span
                      style={{
                        background: C.redBg,
                        color: C.red,
                        border: `1px solid ${C.redBdr}`,
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      FALLO
                    </span>
                  ) : item.exitoso ? (
                    <span style={{ color: C.green }}>✓</span>
                  ) : (
                    <span style={{ color: C.red }}>⚠</span>
                  )}
                </Td>
                <Td style={{ color: C.textMuted, fontSize: 11 }}>{item.notas || "–"}</Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
};

export const PanelDetalle = () => {
  const { detailData, clearDetail } = useDashboard();
  const { colors: C } = useTheme();

  if (!detailData) return null;

  const { type, data } = detailData;
  const titulo = type === "semana" ? data.semana : data.fecha;

  return (
    <div className="flex flex-col gap-6">
      <BackButton onClick={clearDetail} />

      <Card style={{ borderColor: C.border2 }}>
        <span style={{ color: C.green, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px" }}>
          {type === "semana" ? "Detalle de semana" : "Detalle del día"}
        </span>
        <h2 className="mt-1 mb-0.5 text-[20px] font-bold" style={{ color: C.text }}>{titulo}</h2>
        <p className="text-xs m-0 mb-5" style={{ color: C.textMuted }}>
          {data.items?.length ?? 0} ejecuciones
        </p>
        <MiniChart items={data.items ?? []} />
      </Card>

      <TablaDetalle items={data.items ?? []} />
    </div>
  );
};
