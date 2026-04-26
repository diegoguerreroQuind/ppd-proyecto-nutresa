import { fmtMin } from "../../utils/format";

// ─── KpiCard ─────────────────────────────────────────────────────────────────
export const KpiCard = ({ label, value, sub, color }) => (
  <div
    className="card p-4 min-h-[100px] flex flex-col justify-between"
    style={{ borderTop: `2px solid ${color}22` }}
  >
    <p className="kpi-label">{label}</p>
    <p className="kpi-value" style={{ color, fontFamily: "'IBM Plex Mono', monospace" }}>{value}</p>
    <p className="kpi-sub">{sub}</p>
  </div>
);

// ─── Badge ────────────────────────────────────────────────────────────────────
export const Badge = ({ label, color }) => (
  <span className="badge" style={{ background: `${color}22`, color }}>
    {label}
  </span>
);

// ─── SectionTitle ─────────────────────────────────────────────────────────────
export const SectionTitle = ({ children, color }) => (
  <h3 className="section-title" style={color ? { color } : undefined}>
    {children}
  </h3>
);

// ─── BackButton ───────────────────────────────────────────────────────────────
export const BackButton = ({ onClick }) => (
  <button onClick={onClick} className="btn-back">
    ← Volver
  </button>
);

// ─── Card wrapper ─────────────────────────────────────────────────────────────
export const Card = ({ children, className = "", style = {}, overflow = false }) => (
  <div className={`${overflow ? "card-overflow" : "card-padded"} ${className}`} style={style}>
    {children}
  </div>
);

// ─── CustomTooltip para Recharts ──────────────────────────────────────────────
export const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="text-text-sub mb-1.5">{label}</p>
      {payload.map((p, i) =>
        p.value != null ? (
          <p key={i} className="my-0.5" style={{ color: p.color }}>
            {p.name}: <strong>{fmtMin(p.value)}</strong>
          </p>
        ) : null
      )}
    </div>
  );
};

// ─── Componentes de Tabla ─────────────────────────────────────────────────────
export const Th = ({ children, className = "" }) => (
  <th className={`th-cell ${className}`}>{children}</th>
);

export const Td = ({ children, className = "", style = {} }) => (
  <td className={`td-cell ${className}`} style={style}>{children}</td>
);

export const MonoTd = ({ children, style = {}, className = "" }) => (
  <td className={`td-cell ${className}`} style={{
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 13,
    ...style,
  }}>
    {children}
  </td>
);
