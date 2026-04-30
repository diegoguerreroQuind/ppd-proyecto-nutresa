import { useMemo, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { 
  ejColor as ejColorFn, 
  nivelColorMap as nivelColorMapFn 
} from "../../constants/colors";
import { Badge, Card, SectionTitle, Th, Td } from "../../components/ui";
import { fmtMin, fmtM, avg } from "../../utils/format";
import { clasificarNivel } from "../../utils/anomalias";
import { useDashboard } from "../../context/useDashboard";
import {
  createAnotacion,
  updateAnotacion,
  deactivateAnotacion,
} from "../../services/ejecucionesService";

const NivelesLeyenda = () => {
  const { colors: C } = useTheme();
  const nivelColors = nivelColorMapFn(C);

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

// ─── Tarjeta de stats por ejecución ──────────────────────────────────────────
const EjecucionCard = ({ ej, kpis }) => {
  const { colors: C, theme } = useTheme();
  const d7  = kpis[ej]?.["7d"] ?? {};
  const d30 = kpis[ej]?.["30d"] ?? {};
  const clr = ejColorFn(ej, C);

  const stats = [
    { l: "Promedio",    v: fmtMin(d7.prom),            color: ej === "EJ1" ? C.blue : C.amber },
    { l: "Mínimo",      v: fmtMin(d7.min),             color: C.green },
    { l: "Máximo",      v: fmtMin(d7.max),             color: C.red   },
    { l: "Fallos",      v: d7.fallos ?? 0,             color: d7.fallos > 0 ? C.red : C.green },
  ];

  const prom7 = d7.prom ?? 0;
  const prom30 = d30.prom ?? 0;

  const boxBg = theme === "light"
    ? (ej === "EJ1" ? "#f0f4ff" : "#fffbeb")
    : C.cardAlt;

  return (
    <Card style={{ borderLeft: `3px solid ${clr}`, boxShadow: C.shadow ?? "none" }}>
      <SectionTitle color={clr}>
        Ejecución {ej} — Últimos 7 días
      </SectionTitle>
      <div className="grid grid-cols-3 gap-2.5 mb-3.5">
        {(stats ?? []).map((stat) => (
          <div key={stat.l} className="text-center rounded-lg py-2.5 px-1.5" style={{ background: boxBg }}>
            <p className="text-[9px] m-0 mb-[3px] uppercase" style={{ color: C.textMuted }}>{stat.l}</p>
            <p className="text-base font-bold m-0" style={{ color: stat.color }}>{stat.v}</p>
          </div>
        ))}
      </div>
      <div className="pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
        <p className="text-[10px] m-0 mb-1.5 uppercase" style={{ color: C.textMuted }}>vs 30 días</p>
        <div className="flex gap-2.5">
          <span className="text-xs" style={{ color: C.textSub }}>
            Prom 30d: <strong style={{ color: clr }}>{fmtMin(prom30)}</strong>
          </span>
          <span className="text-xs" style={{ color: prom7 > prom30 ? C.red : C.green }}>
            {prom7 > prom30 ? "↑" : "↓"} {fmtMin(Math.abs(prom7 - prom30))}
          </span>
        </div>
      </div>
    </Card>
  );
};

// ─── Comparativa hábiles vs fin de semana ────────────────────────────────────
const HabilesVsFinSemana = ({ filtered, banda }) => {
  const { colors: C } = useTheme();
  return (
    <Card>
      <SectionTitle>Hábiles vs Fin de semana</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        {[false, true].map((esFS) => {
          const data = (filtered ?? []).filter((ejecucion) => ejecucion.es_fin_semana === esFS);
          const color     = esFS ? C.amber : C.blue;
          const prom = avg(data.map((ejecucion) => ejecucion.total_min));
          const pico = data.length ? Math.max(...data.map((ejecucion) => ejecucion.total_min)) : 0;
          
          return (
            <div key={String(esFS)} className="rounded-lg p-3.5" style={{ background: C.cardAlt }}>
              <p className="text-[13px] font-bold m-0 mb-2.5" style={{ color }}>
                {esFS ? "Fin de semana" : "Días hábiles"}
              </p>
              {[
                ["Promedio", fmtMin(prom)], 
                ["Pico", fmtMin(pico)], 
                ["Ejecuciones", data.length], 
                ["Fallos", data.filter((ejecucion) => !ejecucion.exitoso).length]
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between mb-1">
                  <span className="text-xs" style={{ color: C.textMuted }}>{l}</span>
                  <span className="text-xs font-bold" style={{ color: l === "Fallos" && v > 0 ? C.red : C.text }}>{v}</span>
                </div>
              ))}
              <div className="mt-2 rounded h-2 overflow-hidden relative" style={{ background: C.border }}>
                <div className="h-full rounded transition-[width] duration-500" style={{ background: color, width: `${Math.min(100, (prom / (banda.critico || 1)) * 100)}%` }} />
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
  const { colors: C, theme } = useTheme();
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

  const inputCls = "w-full mt-1.5 rounded-lg px-3 py-2 text-[13px] outline-none transition-colors border";

  const getInpStyle = (focused = false) => ({
    background: C.cardAlt,
    borderColor: focused ? C.blue : C.border2,
    color: C.text
  });

  return (
    <>
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: C.card,
          border: theme === "light" ? `1px solid #c8cdde` : `1px solid ${C.border}`,
          borderRadius: 12,
        }}
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
        {(anotaciones ?? []).map(anotacion => {
              const cfg = tipoConfig[anotacion.tipo] ?? tipoConfig.info;
              const color = cfg.color;
              return (
                <div
                  key={anotacion.id}
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
                        {anotacion.titulo}
                      </span>
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded"
                        style={{ color, background: `${color}18`, border: `1px solid ${color}44` }}
                      >
                        {cfg.label}
                      </span>
                      {anotacion.es_hoy && (
                        <span
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                          style={{ color: C.green, background: `${C.green}18`, border: `1px solid ${C.green}44` }}
                        >
                          Hoy
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => openEdit(anotacion)}
                        className="border rounded-md px-2.5 py-1 text-[11px] cursor-pointer bg-transparent transition-opacity hover:opacity-70"
                        style={{ borderColor: C.border2, color: C.blue }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleArchive(anotacion.id)}
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
                    {anotacion.fecha_inicio}
                    {anotacion.fecha_fin ? ` → ${anotacion.fecha_fin} (${anotacion.duracion_dias} días)` : ""}
                  </span>

                  {anotacion.descripcion && (
                    <p className="text-[13px] italic m-0"
                       style={{ color: C.textSub }}>
                      {anotacion.descripcion}
                    </p>
                  )}

                  <span className="text-[11px]" style={{ color: C.textDim }}>
                    {anotacion.created_by ? `Registrado por: ${anotacion.created_by} · ` : ""}
                    {new Date(anotacion.created_at).toLocaleDateString("es-CO")}
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
                style={getInpStyle()}
                value={form.titulo}
                onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                placeholder="Ej: Nueva infraestructura adoptada"
                onFocus={(e) => {
                  e.target.style.borderColor = C.blue;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = C.border2;
                }}
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
                  style={getInpStyle()}
                  value={form.fecha_inicio}
                  onChange={e => setForm(f => ({ ...f, fecha_inicio: e.target.value }))}
                  onFocus={(e) => {
                    e.target.style.borderColor = C.blue;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = C.border2;
                  }}
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
                  style={getInpStyle()}
                  value={form.fecha_fin}
                  onChange={e => setForm(f => ({ ...f, fecha_fin: e.target.value }))}
                  onFocus={(e) => {
                    e.target.style.borderColor = C.blue;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = C.border2;
                  }}
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
                style={getInpStyle()}
                rows={3}
                value={form.descripcion}
                onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                placeholder="Descripción detallada del evento..."
                onFocus={(e) => {
                  e.target.style.borderColor = C.blue;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = C.border2;
                }}
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wide"
                     style={{ color: C.textMuted }}>
                Registrado por (opcional)
              </label>
              <input
                className={inputCls}
                style={getInpStyle()}
                value={form.created_by}
                onChange={e => setForm(f => ({ ...f, created_by: e.target.value }))}
                placeholder="Tu nombre"
                onFocus={(e) => {
                  e.target.style.borderColor = C.blue;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = C.border2;
                }}
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
  const { colors: C, theme } = useTheme();
  const nivelColors = nivelColorMapFn(C);

  const alertasAutomaticas = useMemo(
    () =>
      (filtered ?? []).filter(
        (d) =>
          !d.exitoso ||
          (!d.total_min || d.total_min <= 0) ||
          d.total_min > banda.advertencia
      ),
    [filtered, banda]
  );
  const eventosImportantes = useMemo(
    () => (anotaciones ?? []).filter((a) => a.tipo === "advertencia" || a.tipo === "critico"),
    [anotaciones]
  );
  const totalAlertas = alertasAutomaticas.length + eventosImportantes.length;

  if (totalAlertas === 0) return null;

  return (
    <Card
      overflow
      style={{
        border: theme === "light" ? `1px solid #c8cdde` : `1px solid ${C.border}`,
        borderRadius: 12,
      }}
    >
      <div className="py-4 px-5 flex justify-between items-center" style={{ borderBottom: `1px solid ${C.border}` }}>
        <SectionTitle noMargin>⚠ Alertas recientes</SectionTitle>
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
                      style={{ color, background: `${color}18`, border: `1px solid ${color}44` }}
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
            <tr style={{ background: C.cardAlt }}>
              {["Fecha","Día","Ejecución","Tiempo","vs Media","Reg. Actualizados","Reg. Cargados","Nivel"].map((h) => (
                <Th key={h}>{h}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(alertasAutomaticas ?? []).map((ejecucion, index) => {
              const nivel = clasificarNivel(
                ejecucion.total_min,
                banda,
                ejecucion.exitoso
              );
              const diff  = ejecucion.total_min - (banda?.media ?? 0);
              const colorNivel = nivelColors[nivel] ?? C.textSub;

              return (
                <tr key={index} style={{ background: C.redBg }}>
                  <Td>{ejecucion.fecha?.slice(5)}</Td>
                  <Td style={{ color: C.textSub }}>{ejecucion.dia_semana}</Td>
                  <Td className="font-bold" style={{ color: ejColorFn(ejecucion.turno, C) }}>{ejecucion.turno}</Td>
                  <Td className="font-bold" style={{ color: C.red }}>{fmtMin(ejecucion.total_min)}</Td>
                  <Td className="text-[11px]" style={{ color: C.red }}>{diff > 0 ? "+" : ""}{fmtMin(diff)}</Td>
                  <Td>
                    <span style={{
                      color: (ejecucion.registros_actualizados ?? 0) > 50e6
                        ? C.red
                        : ejecucion.registros_actualizados
                          ? C.teal
                          : C.textDim,
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 12,
                      fontWeight: (ejecucion.registros_actualizados ?? 0) > 50e6 ? 700 : 400,
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
                  <Td>
                    <span
                      style={{
                        background:
                          nivel === "FALLO"
                            ? C.redBg
                            : `${colorNivel}18`,
                        color: colorNivel,
                        border:
                          nivel === "FALLO"
                            ? `1px solid ${C.redBdr}`
                            : `1px solid ${colorNivel}44`,
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                      }}
                    >
                      {nivel === "FALLO" ? "FALLO" : nivel}
                    </span>
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
export const VistaResumen = () => {
  const { ejFilter, filtered, kpis, banda, anotacionesData, refresh } = useDashboard();
  const ejecuciones = ejFilter === "ambos" ? ["EJ1", "EJ2"] : [ejFilter];

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
