import { useMemo, useReducer, useState } from "react";
import { Badge } from "../../components/ui";
import { useTheme } from "../../context/ThemeContext";
import { useAnotaciones } from "../../hooks/useAnotaciones";
import { useDashboard } from "../../context/useDashboard";

const emptyForm = () => ({
  titulo:       "",
  fecha_inicio: new Date().toISOString().split("T")[0],
  fecha_fin:    "",
  tipo:         "info",
  descripcion:  "",
  created_by:   "",
});

const modalReducer = (state, action) => {
  switch (action.type) {
    case "OPEN_CREATE":
      return { isOpen: true, editingId: null, form: emptyForm() };
    case "OPEN_EDIT":
      return {
        isOpen:    true,
        editingId: action.payload.id,
        form: {
          titulo:       action.payload.titulo,
          fecha_inicio: action.payload.fecha_inicio,
          fecha_fin:    action.payload.fecha_fin    ?? "",
          tipo:         action.payload.tipo,
          descripcion:  action.payload.descripcion  ?? "",
          created_by:   action.payload.created_by   ?? "",
        },
      };
    case "CLOSE":
      return { ...state, isOpen: false, editingId: null };
    case "UPDATE_FIELD":
      return { ...state, form: { ...state.form, [action.field]: action.value } };
    default:
      return state;
  }
};

const initialModalState = { isOpen: false, editingId: null, form: emptyForm() };

export const VistaBitacora = () => {
  const { colors: C, theme } = useTheme();
  const { anotacionesData }   = useDashboard();
  const { save, remove, saving } = useAnotaciones();

  const [modal, dispatchModal] = useReducer(modalReducer, initialModalState);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const tipoConfig = {
    info:        { label: "Info",        color: C.blue  },
    advertencia: { label: "Advertencia", color: C.amber },
    critico:     { label: "Crítico",     color: C.red   },
  };

  const handleSave = async () => {
    if (!modal.form.titulo.trim() || !modal.form.fecha_inicio) return;
    const payload = {
      titulo:       modal.form.titulo.trim(),
      fecha_inicio: modal.form.fecha_inicio,
      fecha_fin:    modal.form.fecha_fin    || null,
      tipo:         modal.form.tipo,
      descripcion:  modal.form.descripcion.trim()  || null,
      created_by:   modal.form.created_by.trim()   || null,
    };
    const ok = await save(payload, modal.editingId);
    if (ok) dispatchModal({ type: "CLOSE" });
  };

  const handleDelete = async (id) => {
    const ok = await remove(id);
    if (ok) setConfirmDeleteId(null);
  };

  const setField = (field) => (e) =>
    dispatchModal({ type: "UPDATE_FIELD", field, value: e.target.value });

  const inputCls = "w-full mt-1.5 rounded-lg px-3 py-2 text-[13px] outline-none transition-colors border";
  const inputStyle = { background: C.cardAlt, borderColor: C.border2, color: C.text };

  const anotaciones = useMemo(
    () => [...(anotacionesData ?? [])].sort((a, b) => b.fecha_inicio.localeCompare(a.fecha_inicio)),
    [anotacionesData]
  );

  return (
    <div className="flex flex-col gap-6">
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background:   C.card,
          border:       `1px solid ${theme === "light" ? C.border2 : C.border}`,
          borderRadius: 12,
        }}
      >
        <div
          className="flex justify-between items-center px-5 py-4"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-2.5">
            <h3 className="text-[13px] font-semibold uppercase tracking-wide m-0" style={{ color: C.textSub }}>
              Registro de Eventos
            </h3>
            {anotaciones.length > 0 && (
              <Badge label={`${anotaciones.length} registrados`} color={C.blue} />
            )}
          </div>
          <button
            onClick={() => dispatchModal({ type: "OPEN_CREATE" })}
            className="px-3.5 py-1.5 rounded-lg border-0 text-xs font-bold cursor-pointer transition-opacity hover:opacity-80"
            style={{ background: C.green, color: C.bg }}
          >
            + Nuevo evento
          </button>
        </div>

        {anotaciones.length === 0 ? (
          <div className="px-5 py-6 text-center">
            <p className="text-[13px] m-0" style={{ color: C.textMuted }}>
              No hay eventos registrados. Crea el primero con el botón "Nuevo evento".
            </p>
          </div>
        ) : (
          <div
            className="p-3 grid gap-2.5"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))" }}
          >
            {anotaciones.map((anotacion) => {
              const cfg   = tipoConfig[anotacion.tipo] ?? tipoConfig.info;
              const color = cfg.color;
              const isConfirming = confirmDeleteId === anotacion.id;

              return (
                <div
                  key={anotacion.id}
                  className="rounded-lg p-3.5 flex flex-col gap-1.5"
                  style={{
                    background:  C.cardAlt,
                    borderLeft:  `3px solid ${color}`,
                    border:      `1px solid ${C.border}`,
                  }}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold" style={{ color: C.text }}>
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

                    <div className="flex gap-1.5 shrink-0 items-center">
                      {isConfirming ? (
                        <>
                          <span className="text-[11px]" style={{ color: C.red }}>¿Eliminar?</span>
                          <button
                            onClick={() => handleDelete(anotacion.id)}
                            className="border rounded-md px-2.5 py-1 text-[11px] cursor-pointer bg-transparent"
                            style={{ borderColor: C.redBdr, color: C.red }}
                          >
                            Sí
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="border rounded-md px-2.5 py-1 text-[11px] cursor-pointer bg-transparent"
                            style={{ borderColor: C.border2, color: C.textMuted }}
                          >
                            No
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => dispatchModal({ type: "OPEN_EDIT", payload: anotacion })}
                            className="border rounded-md px-2.5 py-1 text-[11px] cursor-pointer bg-transparent transition-opacity hover:opacity-70"
                            style={{ borderColor: C.border2, color: C.blue }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(anotacion.id)}
                            className="border rounded-md px-2.5 py-1 text-[11px] cursor-pointer bg-transparent transition-opacity hover:opacity-70"
                            style={{ borderColor: C.redBdr, color: C.red }}
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <span
                    className="text-[11px]"
                    style={{ color: C.textSub, fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {anotacion.fecha_inicio}
                    {anotacion.fecha_fin ? ` → ${anotacion.fecha_fin} (${anotacion.duracion_dias} días)` : ""}
                  </span>

                  {anotacion.descripcion && (
                    <p className="text-[13px] italic m-0" style={{ color: C.textSub }}>
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

      {modal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-5"
          style={{ background: "rgba(0,0,0,0.75)" }}
        >
          <div
            className="w-full max-w-lg rounded-xl p-7 flex flex-col gap-4"
            style={{ background: C.card, border: `1px solid ${C.border2}` }}
          >
            <div className="flex justify-between items-center">
              <h3 className="m-0 text-base font-bold" style={{ color: C.text }}>
                {modal.editingId ? "Editar Evento" : "Nuevo Evento"}
              </h3>
              <button
                onClick={() => dispatchModal({ type: "CLOSE" })}
                className="bg-transparent border-0 text-xl cursor-pointer leading-none"
                style={{ color: C.textMuted }}
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wide" style={{ color: C.textMuted }}>
                Título *
              </label>
              <input
                className={inputCls}
                style={inputStyle}
                value={modal.form.titulo}
                onChange={setField("titulo")}
                placeholder="Ej: Nueva infraestructura adoptada"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] uppercase tracking-wide" style={{ color: C.textMuted }}>
                  Fecha inicio *
                </label>
                <input
                  type="date"
                  className={inputCls}
                  style={inputStyle}
                  value={modal.form.fecha_inicio}
                  onChange={setField("fecha_inicio")}
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wide" style={{ color: C.textMuted }}>
                  Fecha fin (opcional)
                </label>
                <input
                  type="date"
                  className={inputCls}
                  style={inputStyle}
                  value={modal.form.fecha_fin}
                  onChange={setField("fecha_fin")}
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wide" style={{ color: C.textMuted }}>
                Tipo
              </label>
              <div className="flex gap-2 mt-1.5">
                {Object.entries(tipoConfig).map(([key, cfg]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => dispatchModal({ type: "UPDATE_FIELD", field: "tipo", value: key })}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150"
                    style={{
                      border:     `1px solid ${modal.form.tipo === key ? cfg.color : C.border}`,
                      background: modal.form.tipo === key ? `${cfg.color}22` : "transparent",
                      color:      modal.form.tipo === key ? cfg.color : C.textMuted,
                    }}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wide" style={{ color: C.textMuted }}>
                Descripción (opcional)
              </label>
              <textarea
                className={`${inputCls} resize-y`}
                style={inputStyle}
                rows={3}
                value={modal.form.descripcion}
                onChange={setField("descripcion")}
                placeholder="Descripción detallada del evento..."
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wide" style={{ color: C.textMuted }}>
                Registrado por (opcional)
              </label>
              <input
                className={inputCls}
                style={inputStyle}
                value={modal.form.created_by}
                onChange={setField("created_by")}
                placeholder="Tu nombre"
              />
            </div>

            <div className="flex gap-2.5 justify-end mt-1">
              <button
                onClick={() => dispatchModal({ type: "CLOSE" })}
                className="px-5 py-2 rounded-lg text-[13px] cursor-pointer bg-transparent transition-opacity hover:opacity-70"
                style={{ border: `1px solid ${C.border2}`, color: C.textMuted }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !modal.form.titulo.trim()}
                className="px-6 py-2 rounded-lg text-[13px] font-bold border-0 transition-opacity"
                style={{
                  background: !modal.form.titulo.trim() ? C.border : C.green,
                  color:      C.bg,
                  cursor:     !modal.form.titulo.trim() ? "not-allowed" : "pointer",
                  opacity:    saving ? 0.7 : 1,
                }}
              >
                {saving ? "Guardando..." : modal.editingId ? "Actualizar evento" : "Guardar evento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
