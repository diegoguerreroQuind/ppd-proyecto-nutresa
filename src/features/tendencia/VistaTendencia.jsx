import { useMemo } from "react";
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

import { NivelesLeyenda } from "../../components/ui/NivelesLeyenda";

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

// ─── Tooltip local para manejar fallos ────────────────────────────────────────
const TendenciaTooltip = ({ active, payload, label, rawData, fallosMap }) => {
  const { colors: C } = useTheme();
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  
  return (
    <div className="rounded-xl p-3 shadow-2xl border" 
         style={{ background: C.card, borderColor: C.border, backdropFilter: "blur(10px)" }}>
      <p className="text-[10px] uppercase tracking-tighter mb-2 font-bold" style={{ color: C.textSub }}>
        {label}
      </p>
      <div className="flex flex-col gap-2">
        {payload.map((item, idx) => {
          const isEJ1 = item.dataKey === "ejEJ1";
          const turno = isEJ1 ? "EJ1" : "EJ2";
          const color = isEJ1 ? C.blue : C.amber;
          const valor = item.value;

          if (valor != null) {
            return (
              <div key={idx} className="flex items-center justify-between gap-4">
                <span className="text-[11px] font-medium" style={{ color: C.textSub }}>{item.name}:</span>
                <span className="text-xs font-bold" style={{ color }}>{fmtMin(valor)}</span>
              </div>
            );
          }

          // Caso de fallo
          const fallo = rawData?.some(d => d.fecha === data.fecha && d.turno === turno && !d.exitoso);
          if (fallo) {
            return (
              <div key={idx} className="flex flex-col gap-0.5 border-t pt-1 mt-1" style={{ borderColor: `${C.red}22` }}>
                <span className="text-[10px] font-bold" style={{ color: C.red }}>{item.name}: FALLO</span>
                <span className="text-[10px] italic leading-tight" style={{ color: C.red, maxWidth: 160 }}>
                  {fallosMap[data.fecha]?.[turno] ?? "Ejecución fallida"}
                </span>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};


// ─── Gráfico de tendencia ─────────────────────────────────────────────────────
const GraficoTendencia = ({ dailyData, ejFilter, banda, anotacionesData, rawData, fallosMap, fechasFallo }) => {
  const { colors: C, theme } = useTheme();
  
  const getTipoColor = (tipo) => ({
    info: C.blue,
    advertencia: C.amber,
    critico: C.red,
  }[tipo] ?? C.textSub);

  // Custom dot para EJ1
  const DotEJ1 = (props) => {
    const { cx, cy, payload } = props;
    if (!payload || payload.ejEJ1 == null) {
      const fallo = rawData?.some(d => d.fecha === payload.fecha && d.turno === "EJ1" && !d.exitoso);
      if (!fallo) return null;
      return (
        <g>
          <circle cx={cx} cy={cy || 150} r={6} fill={C.red} stroke="#ffffff" strokeWidth={2} opacity={0.9} />
          <text x={cx} y={(cy || 150) - 10} textAnchor="middle" fill={C.red} fontSize={10} fontWeight={700}>✕</text>
        </g>
      );
    }
    return buildDot(banda, C.blue, C)(props);
  };

  // Custom dot para EJ2
  const DotEJ2 = (props) => {
    const { cx, cy, payload } = props;
    if (!payload || payload.ejEJ2 == null) {
      const fallo = rawData?.some(d => d.fecha === payload.fecha && d.turno === "EJ2" && !d.exitoso);
      if (!fallo) return null;
      return (
        <g>
          <circle cx={cx} cy={cy || 150} r={6} fill={C.red} stroke="#ffffff" strokeWidth={2} opacity={0.9} />
          <text x={cx} y={(cy || 150) - 10} textAnchor="middle" fill={C.red} fontSize={10} fontWeight={700}>✕</text>
        </g>
      );
    }
    return buildDot(banda, C.amber, C)(props);
  };

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
          <Tooltip content={<TendenciaTooltip rawData={rawData} fallosMap={fallosMap} />} />
          <ReferenceLine y={banda?.advertencia ?? 0} stroke={`${C.amber}88`} strokeDasharray="5 3" label={{ value: "Adv",   fill: C.amber, fontSize: 9 }} />
          <ReferenceLine y={banda?.critico ?? 0}     stroke={`${C.red}88`}   strokeDasharray="5 3" label={{ value: "Crít",  fill: C.red,   fontSize: 9 }} />
          <ReferenceLine y={banda?.media ?? 0}       stroke={`${C.green}66`} strokeDasharray="3 3" label={{ value: "Media", fill: C.green, fontSize: 9 }} />
          
          {fechasFallo.map(fecha => {
            const punto = (dailyData ?? []).find(d => d.fecha === fecha);
            if (!punto) return null;
            return (
              <ReferenceLine
                key={`fallo-${fecha}`}
                x={punto.label}
                stroke={C.red}
                strokeDasharray="3 3"
                strokeWidth={1}
                strokeOpacity={0.6}
                label={{
                  value: "✕",
                  fill:  C.red,
                  fontSize: 10,
                  position: "top",
                }}
              />
            );
          })}

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
            <Line 
              type="monotone" 
              dataKey="ejEJ1" 
              name="Ejecución 1" 
              stroke={C.blue}  
              strokeWidth={2} 
              connectNulls={true}
              dot={<DotEJ1 />}
              activeDot={{ r: 5, fill: C.blue }}
            />
          )}
          {ejFilter !== "EJ1" && (
            <Line 
              type="monotone" 
              dataKey="ejEJ2" 
              name="Ejecución 2" 
              stroke={C.amber} 
              strokeWidth={2} 
              connectNulls={true}
              dot={<DotEJ2 />}
              activeDot={{ r: 5, fill: C.amber }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      <div className="px-6 pb-2 flex items-center gap-2" style={{ marginTop: -10 }}>
        <svg width={12} height={12}>
          <circle cx={6} cy={6} r={5} fill={C.red} stroke="#ffffff" strokeWidth={1.5} />
        </svg>
        <span className="text-[10px] font-medium" style={{ color: C.textMuted }}>
          Ejecución fallida o sin registro (✕)
        </span>
      </div>
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
  const { ejFilter, filtered, dailyData, banda, anotacionesData, rawData } = useDashboard();

  const fallosMap = useMemo(() => {
    const map = {};
    (rawData ?? [])
      .filter(d => !d.exitoso)
      .forEach(d => {
        if (!map[d.fecha]) map[d.fecha] = {};
        map[d.fecha][d.turno] = d.notas || "Ejecución fallida";
      });
    return map;
  }, [rawData]);

  const fechasFallo = useMemo(() => 
    [...new Set(
      (rawData ?? [])
        .filter(d => !d.exitoso)
        .map(d => d.fecha)
    )],
    [rawData]
  );

  return (
    <div className="flex flex-col gap-6">
      <GraficoTendencia 
        dailyData={dailyData} 
        ejFilter={ejFilter} 
        banda={banda} 
        anotacionesData={anotacionesData}
        rawData={rawData}
        fallosMap={fallosMap}
        fechasFallo={fechasFallo}
      />
      <TablaClasificacion filtered={filtered} banda={banda} />
    </div>
  );
};
