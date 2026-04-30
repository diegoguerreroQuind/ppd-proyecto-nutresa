import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, Legend, ResponsiveContainer,
} from "recharts";
import { useTheme } from "../../context/ThemeContext";
import { Card, SectionTitle, CustomTooltip, Th, Td, MonoTd } from "../../components/ui";
import { fmtMin, fmtM } from "../../utils/format";
import { useDashboard } from "../../context/useDashboard";

// ─── Gráfico de área semanal ──────────────────────────────────────────────────
const GraficoSemanal = ({ weeklyData, ejFilter, banda }) => {
  const { colors: C, theme } = useTheme();
  return (
    <Card>
      <SectionTitle>Tendencia Semanal — Promedio por Ejecución</SectionTitle>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={weeklyData ?? []}>
          <defs>
            <linearGradient id="gEJ1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={C.blue}  stopOpacity={0.3} />
              <stop offset="95%" stopColor={C.blue}  stopOpacity={0}   />
            </linearGradient>
            <linearGradient id="gEJ2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={C.amber} stopOpacity={0.3} />
              <stop offset="95%" stopColor={C.amber} stopOpacity={0}   />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={C.border}
            strokeOpacity={theme === "light" ? 0.8 : 0.5}
          />
          <XAxis dataKey="semana" tick={{ fill: C.textSub, fontSize: 11 }} />
          <YAxis tickFormatter={(v) => `${Math.round(v)}m`} tick={{ fill: C.textSub, fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={banda?.advertencia ?? 0} stroke={`${C.amber}66`} strokeDasharray="4 4" label={{ value: "Adv.", fill: C.amber, fontSize: 9 }} />
          <ReferenceLine y={banda?.critico ?? 0}     stroke={`${C.red}66`}   strokeDasharray="4 4" label={{ value: "Crít.", fill: C.red,   fontSize: 9 }} />
          <Legend wrapperStyle={{ fontSize: 11, color: C.textSub }} />
          {ejFilter !== "EJ2" && <Area type="monotone" dataKey="promEJ1" name="Ejecución 1" stroke={C.blue}  fill="url(#gEJ1)" strokeWidth={2} dot={{ fill: C.blue,  r: 3 }} />}
          {ejFilter !== "EJ1" && <Area type="monotone" dataKey="promEJ2" name="Ejecución 2" stroke={C.amber} fill="url(#gEJ2)" strokeWidth={2} dot={{ fill: C.amber, r: 3 }} />}
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};

// ─── Tabla semanal ────────────────────────────────────────────────────────────
const TablaSemanal = ({ weeklyData, ejFilter, banda, onRowClick }) => {
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
        <SectionTitle noMargin>Resumen Semanal · Clic para detalle</SectionTitle>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr style={{ background: C.cardAlt }}>
              {["Semana","Ejec. EJ1","Ejec. EJ2","Mínimo","Máximo","Pico Cargados","Pico Actualizados","Fallos"].map((h) => (
                <Th key={h}>{h}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(weeklyData ?? []).map((semanaInfo, index) => {
              const isAlternate = theme === "light" && index % 2 === 0;
              return (
                <tr
                  key={index}
                  onClick={() => onRowClick(semanaInfo)}
                  className="cursor-pointer transition-colors"
                  style={{
                    color: C.text,
                    background: isAlternate ? C.cardAlt : "transparent"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = C.cardAlt}
                  onMouseOut={(e) => e.currentTarget.style.background = isAlternate ? C.cardAlt : "transparent"}
                >
                  <Td style={{ color: C.green, fontWeight: 600 }}>{semanaInfo.semana}</Td>
                  <MonoTd style={{ color: ejFilter === "EJ2" ? C.textMuted : C.blue }}>{semanaInfo.promEJ1 != null ? fmtMin(semanaInfo.promEJ1) : "–"}</MonoTd>
                  <MonoTd style={{ color: ejFilter === "EJ1" ? C.textMuted : C.amber }}>{semanaInfo.promEJ2 != null ? fmtMin(semanaInfo.promEJ2) : "–"}</MonoTd>
                  <MonoTd style={{ color: C.green, fontSize: 12 }}>{semanaInfo.minTotal != null ? fmtMin(semanaInfo.minTotal) : "–"}</MonoTd>
                  <MonoTd style={{ fontSize: 12, color: (semanaInfo.maxTotal ?? 0) > (banda?.critico ?? 0) ? C.red : C.text }}>{semanaInfo.maxTotal != null ? fmtMin(semanaInfo.maxTotal) : "–"}</MonoTd>
                  <Td>
                    <span style={{
                      color: C.teal,
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 12,
                    }}>
                      {semanaInfo.picoReg ? fmtM(semanaInfo.picoReg) : "–"}
                    </span>
                  </Td>
                  <Td>
                    <span style={{
                      color: (semanaInfo.picoRegAct ?? 0) > 50e6 ? C.red : C.teal,
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 12,
                    }}>
                      {semanaInfo.picoRegAct ? fmtM(semanaInfo.picoRegAct) : "–"}
                    </span>
                  </Td>
                  <Td>
                    {semanaInfo.fallos > 0 ? (
                      <span
                        style={{
                          background: C.redBg,
                          color: C.red,
                          border: `1px solid ${C.redBdr}`,
                          padding: "2px 10px",
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {semanaInfo.fallos} {semanaInfo.fallos === 1 ? "fallo" : "fallos"}
                      </span>
                    ) : (
                      <span style={{ color: C.green, fontSize: 11 }}>✓ OK</span>
                    )}
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
export const VistaSemana = () => {
  const { ejFilter, setDetail, weeklyData, banda } = useDashboard();

  const handleRowClick = (semanaInfo) => setDetail({ type: "semana", data: semanaInfo });

  return (
    <div className="flex flex-col gap-6">
      <GraficoSemanal weeklyData={weeklyData} ejFilter={ejFilter} banda={banda} />
      <TablaSemanal   weeklyData={weeklyData} ejFilter={ejFilter} banda={banda} onRowClick={handleRowClick} />
    </div>
  );
};
