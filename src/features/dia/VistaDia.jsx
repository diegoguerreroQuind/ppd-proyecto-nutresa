import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, Legend, ResponsiveContainer,
} from "recharts";
import { useTheme } from "../../context/ThemeContext";
import { Card, SectionTitle, CustomTooltip, Th, Td, MonoTd } from "../../components/ui";
import { fmtMin, fmtM } from "../../utils/format";
import { useDashboard } from "../../context/useDashboard";

// ─── Gráfico de barras diario ─────────────────────────────────────────────────
const GraficoDiario = ({ dailyData, ejFilter, banda }) => {
  const { colors: C, theme } = useTheme();
  return (
    <Card>
      <SectionTitle>Tiempo por Día — Comparativa Ejecuciones</SectionTitle>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={dailyData ?? []} barGap={2}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={C.border}
            strokeOpacity={theme === "light" ? 0.8 : 0.5}
            vertical={false}
          />
          <XAxis dataKey="label" tick={{ fill: C.textSub, fontSize: 9 }} interval={1} angle={-30} textAnchor="end" height={50} />
          <YAxis tickFormatter={(v) => `${Math.round(v)}m`} tick={{ fill: C.textSub, fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={banda?.advertencia ?? 0} stroke={`${C.amber}66`} strokeDasharray="3 3" />
          <ReferenceLine y={banda?.critico ?? 0}     stroke={`${C.red}44`}   strokeDasharray="3 3" />
          <Legend wrapperStyle={{ fontSize: 11, color: C.textSub }} />
          {ejFilter !== "EJ2" && <Bar dataKey="ejEJ1" name="Ejecución 1" fill={C.blue}  radius={[3, 3, 0, 0]} />}
          {ejFilter !== "EJ1" && <Bar dataKey="ejEJ2" name="Ejecución 2" fill={C.amber} radius={[3, 3, 0, 0]} />}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

// ─── Tabla diaria ─────────────────────────────────────────────────────────────
const TablaDiaria = ({ dailyData, ejFilter, onRowClick }) => {
  const { colors: C, theme } = useTheme();
  return (
    <Card
      overflow
      style={{
        border: theme === "light" ? `1px solid #c8cdde` : `1px solid ${C.border}`,
        borderRadius: 12,
      }}
    >
      <div className="py-4 px-5" style={{ borderBottom: `1px solid ${C.border}` }}>
        <SectionTitle noMargin>Detalle Diario · Clic para expandir</SectionTitle>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr style={{ background: C.cardAlt }}>
              {["Fecha","Día","Ejec. EJ1","Ejec. EJ2","Δ Entre ejecuciones","Reg. Cargados","Reg. Actualizados","Estado"].map((h) => (
                <Th key={h}>{h}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(dailyData ?? []).map((diaInfo, index) => {
              const isSpecial = diaInfo.tieneFallo;
              const isAlternate = theme === "light" && index % 2 === 0 && !isSpecial;
              const rowBg = isSpecial ? C.redBg : (isAlternate ? C.cardAlt : "transparent");

              return (
                <tr
                  key={index}
                  onClick={() => onRowClick(diaInfo)}
                  className="cursor-pointer transition-colors"
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
                  <Td>{diaInfo.fecha?.slice(5)}</Td>
                  <Td style={{ color: C.textSub }}>{diaInfo.dia}{diaInfo.fin_semana ? " 🗓" : ""}</Td>
                  <MonoTd style={{ fontWeight: 600, color: ejFilter === "EJ2" ? C.textMuted : C.blue }}>{diaInfo.ejEJ1 != null ? fmtMin(diaInfo.ejEJ1) : "–"}</MonoTd>
                  <MonoTd style={{ fontWeight: 600, color: ejFilter === "EJ1" ? C.textMuted : C.amber }}>{diaInfo.ejEJ2 != null ? fmtMin(diaInfo.ejEJ2) : "–"}</MonoTd>
                  <MonoTd style={{ fontSize: 12, color: diaInfo.deltaTurnos > 30 ? C.red : C.green }}>{diaInfo.deltaTurnos != null ? fmtMin(diaInfo.deltaTurnos) : "–"}</MonoTd>
                  <Td>
                    <span style={{
                      color: C.teal,
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 11,
                    }}>
                      {diaInfo.regCargados ? fmtM(diaInfo.regCargados) : "–"}
                    </span>
                  </Td>
                  <Td>
                    <span style={{
                      color: (diaInfo.regActualizados ?? 0) > 50e6 ? C.red : C.teal,
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 11,
                    }}>
                      {diaInfo.regActualizados ? fmtM(diaInfo.regActualizados) : "–"}
                    </span>
                  </Td>
                  <Td>
                    {diaInfo.tieneFallo
                      ? <span style={{ color: C.red, fontSize: 11 }}>⚠ Fallo</span>
                      : <span style={{ color: C.teal, fontSize: 11 }}>✓</span>}
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

// ─── Feature principal ────────────────────────────────────────────────────────
export const VistaDia = () => {
  const { ejFilter, setDetail, dailyData, banda } = useDashboard();

  return (
    <div className="flex flex-col gap-6">
      <GraficoDiario dailyData={dailyData} ejFilter={ejFilter} banda={banda} />
      <TablaDiaria   dailyData={dailyData} ejFilter={ejFilter} onRowClick={(diaInfo) => setDetail({ type: "dia", data: diaInfo })} />
    </div>
  );
};
