import { useMemo, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ReferenceArea, Legend, ResponsiveContainer,
} from "recharts";
import { useTheme } from "../../context/ThemeContext";
import {
  ejColor as ejColorFn,
  nivelColorMap as nivelColorMapFn,
} from "../../constants/colors";
import { Badge, Card, SectionTitle, Th, Td, MonoTd } from "../../components/ui";
import { fmtMin, getDayName } from "../../utils/format";
import { clasificarNivel } from "../../utils/anomalias";
import { useDashboard } from "../../context/useDashboard";
import { NivelesLeyenda } from "../../components/ui/NivelesLeyenda";

// ─── Mini-cards de referencia de la banda ────────────────────────────────────
const BandaReferencia = ({ banda }) => {
  const { colors: C } = useTheme();
  // Límite inferior simétrico: media - (advertencia - media)
  const lowerBound = banda ? Math.max(0, 2 * banda.media - banda.advertencia) : 0;

  const items = [
    { label: "Límite inf. (rápido)", value: fmtMin(lowerBound),              color: C.teal  },
    { label: "Media 30d",            value: fmtMin(banda?.media ?? 0),        color: C.green },
    { label: "Umbral advertencia",   value: fmtMin(banda?.advertencia ?? 0),  color: C.amber },
    { label: "Umbral crítico",       value: fmtMin(banda?.critico ?? 0),      color: C.red   },
  ];

  return (
    <div className="flex gap-3 mb-4 flex-wrap">
      {items.map(({ label, value, color }) => (
        <div
          key={label}
          className="rounded-lg py-2 px-3.5 flex-1 min-w-[110px]"
          style={{ background: C.cardAlt, borderLeft: `3px solid ${color}` }}
        >
          <p className="text-[9px] m-0 mb-0.5 uppercase tracking-wide" style={{ color: C.textMuted }}>{label}</p>
          <p className="text-[15px] font-bold m-0" style={{ color, fontFamily: "'IBM Plex Mono', monospace" }}>{value}</p>
        </div>
      ))}
    </div>
  );
};

// ─── Icono SVG para anotaciones en la línea de referencia ────────────────────
// Recibe viewBox de Recharts + color/letter; no usa texto inline → sin solapamiento
const AnotIconLabel = ({ viewBox, color, letter }) => {
  if (!viewBox) return null;
  const { x, y } = viewBox;
  return (
    <g>
      <circle cx={x} cy={y + 11} r={6} fill={color} fillOpacity={0.9} />
      <text
        x={x} y={y + 15}
        textAnchor="middle"
        fill="#fff"
        fontSize={8}
        fontWeight={800}
      >
        {letter}
      </text>
    </g>
  );
};

const TIPO_LETTER = { info: "i", advertencia: "!", critico: "✕" };

// ─── Tooltip local ────────────────────────────────────────────────────────────
const TendenciaTooltip = ({ active, payload, label, rawData, fallosMap }) => {
  const { colors: C } = useTheme();
  if (!active || !payload?.length) return null;

  const data = payload[0]?.payload;
  const anotaciones = data?.anotaciones ?? [];

  return (
    <div
      className="rounded-xl px-3.5 py-3 min-w-[170px] max-w-[240px]"
      style={{
        background: C.card,
        border:     `1px solid ${C.border2}`,
        boxShadow:  C.shadowMd,
      }}
    >
      <p className="text-[10px] uppercase tracking-wider mb-2 font-bold m-0" style={{ color: C.textMuted }}>
        {label}
      </p>

      {/* Valores de ejecución */}
      <div className="flex flex-col gap-1.5">
        {payload.map((item, idx) => {
          const isEJ1 = item.dataKey === "ejEJ1";
          const turno = isEJ1 ? "EJ1" : "EJ2";
          const color = isEJ1 ? C.blue : C.amber;
          const valor = item.value;

          if (valor != null) {
            return (
              <div key={idx} className="flex items-center justify-between gap-4">
                <span className="text-[11px]" style={{ color: C.textSub }}>{item.name}</span>
                <span className="text-xs font-bold font-mono" style={{ color }}>{fmtMin(valor)}</span>
              </div>
            );
          }

          const fallo = rawData?.some(
            d => d.fecha === data?.fecha && d.turno === turno && !d.exitoso
          );
          if (!fallo) return null;

          return (
            <div
              key={idx}
              className="flex flex-col gap-0.5 pt-1 mt-0.5"
              style={{ borderTop: `1px solid ${C.redBdr}` }}
            >
              <span className="text-[10px] font-bold" style={{ color: C.red }}>
                {item.name}: FALLO
              </span>
              {fallosMap[data?.fecha]?.[turno] && (
                <span className="text-[10px] italic leading-snug" style={{ color: C.red }}>
                  {fallosMap[data.fecha][turno]}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Anotaciones de bitácora para esta fecha */}
      {anotaciones.length > 0 && (
        <div
          className="mt-2 pt-2 flex flex-col gap-2"
          style={{ borderTop: `1px solid ${C.border}` }}
        >
          {anotaciones.map((a) => {
            const color = { info: C.blue, advertencia: C.amber, critico: C.red }[a.tipo] ?? C.textSub;
            return (
              <div key={a.id} className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
                    style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
                  >
                    {a.tipo}
                  </span>
                  <span className="text-[11px] font-semibold leading-tight" style={{ color: C.text }}>
                    {a.titulo}
                  </span>
                </div>
                {a.descripcion && (
                  <p className="text-[10px] italic m-0 leading-snug" style={{ color: C.textSub }}>
                    {a.descripcion}
                  </p>
                )}
                <span className="text-[9px]" style={{ color: C.textDim, fontFamily: "'IBM Plex Mono', monospace" }}>
                  {a.fecha_inicio}{a.fecha_fin ? ` → ${a.fecha_fin}` : ""}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Gráfico de tendencia ─────────────────────────────────────────────────────
const GraficoTendencia = ({ dailyData, ejFilter, banda, anotacionesData, rawData, fallosMap }) => {
  const { colors: C, theme } = useTheme();

  // Límite inferior de la banda normal (zona rápido/bajo)
  const lowerBound = banda ? Math.max(0, 2 * banda.media - banda.advertencia) : 0;

  const getTipoColor = useCallback((tipo) => (
    { info: C.blue, advertencia: C.amber, critico: C.red }[tipo] ?? C.textSub
  ), [C]);

  // Mapa label→anotaciones para enriquecer cada punto y mostrarlo en el tooltip
  const anotMap = useMemo(() => {
    const map = {};
    (anotacionesData ?? []).forEach(a => {
      const key = `${getDayName(a.fecha_inicio)} ${a.fecha_inicio.slice(5)}`;
      if (!map[key]) map[key] = [];
      map[key].push(a);
    });
    return map;
  }, [anotacionesData]);

  const enrichedData = useMemo(() =>
    (dailyData ?? []).map(d => ({
      ...d,
      anotaciones: anotMap[d.label] ?? null,
    })),
    [dailyData, anotMap]
  );

  // Dots EJ1 — useCallback evita re-montaje en cada render del padre
  const renderDotEJ1 = useCallback((props) => {
    const { cx, cy, payload } = props;
    if (!payload) return null;

    // Fallo: sin valor de ejecución
    if (payload.ejEJ1 == null) {
      if (!rawData?.some(d => d.fecha === payload.fecha && d.turno === "EJ1" && !d.exitoso))
        return null;
      return (
        <g>
          <circle cx={cx} cy={cy ?? 150} r={9} fill={C.red} fillOpacity={0.15} />
          <circle cx={cx} cy={cy ?? 150} r={5} fill={C.red} stroke={C.card} strokeWidth={1.5} />
          <text x={cx} y={(cy ?? 150) + 4} textAnchor="middle" fill={C.card} fontSize={8} fontWeight={800}>✕</text>
        </g>
      );
    }

    const val = payload.ejEJ1;
    const isCrit = val > (banda?.critico ?? 0);
    const isAdv  = !isCrit && val > (banda?.advertencia ?? 0);
    const color  = isCrit ? C.red : isAdv ? C.amber : C.blue;
    const r      = (isCrit || isAdv) ? 5 : 3;
    return <circle cx={cx} cy={cy} r={r} fill={color} stroke={C.card} strokeWidth={1} />;
  }, [banda, C, rawData]);

  // Dots EJ2 — advertencia muestra borde rojo para diferenciar del color base amber
  const renderDotEJ2 = useCallback((props) => {
    const { cx, cy, payload } = props;
    if (!payload) return null;

    if (payload.ejEJ2 == null) {
      if (!rawData?.some(d => d.fecha === payload.fecha && d.turno === "EJ2" && !d.exitoso))
        return null;
      return (
        <g>
          <circle cx={cx} cy={cy ?? 150} r={9} fill={C.red} fillOpacity={0.15} />
          <circle cx={cx} cy={cy ?? 150} r={5} fill={C.red} stroke={C.card} strokeWidth={1.5} />
          <text x={cx} y={(cy ?? 150) + 4} textAnchor="middle" fill={C.card} fontSize={8} fontWeight={800}>✕</text>
        </g>
      );
    }

    const val     = payload.ejEJ2;
    const isCrit  = val > (banda?.critico ?? 0);
    const isAdv   = !isCrit && val > (banda?.advertencia ?? 0);
    // Crítico → rojo; advertencia → amber con borde rojo; normal → amber
    const fill    = isCrit ? C.red : C.amber;
    const stroke  = isAdv  ? C.red : C.card;
    const sw      = isAdv  ? 2     : 1;
    const r       = (isCrit || isAdv) ? 5 : 3;
    return <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth={sw} />;
  }, [banda, C, rawData]);

  return (
    <Card>
      <SectionTitle>Tendencia diaria con banda de tolerancia (30 días)</SectionTitle>
      <BandaReferencia banda={banda} />

      <ResponsiveContainer width="100%" height={340}>
        <LineChart
          data={enrichedData}
          margin={{ top: 12, right: 110, left: 0, bottom: 8 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={C.border}
            strokeOpacity={theme === "light" ? 0.7 : 0.4}
            vertical={false}
          />

          {/* ── Bandas de tolerancia ─────────────────────────────────────── */}
          <ReferenceArea
            y1={lowerBound}
            y2={banda?.advertencia ?? 0}
            fill={C.green}
            fillOpacity={0.07}
            stroke="none"
          />
          <ReferenceArea
            y1={banda?.advertencia ?? 0}
            y2={banda?.critico ?? 0}
            fill={C.amber}
            fillOpacity={0.12}
            stroke="none"
          />
          <ReferenceArea
            y1={banda?.critico ?? 0}
            fill={C.red}
            fillOpacity={0.07}
            stroke="none"
          />

          <XAxis
            dataKey="label"
            tick={{ fill: C.textMuted, fontSize: 10 }}
            tickLine={{ stroke: C.border }}
            axisLine={{ stroke: C.border }}
            interval={3}
            angle={-35}
            textAnchor="end"
            height={52}
          />
          <YAxis
            tickFormatter={(v) => v === 0 ? "0" : fmtMin(v)}
            tick={{ fill: C.textMuted, fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={46}
          />

          <Tooltip
            content={<TendenciaTooltip rawData={rawData} fallosMap={fallosMap} />}
            cursor={{ stroke: C.border2, strokeWidth: 1 }}
          />

          {/* ── Líneas de referencia con valor incluido ───────────────────── */}
          <ReferenceLine
            y={banda?.media ?? 0}
            stroke={C.green}
            strokeDasharray="3 3"
            strokeWidth={1.5}
            strokeOpacity={0.75}
            label={{ value: `Media · ${fmtMin(banda?.media ?? 0)}`, position: "right", fill: C.green, fontSize: 9, fontWeight: 600 }}
          />
          <ReferenceLine
            y={banda?.advertencia ?? 0}
            stroke={C.amber}
            strokeDasharray="5 3"
            strokeWidth={1.5}
            strokeOpacity={0.85}
            label={{ value: `Adv · ${fmtMin(banda?.advertencia ?? 0)}`, position: "right", fill: C.amber, fontSize: 9, fontWeight: 600 }}
          />
          <ReferenceLine
            y={banda?.critico ?? 0}
            stroke={C.red}
            strokeDasharray="5 3"
            strokeWidth={1.5}
            strokeOpacity={0.85}
            label={{ value: `Crít · ${fmtMin(banda?.critico ?? 0)}`, position: "right", fill: C.red, fontSize: 9, fontWeight: 600 }}
          />

          {/* ── Anotaciones de bitácora — solo icono, texto en tooltip ─────── */}
          {(anotacionesData ?? []).map((a) => {
            const color  = getTipoColor(a.tipo);
            const letter = TIPO_LETTER[a.tipo] ?? "·";
            return (
              <ReferenceLine
                key={a.id}
                x={`${getDayName(a.fecha_inicio)} ${a.fecha_inicio.slice(5)}`}
                stroke={color}
                strokeDasharray="4 2"
                strokeWidth={1.5}
                strokeOpacity={0.7}
                label={<AnotIconLabel color={color} letter={letter} />}
              />
            );
          })}

          <Legend
            wrapperStyle={{ fontSize: 11, color: C.textSub, paddingTop: 6 }}
            iconType="circle"
            iconSize={8}
          />

          {ejFilter !== "EJ2" && (
            <Line
              type="monotone"
              dataKey="ejEJ1"
              name="Ejecución 1"
              stroke={C.blue}
              strokeWidth={2}
              connectNulls
              dot={renderDotEJ1}
              activeDot={{ r: 6, fill: C.blue, stroke: C.card, strokeWidth: 2 }}
              animationDuration={400}
            />
          )}
          {ejFilter !== "EJ1" && (
            <Line
              type="monotone"
              dataKey="ejEJ2"
              name="Ejecución 2"
              stroke={C.amber}
              strokeWidth={2}
              connectNulls
              dot={renderDotEJ2}
              activeDot={{ r: 6, fill: C.amber, stroke: C.card, strokeWidth: 2 }}
              animationDuration={400}
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* ── Leyenda de estados de puntos ─────────────────────────────────── */}
      <div
        className="px-5 py-2.5 flex items-center gap-4 flex-wrap"
        style={{ borderTop: `1px solid ${C.border}` }}
      >
        {[
          {
            icon: (
              <g>
                <circle cx={7} cy={7} r={5} fill={C.red} stroke="white" strokeWidth={1.5} />
                <text x={7} y={11} textAnchor="middle" fill="white" fontSize={8} fontWeight={800}>✕</text>
              </g>
            ),
            label: "Ejecución fallida",
          },
          {
            icon: <circle cx={7} cy={7} r={5} fill={C.amber} stroke={C.red} strokeWidth={2} />,
            label: "Advertencia (EJ2)",
          },
          {
            icon: <circle cx={7} cy={7} r={5} fill={C.amber} />,
            label: "En advertencia",
          },
          {
            icon: <circle cx={7} cy={7} r={5} fill={C.red} />,
            label: "Crítico",
          },
        ].map(({ icon, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <svg width={14} height={14}>{icon}</svg>
            <span className="text-[10px]" style={{ color: C.textMuted }}>{label}</span>
          </div>
        ))}
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
        border:       `1px solid ${theme === "light" ? C.border2 : C.border}`,
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
              {["Fecha", "Día", "Ejecución", "Tiempo", "vs Media", "Clasificación", "Exitoso"].map((h) => (
                <Th key={h}>{h}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(filtered ?? []).map((ejecucion, index) => {
              const nivel      = clasificarNivel(ejecucion.total_min, banda, ejecucion.exitoso);
              const diff       = ejecucion.total_min - (banda?.media ?? 0);
              const colorNivel = nivelColors[nivel] ?? C.textSub;
              const isSpecial  = nivel === "FALLO" || nivel === "CRÍTICO";
              const isAlternate = theme === "light" && index % 2 === 0 && !isSpecial;
              const rowBg      = isSpecial ? C.redBg : (isAlternate ? C.cardAlt : "transparent");

              return (
                <tr
                  key={index}
                  className="transition-colors"
                  style={{ background: rowBg, color: C.text }}
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
                  <MonoTd style={{ fontWeight: 600, color: nivel === "CRÍTICO" ? C.red : C.text }}>
                    {ejecucion.total_min != null ? fmtMin(ejecucion.total_min) : "–"}
                  </MonoTd>
                  <MonoTd style={{ fontSize: 11, color: diff > 0 ? C.red : C.green }}>
                    {diff > 0 ? "+" : ""}{fmtMin(diff)}
                  </MonoTd>
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
                  <Td>
                    {ejecucion.exitoso
                      ? <span style={{ color: C.green }}>✓</span>
                      : <span style={{ color: C.red }}>⚠</span>}
                  </Td>
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

  return (
    <div className="flex flex-col gap-6">
      <GraficoTendencia
        dailyData={dailyData}
        ejFilter={ejFilter}
        banda={banda}
        anotacionesData={anotacionesData}
        rawData={rawData}
        fallosMap={fallosMap}
      />
      <TablaClasificacion filtered={filtered} banda={banda} />
    </div>
  );
};
