import { useState, useMemo } from "react";
import { useTheme } from "../../context/ThemeContext";
import { 
  ejColor as ejColorFn, 
  nivelColorMap as nivelColorMapFn 
} from "../../constants/colors";
import { Badge, Card } from "../../components/ui";
import { fmtMin, fmtM, getDayName } from "../../utils/format";
import { clasificarNivel } from "../../utils/anomalias";
import { FECHA_MIN, FECHA_MAX } from "../../constants/config";
import { useDashboard } from "../../context/useDashboard";

// ─── CalendarioPicker ────────────────────────────────────────────────────────
const CalendarioPicker = ({
  selectedDate, onChange, fechasConDatos, minDate, maxDate
}) => {
  const { colors: C, theme } = useTheme();

  // Initialize viewing month from selectedDate or today
  const [viewYear,  setViewYear]  = useState(() => {
    const d = selectedDate
      ? new Date(selectedDate + "T12:00:00")
      : new Date();
    return d.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    const d = selectedDate
      ? new Date(selectedDate + "T12:00:00")
      : new Date();
    return d.getMonth();
  });

  const MONTHS = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
  ];
  const DAYS = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

  // Build calendar grid
  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const toDateStr = (day) => {
    if (!day) return null;
    const m = String(viewMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${viewYear}-${m}-${d}`;
  };

  const isSelected  = (day) => toDateStr(day) === selectedDate;
  const isToday     = (day) => toDateStr(day) ===
    new Date().toISOString().split("T")[0];
  const hasData     = (day) => fechasConDatos.has(toDateStr(day));
  const isDisabled  = (day) => {
    if (!day) return true;
    const ds = toDateStr(day);
    return ds < minDate || ds > maxDate;
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  return (
    <div style={{
      background:   C.card,
      border:       theme === "light" ? `1px solid #c8cdde` : `1px solid ${C.border2}`,
      borderRadius: 16,
      padding:      24,
      width:        320,
      boxShadow:    C.shadow ?? "none",
      userSelect:   "none",
    }}>

      {/* Month navigation header */}
      <div style={{
        display:        "flex",
        justifyContent: "space-between",
        alignItems:     "center",
        marginBottom:   16,
      }}>
        <button
          onClick={prevMonth}
          style={{
            background:   "transparent",
            border:       `1px solid ${C.border2}`,
            borderRadius: 8,
            width:        32, height: 32,
            cursor:       "pointer",
            color:        C.textSub,
            fontSize:     16,
            display:      "flex",
            alignItems:   "center",
            justifyContent: "center",
          }}
        >‹</button>

        <span style={{
          fontSize:   14,
          fontWeight: 700,
          color:      C.text,
        }}>
          {MONTHS[viewMonth]} {viewYear}
        </span>

        <button
          onClick={nextMonth}
          style={{
            background:   "transparent",
            border:       `1px solid ${C.border2}`,
            borderRadius: 8,
            width:        32, height: 32,
            cursor:       "pointer",
            color:        C.textSub,
            fontSize:     16,
            display:      "flex",
            alignItems:   "center",
            justifyContent: "center",
          }}
        >›</button>
      </div>

      {/* Day names header */}
      <div style={{
        display:             "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap:                 2,
        marginBottom:        8,
      }}>
        {DAYS.map(day => (
          <div key={day} style={{
            textAlign:  "center",
            fontSize:   11,
            fontWeight: 600,
            color:      C.textMuted,
            padding:    "4px 0",
          }}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{
        display:             "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap:                 2,
      }}>
        {cells.map((day, idx) => {
          const selected  = isSelected(day);
          const today     = isToday(day);
          const withData  = hasData(day);
          const disabled  = isDisabled(day);

          return (
            <button
              key={idx}
              disabled={!day || disabled}
              onClick={() => day && !disabled &&
                onChange(toDateStr(day))}
              style={{
                width:        "100%",
                aspectRatio:  "1",
                borderRadius: 8,
                border:       today && !selected
                  ? `1px solid ${C.blue}`
                  : "1px solid transparent",
                background:   selected
                  ? C.blue
                  : "transparent",
                color:        selected
                  ? "#ffffff"
                  : disabled || !day
                    ? C.textDim
                    : C.text,
                fontSize:     13,
                fontWeight:   selected ? 700
                            : withData ? 600 : 400,
                cursor:       !day || disabled
                  ? "default" : "pointer",
                opacity:      !day ? 0 : disabled ? 0.3 : 1,
                position:     "relative",
                display:      "flex",
                flexDirection: "column",
                alignItems:   "center",
                justifyContent: "center",
                gap:          2,
                transition:   "all 0.1s ease",
              }}
            >
              {day || ""}
              {/* Dot indicator for dates with data */}
              {day && withData && !selected && (
                <span style={{
                  width:        4,
                  height:       4,
                  borderRadius: "50%",
                  background:   C.green,
                  position:     "absolute",
                  bottom:       3,
                  left:         "50%",
                  transform:    "translateX(-50%)",
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{
        display:       "flex",
        gap:           16,
        marginTop:     16,
        paddingTop:    12,
        borderTop:     `1px solid ${C.border}`,
        flexWrap:      "wrap",
      }}>
        <div style={{
          display:    "flex",
          alignItems: "center",
          gap:        6,
        }}>
          <span style={{
            width:        8, height: 8,
            borderRadius: "50%",
            background:   C.green,
            display:      "inline-block",
          }} />
          <span style={{ fontSize: 11, color: C.textMuted }}>
            Con datos
          </span>
        </div>
        <div style={{
          display:    "flex",
          alignItems: "center",
          gap:        6,
        }}>
          <span style={{
            width:        14, height: 14,
            borderRadius: 4,
            border:       `1px solid ${C.blue}`,
            display:      "inline-block",
          }} />
          <span style={{ fontSize: 11, color: C.textMuted }}>
            Hoy
          </span>
        </div>
        <div style={{
          display:    "flex",
          alignItems: "center",
          gap:        6,
        }}>
          <span style={{
            width:        14, height: 14,
            borderRadius: 4,
            background:   C.blue,
            display:      "inline-block",
          }} />
          <span style={{ fontSize: 11, color: C.textMuted }}>
            Seleccionado
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Tarjeta individual de ejecución en el día ────────────────────────────────
const EjecucionDiaCard = ({ item, banda }) => {
  const { colors: C } = useTheme();
  const nivelColors = nivelColorMapFn(C);
  const nivel = clasificarNivel(item.total_min, banda, item.exitoso);
  const clr   = ejColorFn(item.turno ?? item.ejecucion, C);
  const colorNivel = nivelColors[nivel] ?? C.textSub;

  return (
    <Card style={{ borderLeft: `3px solid ${clr}`, borderColor: item.exitoso ? C.border : C.redBdr }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-base font-bold" style={{ color: clr }}>
          Ejecución {item.turno ?? item.ejecucion}
        </span>
        <div className="flex gap-2 items-center">
          {item.total_min != null && item.total_min > 0 && (
            <Badge label={nivel} color={colorNivel} />
          )}
          <span
            className="text-[11px] py-[3px] px-2.5 rounded-full"
            style={{
              background: item.exitoso ? C.okBg : C.redBg,
              color: item.exitoso ? C.teal : C.red
            }}
          >
            {(!item.total_min || item.total_min <= 0)
              ? "Ejecución fallida — sin registro de tiempo"
              : item.exitoso ? "✓ Exitosa" : "⚠ Con errores"}
          </span>
        </div>
      </div>

      {/* Tiempos */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Tiempo Total",     value: item.total_min != null ? fmtMin(item.total_min) : "–",         color: C.green  },
          { label: "Tiempo Directo",   value: item.directo_min != null ? fmtMin(item.directo_min) : "–",     color: C.blue   },
          { label: "Tiempo Indirecto", value: item.indirecto_min != null ? fmtMin(item.indirecto_min) : "–", color: C.purple },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center rounded-lg py-2.5 px-1.5" style={{ background: C.cardAlt }}>
            <p className="text-[9px] m-0 mb-1 uppercase" style={{ color: C.textMuted }}>{label}</p>
            <p className="text-xl font-bold m-0" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Banda de referencia */}
      <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
        <span className="text-[11px]" style={{ color: C.textMuted }}>
          Media: {fmtMin(banda?.media ?? 0)} · Adv.: {fmtMin(banda?.advertencia ?? 0)} · Crít.: {fmtMin(banda?.critico ?? 0)}
        </span>
      </div>

      {/* Registros */}
      {item.registros_cargados != null && (
        <div className="mt-2 flex justify-between">
          <span className="text-xs" style={{ color: C.textMuted }}>Registros cargados</span>
          <span className="text-[13px] font-semibold" style={{ color: C.teal }}>{fmtM(item.registros_cargados)}</span>
        </div>
      )}
      {item.registros_actualizados != null && (
        <div className="mt-1 flex justify-between">
          <span className="text-xs" style={{ color: C.textMuted }}>Registros actualizados (delta)</span>
          <span className="text-[13px] font-semibold" style={{ color: item.registros_actualizados > 50e6 ? C.red : C.teal }}>
            {fmtM(item.registros_actualizados)}
          </span>
        </div>
      )}
      {item.notas && <p className="mt-2 text-[11px]" style={{ color: C.amber }}>📝 {item.notas}</p>}
    </Card>
  );
};

// ─── Barra de posición en la banda ───────────────────────────────────────────
const BandaPositionBar = ({ items, banda }) => {
  const { colors: C } = useTheme();
  return (
    <Card>
      <p className="m-0 mb-2.5 text-[11px] uppercase tracking-[1px]" style={{ color: C.textMuted }}>
        Posición en banda de tolerancia
      </p>
      {(items ?? []).map((item, index) => {
        const pct = Math.min(100, ((item.total_min || 0) / (banda?.critico || 1)) * 100);
        const color = item.total_min > (banda?.critico ?? 0) ? C.red : item.total_min > (banda?.advertencia ?? 0) ? C.amber : C.blue;
        return (
          <div key={index} className="mb-2.5">
            <div className="flex justify-between text-[11px] mb-1" style={{ color: C.textSub }}>
              <span>Ejecución {item.turno ?? item.ejecucion} {(!item.total_min || item.total_min <= 0) && " (FALLO)"}</span>
              <span>{item.total_min != null ? fmtMin(item.total_min) : "–"}</span>
            </div>
            <div className="rounded h-2 overflow-hidden relative" style={{ background: C.border }}>
              <div className="absolute top-0 bottom-0 w-[1px] opacity-50" style={{ background: C.amber, left: `${((banda?.advertencia ?? 0) / (banda?.critico || 1)) * 100}%` }} />
              <div className="h-full rounded transition-[width] duration-500" style={{ background: color, width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </Card>
  );
};

// ─── Feature principal ────────────────────────────────────────────────────────
export const VistaFecha = () => {
  const { selectedDate, setSelectedDate, rawData, ejFilter, banda } = useDashboard();
  const { colors: C } = useTheme();

  const fechasConDatos = useMemo(() =>
    new Set((rawData ?? []).map(d => d.fecha)),
    [rawData]
  );

  const items = (rawData ?? []).filter((ejecucion) => {
    if (ejecucion.fecha !== selectedDate) return false;
    return ejFilter === "ambos" || ejecucion.turno === ejFilter || ejecucion.ejecucion === ejFilter;
  });

  return (
    <div style={{
      display:   "flex",
      gap:       24,
      alignItems: "flex-start",
      flexWrap:  "wrap",
    }}>
      {/* Left: Calendar */}
      <div style={{ flexShrink: 0 }}>
        <CalendarioPicker
          selectedDate={selectedDate}
          onChange={setSelectedDate}
          fechasConDatos={fechasConDatos}
          minDate={FECHA_MIN}
          maxDate={FECHA_MAX}
        />
      </div>

      {/* Right: Execution cards or empty state */}
      <div style={{ flex: 1, minWidth: 300 }}>
        {selectedDate ? (
          items.length === 0 ? (
            <p style={{ color: C.textMuted }}>No hay ejecuciones para esta fecha con el filtro aplicado.</p>
          ) : (
            <div className="flex flex-col gap-6">
              {items.map((item, i) => (
                <EjecucionDiaCard key={i} item={item} banda={banda} />
              ))}
              <BandaPositionBar items={items} banda={banda} />
            </div>
          )
        ) : (
          <div style={{
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            justifyContent: "center",
            height:         300,
            gap:            12,
          }}>
            <span style={{ fontSize: 40 }}>📅</span>
            <p style={{
              color:    C.textMuted,
              fontSize: 14,
              margin:   0,
            }}>
              Selecciona una fecha en el calendario
            </p>
            <p style={{
              color:    C.textDim,
              fontSize: 12,
              margin:   0,
            }}>
              Los días con punto verde tienen datos registrados
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
