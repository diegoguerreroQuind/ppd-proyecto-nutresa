import { useMemo, useState } from "react";
import { C, ejColor } from "../../constants/colors";
import { Badge, Card, SectionTitle, Th, Td } from "../../components/ui";
import { fmtMin, fmtM, avg } from "../../utils/format";
import { clasificarNivel, colorDeNivel } from "../../utils/anomalias";
import { useDashboard } from "../../context/useDashboard";
import {
  createAnotacion,
  updateAnotacion,
  deactivateAnotacion,
} from "../../services/ejecucionesService";

// ─── Tarjeta de stats por ejecución ──────────────────────────────────────────
const EjecucionCard = ({ ej, kpis }) => {
  const d7  = kpis[ej]?.["7d"] ?? {};
  const d30 = kpis[ej]?.["30d"] ?? {};
  const clr = ejColor(ej);

  const stats = [
    { l: "Promedio",    v: fmtMin(d7.prom),            colorClass: ej === "6am" ? "text-quind-blue" : "text-quind-amber" },
    { l: "Mínimo",      v: fmtMin(d7.min),             colorClass: "text-quind-green" },
    { l: "Máximo",      v: fmtMin(d7.max),             colorClass: "text-quind-red"   },
    { l: "Fallos",      v: d7.fallos ?? 0,             colorClass: d7.fallos > 0 ? "text-quind-red" : "text-quind-green" },
  ];

  const prom7 = d7.prom ?? 0;
  const prom30 = d30.prom ?? 0;

  return (
    <Card style={{ borderLeft: `3px solid ${clr}` }}>
      <SectionTitle color={clr}>
        Ejecución {ej} — Últimos 7 días
      </SectionTitle>
      <div className="grid grid-cols-3 gap-2.5 mb-3.5">
        {stats.map(({ l, v, colorClass }) => (
          <div key={l} className="text-center bg-card-alt rounded-lg py-2.5 px-1.5">
            <p className="text-[9px] text-text-muted m-0 mb-[3px] uppercase">{l}</p>
            <p className={`text-base font-bold m-0 ${colorClass}`}>{v}</p>
          </div>
        ))}
      </div>
      <div className="pt-3 border-t border-border">
        <p className="text-[10px] text-text-muted m-0 mb-1.5 uppercase">vs 30 días</p>
        <div className="flex gap-2.5">
          <span className="text-xs text-text-sub">
            Prom 30d: <strong style={{ color: clr }}>{fmtMin(prom30)}</strong>
          </span>
          <span className={`text-xs ${prom7 > prom30 ? "text-quind-red" : "text-quind-green"}`}>
            {prom7 > prom30 ? "↑" : "↓"} {fmtMin(Math.abs(prom7 - prom30))}
          </span>
        </div>
      </div>
    </Card>
  );
};

// ─── Comparativa hábiles vs fin de semana ────────────────────────────────────
const HabilesVsFinSemana = ({ filtered, banda }) => {
  return (
    <Card>
      <SectionTitle>Hábiles vs Fin de semana</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        {[false, true].map((esFS) => {
          const data = (filtered ?? []).filter((ejecucion) => ejecucion.es_fin_semana === esFS);
          const clrClass  = esFS ? "text-quind-amber" : "text-quind-blue";
          const bgClass   = esFS ? "bg-quind-amber" : "bg-quind-blue";
          const prom = avg(data.map((ejecucion) => ejecucion.total_min));
          const pico = data.length ? Math.max(...data.map((ejecucion) => ejecucion.total_min)) : 0;
          
          return (
            <div key={String(esFS)} className="bg-card-alt rounded-lg p-3.5">
              <p className={`text-[13px] font-bold m-0 mb-2.5 ${clrClass}`}>
                {esFS ? "Fin de semana" : "Días hábiles"}
              </p>
              {[
                ["Promedio", fmtMin(prom)], 
                ["Pico", fmtMin(pico)], 
                ["Ejecuciones", data.length], 
                ["Fallos", data.filter((ejecucion) => !ejecucion.exitoso).length]
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between mb-1">
                  <span className="text-xs text-text-muted">{l}</span>
                  <span className={`text-xs font-bold ${l === "Fallos" && v > 0 ? "text-quind-red" : "text-text-base"}`}>{v}</span>
                </div>
              ))}
              <div className="mt-2 bg-border rounded h-2 overflow-hidden relative">
                <div className={`h-full rounded transition-[width] duration-500 ${bgClass}`} style={{ width: `${Math.min(100, (prom / (banda.critico || 1)) * 100)}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// ─── Registro de eventos ──────────────────────────────────────────────────────
const RegistroEventos = ({ anotaciones, refresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    titulo: "",
    fecha_inicio: new Date().toISOString().split("T")[0],
    fecha_fin: "",
    tipo: "info",
    descripcion: "",
    created_by: "",
  });

  const tipoConfig = {
    info: { label: "Info", color: C.blue },
    advertencia: { label: "Advertencia", color: C.amber },
    critico: { label: "Crítico", color: C.red },
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({
      titulo: "",
      fecha_inicio: new Date().toISOString().split("T")[0],
      fecha_fin: "", tipo: "info", descripcion: "", created_by: "",
    });
    setShowModal(true);
  };

  const openEdit = (a) => {
    setEditingId(a.id);
    setForm({
      titulo: a.titulo,
      fecha_inicio: a.fecha_inicio,
      fecha_fin: a.fecha_fin ?? "",
      tipo: a.tipo,
      descripcion: a.descripcion ?? "",
      created_by: a.created_by ?? "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!form.titulo.trim() || !form.fecha_inicio) return;
    setSaving(true);
    try {
      const payload = {
        titulo: form.titulo.trim(),
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin || null,
        tipo: form.tipo,
        descripcion: form.descripcion.trim() || null,
        created_by: form.created_by.trim() || null,
      };
      if (editingId) {
        await updateAnotacion(editingId, payload);
      } else {
        await createAnotacion(payload);
      }
      closeModal();
      refresh();
    } catch (e) {
      console.error("Error guardando evento:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (id) => {
    if (!window.confirm("¿Archivar este evento?")) return;
    try {
      await deactivateAnotacion(id);
      refresh();
    } catch (e) {
      console.error("Error archivando:", e);
    }
  };

  const inputCls = `
    w-full mt-1.5 rounded-lg px-3 py-2 text-[13px] outline-none
    border border-border-2 bg-card-alt text-text-base
    focus:border-quind-blue transition-colors
  `;

  return (
    <>
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div
          className="flex justify-between items-center px-5 py-4"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-2.5">
            <h3 className="text-[13px] font-semibold uppercase tracking-wide m-0"
                style={{ color: C.textSub }}>
              Registro de Eventos
            </h3>
            {anotaciones.length > 0 && (
              <Badge
                label={`${anotaciones.length} activos`}
                color={C.blue}
              />
            )}
          </div>
          <button
            onClick={openCreate}
            className="px-3.5 py-1.5 rounded-lg border-0 text-xs font-bold cursor-pointer transition-opacity hover:opacity-80"
            style={{ background: C.green, color: C.bg }}
          >
            + Nuevo evento
          </button>
        </div>

        {anotaciones.length === 0 ? (
          <div className="px-5 py-6 text-center">
            <p className="text-[13px] m-0" style={{ color: C.textMuted }}>
              No hay eventos registrados. Crea el primero con el botón
              "Nuevo evento".
            </p>
          </div>
        ) : (
          <div className="p-3 grid gap-2.5"
               style={{ gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))" }}>
            {anotaciones.map(a => {
              const cfg = tipoConfig[a.tipo] ?? tipoConfig.info;
              const color = cfg.color;
              return (
                <div
                  key={a.id}
                  className="rounded-lg p-3.5 flex flex-col gap-1.5"
                  style={{
                    background: C.cardAlt,
                    borderLeft: `3px solid ${color}`,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold"
                            style={{ color: C.text }}>
                        {a.titulo}
                      </span>
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded"
                        style={{ color, background: `${color}22` }}
                      >
                        {cfg.label}
                      </span>
                      {a.es_hoy && (
                        <span
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                          style={{ color: C.green, background: `${C.green}22` }}
                        >
                          Hoy
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => openEdit(a)}
                        className="border rounded-md px-2.5 py-1 text-[11px] cursor-pointer bg-transparent transition-opacity hover:opacity-70"
                        style={{ borderColor: C.border2, color: C.blue }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleArchive(a.id)}
                        className="border rounded-md px-2.5 py-1 text-[11px] cursor-pointer bg-transparent transition-opacity hover:opacity-70"
                        style={{ borderColor: C.border2, color: C.textMuted }}
                      >
                        Archivar
                      </button>
                    </div>
                  </div>

                  <span
                    className="text-[11px]"
                    style={{
                      color: C.textSub,
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    {a.fecha_inicio}
                    {a.fecha_fin ? ` → ${a.fecha_fin} (${a.duracion_dias} días)` : ""}
                  </span>

                  {a.descripcion && (
                    <p className="text-[13px] italic m-0"
                       style={{ color: C.textSub }}>
                      {a.descripcion}
                    </p>
                  )}

                  <span className="text-[11px]" style={{ color: C.textDim }}>
                    {a.created_by ? `Registrado por: ${a.created_by} · ` : ""}
                    {new Date(a.created_at).toLocaleDateString("es-CO")}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5"
             style={{ background: "rgba(0,0,0,0.75)" }}>
          <div
            className="w-full max-w-lg rounded-xl p-7 flex flex-col gap-4"
            style={{ background: C.card, border: `1px solid ${C.border2}` }}
          >
            <div className="flex justify-between items-center">
              <h3 className="m-0 text-base font-bold"
                  style={{ color: C.text }}>
                {editingId ? "Editar Evento" : "Nuevo Evento"}
              </h3>
              <button
                onClick={closeModal}
                className="bg-transparent border-0 text-xl cursor-pointer leading-none"
                style={{ color: C.textMuted }}
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wide"
                     style={{ color: C.textMuted }}>
                Título *
              </label>
              <input
                className={inputCls}
                value={form.titulo}
                onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                placeholder="Ej: Nueva infraestructura adoptada"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] uppercase tracking-wide"
                       style={{ color: C.textMuted }}>
                  Fecha inicio *
                </label>
                <input
                  type="date"
                  className={inputCls}
                  value={form.fecha_inicio}
                  onChange={e => setForm(f => ({ ...f, fecha_inicio: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wide"
                       style={{ color: C.textMuted }}>
                  Fecha fin (opcional)
                </label>
                <input
                  type="date"
                  className={inputCls}
                  value={form.fecha_fin}
                  onChange={e => setForm(f => ({ ...f, fecha_fin: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wide"
                     style={{ color: C.textMuted }}>
                Tipo
              </label>
              <div className="flex gap-2 mt-1.5">
                {Object.entries(tipoConfig).map(([key, cfg]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, tipo: key }))}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150"
                    style={{
                      border: `1px solid ${form.tipo === key ? cfg.color : C.border}`,
                      background: form.tipo === key ? `${cfg.color}22` : "transparent",
                      color: form.tipo === key ? cfg.color : C.textMuted,
                    }}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wide"
                     style={{ color: C.textMuted }}>
                Descripción (opcional)
              </label>
              <textarea
                className={`${inputCls} resize-y`}
                rows={3}
                value={form.descripcion}
                onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                placeholder="Descripción detallada del evento..."
                style={{ fontFamily: "inherit" }}
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wide"
                     style={{ color: C.textMuted }}>
                Registrado por (opcional)
              </label>
              <input
                className={inputCls}
                value={form.created_by}
                onChange={e => setForm(f => ({ ...f, created_by: e.target.value }))}
                placeholder="Tu nombre"
              />
            </div>

            <div className="flex gap-2.5 justify-end mt-1">
              <button
                onClick={closeModal}
                className="px-5 py-2 rounded-lg text-[13px] cursor-pointer bg-transparent transition-opacity hover:opacity-70"
                style={{
                  border: `1px solid ${C.border2}`,
                  color: C.textMuted,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.titulo.trim()}
                className="px-6 py-2 rounded-lg text-[13px] font-bold border-0 transition-opacity"
                style={{
                  background: !form.titulo.trim() ? C.border : C.green,
                  color: C.bg,
                  cursor: !form.titulo.trim() ? "not-allowed" : "pointer",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving
                  ? "Guardando..."
                  : editingId
                    ? "Actualizar evento"
                    : "Guardar evento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ─── Tabla de alertas recientes ───────────────────────────────────────────────
const AlertasTable = ({ filtered, banda, anotaciones }) => {
  const alertasAutomaticas = useMemo(
    () => (filtered ?? []).filter((d) => !d.exitoso || d.total_min > banda.advertencia),
    [filtered, banda]
  );
  const eventosImportantes = useMemo(
    () => (anotaciones ?? []).filter((a) => a.tipo === "advertencia" || a.tipo === "critico"),
    [anotaciones]
  );
  const totalAlertas = alertasAutomaticas.length + eventosImportantes.length;

  if (totalAlertas === 0) return null;

  return (
    <Card overflow>
      <div className="py-4 px-5 border-b border-border flex justify-between items-center">
        <SectionTitle>⚠ Alertas recientes</SectionTitle>
        <Badge label={`${totalAlertas} alertas`} color={C.red} />
      </div>
      {eventosImportantes.length > 0 && (
        <div
          className="px-5 py-3 flex flex-col gap-2"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <p className="text-[11px] uppercase tracking-wide font-semibold m-0"
             style={{ color: C.textMuted }}>
            Eventos manuales registrados
          </p>
          {eventosImportantes.map(a => {
            const color = a.tipo === "critico" ? C.red : C.amber;
            return (
              <div
                key={a.id}
                className="rounded-lg px-3.5 py-2.5 flex justify-between items-start gap-3"
                style={{
                  background: a.tipo === "critico" ? C.redBg : `${C.amber}11`,
                  border: `1px solid ${color}44`,
                  borderLeft: `3px solid ${color}`,
                }}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-bold"
                          style={{ color: C.text }}>
                      {a.titulo}
                    </span>
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase"
                      style={{ color, background: `${color}22` }}
                    >
                      {a.tipo}
                    </span>
                  </div>
                  {a.descripcion && (
                    <p className="text-xs italic m-0"
                       style={{ color: C.textSub }}>
                      {a.descripcion}
                    </p>
                  )}
                </div>
                <span
                  className="text-[11px] shrink-0"
                  style={{
                    color: C.textSub,
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}
                >
                  {a.fecha_inicio}
                  {a.fecha_fin ? ` → ${a.fecha_fin}` : ""}
                </span>
              </div>
            );
          })}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-card-alt">
              {["Fecha","Día","Ejecución","Tiempo","vs Media","Reg. Actualizados","Reg. Cargados","Nivel"].map((h) => (
                <Th key={h}>{h}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {alertasAutomaticas.map((ejecucion, i) => {
              const nivel = clasificarNivel(ejecucion.total_min, banda);
              const diff  = ejecucion.total_min - banda.media;
              return (
                <tr key={i} className="border-t border-border bg-quind-red-bg">
                  <Td>{ejecucion.fecha?.slice(5)}</Td>
                  <Td className="text-text-sub">{ejecucion.dia_semana}</Td>
                  <Td className="font-bold" style={{ color: ejColor(ejecucion.turno) }}>{ejecucion.turno}</Td>
                  <Td className="font-bold text-quind-red">{fmtMin(ejecucion.total_min)}</Td>
                  <Td className="text-[11px] text-quind-red">{diff > 0 ? "+" : ""}{fmtMin(diff)}</Td>
                  <Td>
                    <span style={{
                      color: ejecucion.registros_actualizados > 50e6
                        ? C.red
                        : ejecucion.registros_actualizados
                          ? C.teal
                          : C.textDim,
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 12,
                      fontWeight: ejecucion.registros_actualizados > 50e6 ? 700 : 400,
                    }}>
                      {ejecucion.registros_actualizados ? fmtM(ejecucion.registros_actualizados) : "–"}
                    </span>
                  </Td>
                  <Td>
                    <span style={{
                      color: ejecucion.registros_cargados ? C.teal : C.textDim,
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 12,
                    }}>
                      {ejecucion.registros_cargados ? fmtM(ejecucion.registros_cargados) : "–"}
                    </span>
                  </Td>
                  <Td><Badge label={nivel} color={colorDeNivel(nivel)} /></Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3.5 flex flex-col gap-2" style={{ borderTop: `1px solid ${C.border}`, background: C.cardAlt }}>
        <p className="text-[11px] m-0 uppercase tracking-[1px] font-semibold" style={{ color: C.textMuted }}>
          Significado de niveles
        </p>
        <div className="flex flex-wrap gap-4">
          {[
            { nivel: "CRÍTICO", color: C.red, desc: "Tiempo supera la media + 2σ (30d). Posible impacto operativo." },
            { nivel: "ADVERTENCIA", color: C.amber, desc: "Tiempo supera la media + 1.5σ (30d). Requiere monitoreo." },
            { nivel: "NORMAL", color: C.textSub, desc: "Tiempo dentro de la banda esperada pero incluido por fallo en el proceso." },
            { nivel: "RÁPIDO", color: C.green, desc: "Tiempo por debajo de la media − 1.5σ. Ejecución inusualmente rápida." },
          ].map(({ nivel, color, desc }) => (
            <div key={nivel} className="flex items-start gap-2 min-w-[200px] flex-1">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded whitespace-nowrap mt-px" style={{
                color,
                background: `${color}22`,
              }}>
                {nivel}
              </span>
              <span className="text-[11px] leading-normal" style={{ color: C.textMuted }}>
                {desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

// ─── Feature principal ────────────────────────────────────────────────────────
export const VistaResumen = () => {
  const { ejFilter, filtered, kpis, banda, anotacionesData, refresh } = useDashboard();
  const ejecuciones = ejFilter === "ambos" ? ["6am", "2pm"] : [ejFilter];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        {ejecuciones.map((ej) => (
          <EjecucionCard key={ej} ej={ej} kpis={kpis} />
        ))}
      </div>
      <HabilesVsFinSemana filtered={filtered} banda={banda} />
      <RegistroEventos anotaciones={anotacionesData ?? []} refresh={refresh} />
      <AlertasTable
        filtered={filtered}
        banda={banda}
        anotaciones={anotacionesData ?? []}
      />
    </div>
  );
};
