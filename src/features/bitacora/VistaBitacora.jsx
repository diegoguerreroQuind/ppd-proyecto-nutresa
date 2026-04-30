import { useMemo, useState } from "react";
import { Card, SectionTitle } from "../../components/ui";
import { useTheme } from "../../context/ThemeContext";
import { createAnotacion, deactivateAnotacion } from "../../services/ejecucionesService";
import { useDashboard } from "../../context/useDashboard";

const todayIso = () => new Date().toISOString().slice(0, 10);

const formatDate = (dateStr) => {
  if (!dateStr) return "–";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "–";
  const d = new Date(dateStr);
  const date = d.toLocaleDateString("es-CO");
  const time = d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${date} ${time}`;
};

const daysBetweenInclusive = (start, end) => {
  if (!start || !end) return null;
  const a = new Date(`${start}T12:00:00`);
  const b = new Date(`${end}T12:00:00`);
  const diff = Math.round((b - a) / 86400000) + 1;
  return diff > 0 ? diff : null;
};

export const VistaBitacora = () => {
  const { colors: C } = useTheme();
  const { anotacionesData, refresh } = useDashboard();

  const [titulo, setTitulo] = useState("");
  const [fechaInicio, setFechaInicio] = useState(todayIso());
  const [fechaFin, setFechaFin] = useState("");
  const [tipo, setTipo] = useState("info");
  const [descripcion, setDescripcion] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [saving, setSaving] = useState(false);
  const [archivingId, setArchivingId] = useState(null);

  const tipoColorMap = useMemo(() => ({
    info: C.blue,
    advertencia: C.amber,
    critico: C.red,
  }), [C]);

  const tipoBadgeMap = {
    info: "ℹ️ Info",
    advertencia: "⚠ Advertencia",
    critico: "🔴 Crítico",
  };

  const orderedAnotaciones = useMemo(
    () => [...(anotacionesData ?? [])].sort((a, b) => (b.fecha_inicio || "").localeCompare(a.fecha_inicio || "")),
    [anotacionesData]
  );

  const resetForm = () => {
    setTitulo("");
    setFechaInicio(todayIso());
    setFechaFin("");
    setTipo("info");
    setDescripcion("");
    setCreatedBy("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim() || !fechaInicio || !tipo) return;

    setSaving(true);
    try {
      await createAnotacion({
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin || null,
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || null,
        tipo,
        activo: true,
        created_by: createdBy.trim() || null,
      });
      resetForm();
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  const onArchive = async (id) => {
    const confirmed = window.confirm("¿Archivar esta anotación?");
    if (!confirmed) return;
    setArchivingId(id);
    try {
      await deactivateAnotacion(id);
      await refresh();
    } finally {
      setArchivingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card style={{ padding: "1.25rem", background: C.card, border: `1px solid ${C.border}` }}>
        <SectionTitle noMargin>Nueva Anotación</SectionTitle>
        <form className="mt-4 flex flex-col gap-4" onSubmit={onSubmit}>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs" style={{ color: C.textSub }}>Título *</label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              placeholder="Ej: Nueva infraestructura adoptada"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
              style={{
                background: C.cardAlt,
                borderColor: C.border,
                color: C.text
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs" style={{ color: C.textSub }}>Fecha inicio *</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                required
                className="rounded-lg border px-3 py-2 text-sm outline-none"
                style={{
                  background: C.cardAlt,
                  borderColor: C.border,
                  color: C.text
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs" style={{ color: C.textSub }}>Fecha fin</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                placeholder="Opcional"
                className="rounded-lg border px-3 py-2 text-sm outline-none"
                style={{
                  background: C.cardAlt,
                  borderColor: C.border,
                  color: C.text
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs" style={{ color: C.textSub }}>Tipo *</label>
            <div className="flex flex-wrap gap-2">
              {["info", "advertencia", "critico"].map((t) => {
                const isActive = tipo === t;
                const color = tipoColorMap[t];
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipo(t)}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold border"
                    style={{
                      color: isActive ? color : C.textMuted,
                      borderColor: isActive ? `${color}77` : C.border2,
                      background: isActive ? `${color}22` : C.cardAlt,
                    }}
                  >
                    {t === "info" ? "Info" : t === "advertencia" ? "Advertencia" : "Crítico"}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs" style={{ color: C.textSub }}>Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              placeholder="Descripción detallada del evento..."
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-y"
              style={{
                background: C.cardAlt,
                borderColor: C.border,
                color: C.text
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs" style={{ color: C.textSub }}>Creado por</label>
            <input
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
              placeholder="Tu nombre"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
              style={{
                background: C.cardAlt,
                borderColor: C.border,
                color: C.text
              }}
            />
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg px-4 py-2 text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: C.green, color: C.bg }}
            >
              {saving ? "Guardando..." : "Guardar anotación"}
            </button>
          </div>
        </form>
      </Card>

      <Card style={{ padding: "1.25rem" }}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <SectionTitle noMargin>Historial de Anotaciones</SectionTitle>
          <span
            className="text-xs px-2.5 py-1 rounded-full border"
            style={{ color: C.textSub, borderColor: C.border2, background: C.cardAlt }}
          >
            {orderedAnotaciones.length} anotaciones activas
          </span>
        </div>

        {!orderedAnotaciones.length ? (
          <p className="text-sm m-0" style={{ color: C.textMuted }}>
            No hay anotaciones registradas. Crea la primera usando el formulario.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {orderedAnotaciones.map((a) => {
              const color = tipoColorMap[a.tipo] ?? C.textSub;
              const duration = a.duracion_dias ?? daysBetweenInclusive(a.fecha_inicio, a.fecha_fin);

              return (
                <div
                  key={a.id}
                  className="rounded-lg border p-3.5"
                  style={{ borderColor: C.border, borderLeft: `3px solid ${color}`, background: C.cardAlt }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="m-0 text-[14px] font-bold" style={{ color: C.text }}>{a.titulo}</p>
                    <button
                      type="button"
                      onClick={() => onArchive(a.id)}
                      disabled={archivingId === a.id}
                      className="text-[11px] px-2 py-1 rounded border disabled:opacity-60"
                      style={{ color: C.textSub, borderColor: C.border2, background: C.card }}
                    >
                      {archivingId === a.id ? "Archivando..." : "Archivar"}
                    </button>
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs" style={{ color: C.textSub }}>
                    <span>
                      {a.fecha_fin
                        ? `${formatDate(a.fecha_inicio)} → ${formatDate(a.fecha_fin)}${duration ? ` (${duration} días)` : ""}`
                        : formatDate(a.fecha_inicio)}
                    </span>
                    {a.es_hoy && (
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                        style={{ color: C.green, borderColor: `${C.green}66`, background: `${C.green}1a` }}
                      >
                        Hoy
                      </span>
                    )}
                  </div>

                  <div className="mt-2">
                    <span
                      className="text-[11px] px-2 py-1 rounded-md border font-semibold"
                      style={{ color, borderColor: `${color}66`, background: `${color}1a` }}
                    >
                      {tipoBadgeMap[a.tipo] ?? "ℹ️ Info"}
                    </span>
                  </div>

                  {a.descripcion && (
                    <p className="mt-2 m-0 text-[13px] italic" style={{ color: C.textSub }}>
                      {a.descripcion}
                    </p>
                  )}

                  <div className="mt-2.5 flex items-center justify-between gap-3 text-[11px]" style={{ color: C.textDim }}>
                    <span>Registrado por: {a.created_by || "–"}</span>
                    <span>{formatDateTime(a.created_at)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
