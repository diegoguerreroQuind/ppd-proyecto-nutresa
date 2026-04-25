import { ejColor } from "../../constants/colors";
import { Badge, Card } from "../../components/ui";
import { fmtMin, fmtM, getDayName } from "../../utils/format";
import { clasificarNivel, colorDeNivel } from "../../utils/anomalias";
import { FECHA_MIN, FECHA_MAX } from "../../constants/config";
import { useDashboard } from "../../context/useDashboard";

// ─── Tarjeta individual de ejecución en el día ────────────────────────────────
const EjecucionDiaCard = ({ item, banda }) => {
  const nivel = clasificarNivel(item.total_min, banda);
  const clr   = ejColor(item.turno || item.ejecucion); // Fallback for old data if needed

  return (
    <Card style={{ borderLeft: `3px solid ${clr}`, borderColor: item.exitoso ? "var(--color-border)" : "var(--color-quind-red-bdr)" }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-base font-bold" style={{ color: clr }}>
          {(item.turno || item.ejecucion) === "6am" ? "🌅" : "🌇"} Ejecución {item.turno || item.ejecucion}
        </span>
        <div className="flex gap-2 items-center">
          <Badge label={nivel} color={colorDeNivel(nivel)} />
          <span className={`text-[11px] py-[3px] px-2.5 rounded-full ${item.exitoso ? "bg-quind-ok-bg text-quind-teal" : "bg-quind-red-bg text-quind-red"}`}>
            {item.exitoso ? "✓ Exitosa" : "⚠ Con errores"}
          </span>
        </div>
      </div>

      {/* Tiempos */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Tiempo Total",     value: item.total_min != null ? fmtMin(item.total_min) : "–",         colorClass: "text-quind-green"  },
          { label: "Tiempo Directo",   value: item.directo_min != null ? fmtMin(item.directo_min) : "–",     colorClass: "text-quind-blue"   },
          { label: "Tiempo Indirecto", value: item.indirecto_min != null ? fmtMin(item.indirecto_min) : "–", colorClass: "text-quind-purple" },
        ].map(({ label, value, colorClass }) => (
          <div key={label} className="text-center bg-card-alt rounded-lg py-2.5 px-1.5">
            <p className="text-[9px] text-text-muted m-0 mb-1 uppercase">{label}</p>
            <p className={`text-xl font-bold m-0 ${colorClass}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Banda de referencia */}
      <div className="mt-3 pt-3 border-t border-border">
        <span className="text-[11px] text-text-muted">
          Media: {fmtMin(banda?.media ?? 0)} · Adv.: {fmtMin(banda?.advertencia ?? 0)} · Crít.: {fmtMin(banda?.critico ?? 0)}
        </span>
      </div>

      {/* Registros */}
      {item.registros_cargados != null && (
        <div className="mt-2 flex justify-between">
          <span className="text-xs text-text-muted">Registros cargados</span>
          <span className="text-[13px] text-quind-teal font-semibold">{fmtM(item.registros_cargados)}</span>
        </div>
      )}
      {item.registros_actualizados != null && (
        <div className="mt-1 flex justify-between">
          <span className="text-xs text-text-muted">Registros actualizados (delta)</span>
          <span className={`text-[13px] font-semibold ${item.registros_actualizados > 50e6 ? "text-quind-red" : "text-quind-teal"}`}>
            {fmtM(item.registros_actualizados)}
          </span>
        </div>
      )}
      {item.notas && <p className="mt-2 text-[11px] text-quind-amber">📝 {item.notas}</p>}
    </Card>
  );
};

// ─── Barra de posición en la banda ───────────────────────────────────────────
const BandaPositionBar = ({ items, banda }) => (
  <Card>
    <p className="m-0 mb-2.5 text-[11px] text-text-muted uppercase tracking-[1px]">
      Posición en banda de tolerancia
    </p>
    {(items ?? []).map((item, i) => {
      const pct = Math.min(100, (item.total_min / (banda?.critico || 1)) * 100);
      const clrClass = item.total_min > (banda?.critico ?? 0) ? "bg-quind-red" : item.total_min > (banda?.advertencia ?? 0) ? "bg-quind-amber" : "bg-quind-blue";
      return (
        <div key={i} className="mb-2.5">
          <div className="flex justify-between text-[11px] text-text-sub mb-1">
            <span>Ejecución {item.turno || item.ejecucion}</span>
            <span>{item.total_min != null ? fmtMin(item.total_min) : "–"}</span>
          </div>
          <div className="bg-border rounded h-2 overflow-hidden relative">
            <div className="absolute top-0 bottom-0 w-[1px] bg-quind-amber opacity-50" style={{ left: `${((banda?.advertencia ?? 0) / (banda?.critico || 1)) * 100}%` }} />
            <div className={`h-full rounded transition-[width] duration-500 ${clrClass}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
      );
    })}
  </Card>
);

// ─── Feature principal ────────────────────────────────────────────────────────
export const VistaFecha = () => {
  const { selectedDate, setSelectedDate, rawData, ejFilter, banda } = useDashboard();

  const items = (rawData ?? []).filter((ejecucion) => {
    if (ejecucion.fecha !== selectedDate) return false;
    return ejFilter === "ambos" || ejecucion.turno === ejFilter || ejecucion.ejecucion === ejFilter;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Selector de fecha */}
      <div className="flex gap-2.5 items-center">
        <input
          type="date"
          value={selectedDate}
          min={FECHA_MIN}
          max={FECHA_MAX}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-card border border-border-2 rounded-lg py-2 px-3.5 text-text-base text-[13px] outline-none"
        />
        <span className="text-text-dim text-xs">
          {selectedDate ? `— ${getDayName(selectedDate)}, ${selectedDate}` : "Selecciona una fecha"}
        </span>
      </div>

      {/* Contenido */}
      {selectedDate && (
        items.length === 0
          ? <p className="text-text-muted">No hay ejecuciones para esta fecha con el filtro aplicado.</p>
          : (
            <>
              {items.map((item, i) => (
                <EjecucionDiaCard key={i} item={item} banda={banda} />
              ))}
              <BandaPositionBar items={items} banda={banda} />
            </>
          )
      )}
    </div>
  );
};
