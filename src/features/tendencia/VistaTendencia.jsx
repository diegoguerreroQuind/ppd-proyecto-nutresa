import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, Legend, ResponsiveContainer,
} from "recharts";
import { useTheme } from "../../context/ThemeContext";
import { 
  ejColor as ejColorFn, 
  nivelColorMap as nivelColorMapFn 
} from "../../constants/colors";
import { Badge, Card, SectionTitle, CustomTooltip, Th, Td, MonoTd } from "../../components/ui";
import { fmtMin, getDayName } from "../../utils/format";
import { clasificarNivel } from "../../utils/anomalias";
import { useDashboard } from "../../context/useDashboard";

const NivelesLeyenda = () => {
  const { colors: C } = useTheme();
  return (
    <div
      className="px-5 py-4 flex flex-col gap-3"
      style={{
        borderTop:  `1px solid ${C.border}`,
        background: C.cardAlt,
      }}
    >
      <p
        className="text-[11px] uppercase tracking-widest font-semibold m-0"
        style={{ color: C.textMuted }}
      >
        Significado de alertas
      </p>
      <div className="grid gap-2"
           style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
        {[
          {
            nivel: "FALLO",
            color: C.red,
            bg:    C.redBg,
            bdr:   C.redBdr,
            desc:  "Sin registro de tiempo. Falla o cancelación del proceso.",
          },
          {
            nivel: "CRÍTICO",
            color: C.red,
            bg:    C.redBg,
            bdr:   C.redBdr,
            desc:  "Supera media + 2σ (30d). Posible impacto operativo.",
          },
          {
            nivel: "ADVERTENCIA",
            color: C.amber,
            bg:    `${C.amber}18`,
            bdr:   `${C.amber}44`,
            desc:  "Supera media + 1.5σ (30d). Requiere monitoreo.",
          },
          {
            nivel: "NORMAL",
            color: C.textSub,
            bg:    `${C.border}88`,
            bdr:   C.border2,
            desc:  "Dentro de la banda esperada. Incluido por fallo.",
          },
          {
            nivel: "RÁPIDO",
            color: C.green,
            bg:    `${C.green}18`,
            bdr:   `${C.green}44`,
            desc:  "Por debajo de media − 1.5σ. Ejecución inusualmente rápida.",
          },
        ].map(({ nivel, color, bg, bdr, desc }) => (
          <div
            key={nivel}
            className="flex items-start gap-2.5 rounded-lg p-2.5"
            style={{ background: bg, border: `1px solid ${bdr}` }}
          >
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded shrink-0 mt-0.5 uppercase tracking-wide"
              style={{ color, background: `${color}18`, border: `1px solid ${color}44` }}
            >
              {nivel}
            </span>
            <span
              className="text-[11px] leading-relaxed"
              style={{ color: C.textMuted }}
            >
              {desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Mini-cards de referencia de la banda ────────────────────────────────────
const BandaReferencia = ({ banda }) => {
  const { colors: C } = useTheme();
  return (
    <div className="flex gap-4 mb-3 flex-wrap">
      {[
        { label: "Media 30d",         value: fmtMin(banda?.media ?? 0),       color: C.green },
        { label: "Umbral advertencia",value: fmtMin(banda?.advertencia ?? 0), color: C.amber },
        { label: "Umbral crítico",    value: fmtMin(banda?.critico ?? 0),     color: C.red   },
      ].map(({ label, value, color }) => (
        <div key={label} className="rounded-lg py-2 px-3.5" style={{ background: C.cardAlt, borderLeft: `3px solid ${color}` }}>
          <p className="text-[9px] m-0 mb-0.5 uppercase" style={{ color: C.textMuted }}>{label}</p>
          <p className="text-base font-bold m-0" style={{ color, fontFamily: "'IBM Plex Mono', monospace" }}>{value}</p>
        </div>
      ))}
    </div>
  );
};

// ─── Dot personalizado con color según nivel ──────────────────────────────────
const buildDot = (banda, defaultColor, C) => (props) => {
  const { cx, cy, value, index } = props;
  if (!value) return null;
  const color = value > (banda?.critico ?? 0) ? C.red : value > (banda?.advertencia ?? 0) ? C.amber : defaultColor;
  return <circle key={`dot-${index}`} cx={cx} cy={cy} r={value > (banda?.advertencia ?? 0) ? 5 : 3} fill={color} stroke={C.bg} strokeWidth={1} />;
};

// ─── Gráfico de tendencia ─────────────────────────────────────────────────────
const GraficoTendencia = ({ dailyData, ejFilter, banda, anotacionesData }) => {
  const { colors: C, theme } = useTheme();
  
  const getTipoColor = (tipo) => ({
    info: C.blue,
    advertencia: C.amber,
    critico: C.red,
  }[tipo] ?? C.textSub);

  return (
    <Card>
      <SectionTitle>Tendencia diaria con banda de tolerancia (30 días)</SectionTitle>
      <BandaReferencia banda={banda} />
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={dailyData ?? []}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={C.border}
            strokeOpacity={theme === "light" ? 0.8 : 0.5}
          />
          <XAxis dataKey="label" tick={{ fill: C.textSub, fontSize: 9 }} interval={2} angle={-30} textAnchor="end" height={50} />
          <YAxis tickFormatter={(v) => `${Math.round(v)}m`} tick={{ fill: C.textSub, fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={banda?.advertencia ?? 0} stroke={`${C.amber}88`} strokeDasharray="5 3" label={{ value: "Adv",   fill: C.amber, fontSize: 9 }} />
          <ReferenceLine y={banda?.critico ?? 0}     stroke={`${C.red}88`}   strokeDasharray="5 3" label={{ value: "Crít",  fill: C.red,   fontSize: 9 }} />
          <ReferenceLine y={banda?.media ?? 0}       stroke={`${C.green}66`} strokeDasharray="3 3" label={{ value: "Media", fill: C.green, fontSize: 9 }} />
          {(anotacionesData ?? []).map(a => {
            const color = getTipoColor(a.tipo);
            return (
              <ReferenceLine
                key={a.id}
                x={`${getDayName(a.fecha_inicio)} ${a.fecha_inicio.slice(5)}`}
                stroke={color}
                strokeDasharray="4 2"
                strokeWidth={1.5}
                label={{
                  value: a.titulo.length > 15
                    ? `${a.titulo.slice(0, 15)}…`
                    : a.titulo,
                  fill: color,
                  fontSize: 9,
                  position: "top",
                }}
              />
            );
          })}
          <Legend wrapperStyle={{ fontSize: 11, color: C.textSub }} />
          {ejFilter !== "EJ2" && (
            <Line type="monotone" dataKey="ejEJ1" name="Ejecución 1" stroke={C.blue}  strokeWidth={2} dot={buildDot(banda, C.blue, C)}  />
          )}
          {ejFilter !== "EJ1" && (
            <Line type="monotone" dataKey="ejEJ2" name="Ejecución 2" stroke={C.amber} strokeWidth={2} dot={buildDot(banda, C.amber, C)} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

// ─── Tabla de clasificación ───────────────────────────────────────────────────
const TablaClasificacion = ({ filtered, banda }) => {
  const { colors: C, theme } = useTheme();
  const nivelColors = nivelColorMapFn(C);

  return (
    <Card
      overflow
      style={{
        border: theme === "light" ? `1px solid #c8cdde` : `1px solid ${C.border}`,
        borderRadius: 12,
      }}
    >
      <div className="py-4 px-5" style={{ borderBottom: `1px solid ${C.border}` }}>
        <SectionTitle noMargin>Clasificación de ejecuciones</SectionTitle>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr style={{ background: C.cardAlt }}>
              {["Fecha","Día","Ejecución","Tiempo","vs Media","Clasificación","Exitoso"].map((h) => (
                <Th key={h}>{h}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(filtered ?? []).map((ejecucion, index) => {
              const nivel = clasificarNivel(ejecucion.total_min, banda, ejecucion.exitoso);
              const diff  = ejecucion.total_min - (banda?.media ?? 0);
              const colorNivel = nivelColors[nivel] ?? C.textSub;
              const isSpecial = (nivel === "FALLO" || nivel === "CRÍTICO");
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
                  <Td>{ejecucion.fecha?.slice(5)}</Td>
                  <Td style={{ color: C.textSub }}>{ejecucion.dia_semana}</Td>
                  <Td style={{ fontWeight: 700, color: ejColorFn(ejecucion.turno, C) }}>{ejecucion.turno}</Td>
                  <MonoTd style={{ fontWeight: 600, color: nivel === "CRÍTICO" ? C.red : C.text }}>{ejecucion.total_min != null ? fmtMin(ejecucion.total_min) : "–"}</MonoTd>
                  <MonoTd style={{ fontSize: 11, color: diff > 0 ? C.red : C.green }}>{diff > 0 ? "+" : ""}{fmtMin(diff)}</MonoTd>
                  <Td>
                    {nivel === "FALLO" ? (
                      <span style={{
                        background:   C.redBg,
                        color:        C.red,
                        border:       `1px solid ${C.redBdr}`,
                        padding:      "2px 8px",
                        borderRadius: 4,
                        fontSize:     11,
                        fontWeight:   700,
                      }}>
                        FALLO
                      </span>
                    ) : (
                      <Badge label={nivel} color={colorNivel} />
                    )}
                  </Td>
                  <Td>{ejecucion.exitoso ? <span style={{ color: C.green }}>✓</span> : <span style={{ color: C.red }}>⚠</span>}</Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <NivelesLeyenda />
    </Card>
  );
};

// ─── Feature principal ────────────────────────────────────────────────────────
export const VistaTendencia = () => {
  const { ejFilter, filtered, dailyData, banda, anotacionesData } = useDashboard();
  return (
    <div className="flex flex-col gap-6">
      <GraficoTendencia dailyData={dailyData} ejFilter={ejFilter} banda={banda} anotacionesData={anotacionesData} />
      <TablaClasificacion filtered={filtered} banda={banda} />
    </div>
  );
};
