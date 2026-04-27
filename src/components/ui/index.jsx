import { useState } from "react";
import { fmtMin } from "../../utils/format";
import { C } from "../../constants/colors";

// ─── KpiCard ─────────────────────────────────────────────────────────────────
export const KpiCard = ({ label, value, sub, color, tooltip }) => {
  const [hovered, setHovered] = useState(false);
  const [showAbove, setShowAbove] = useState(true);

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const tooltipHeight = 72;
    const gap = 8;
    const hasRoomAbove = rect.top >= tooltipHeight + gap;
    setShowAbove(hasRoomAbove);
    setHovered(true);
  };

  return (
    <div
      className="bg-card border border-border rounded-xl p-4 min-h-[100px] flex flex-col justify-between"
      style={{
        position: "relative",
        borderTop: `2px solid ${color}22`,
        cursor: tooltip ? "help" : "default",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
    >
      <p className="text-[11px] text-text-muted m-0 mb-1.5 uppercase tracking-[1px]">{label}</p>
      <p className="text-[22px] font-bold m-0 mb-0.5" style={{ color, fontFamily: "'IBM Plex Mono', monospace" }}>{value}</p>
      <p className="text-[11px] text-text-dim m-0">{sub}</p>

      {tooltip && hovered && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            ...(showAbove ? { bottom: "calc(100% + 8px)" } : { top: "calc(100% + 8px)" }),
            background: "#1e2130",
            border: `1px solid ${C.border2}`,
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 11,
            color: C.textSub,
            width: 220,
            zIndex: 50,
            lineHeight: 1.5,
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            pointerEvents: "none",
          }}
        >
          {tooltip}
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              ...(showAbove
                ? {
                    top: "100%",
                    borderWidth: "6px 6px 0 6px",
                    borderStyle: "solid",
                    borderColor: "#1e2130 transparent transparent transparent",
                  }
                : {
                    bottom: "100%",
                    borderWidth: "0 6px 6px 6px",
                    borderStyle: "solid",
                    borderColor: "transparent transparent #1e2130 transparent",
                  }),
            }}
          />
        </div>
      )}
    </div>
  );
};

// ─── Badge ────────────────────────────────────────────────────────────────────
export const Badge = ({ label, color }) => (
  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold" style={{ background: `${color}22`, color }}>
    {label}
  </span>
);

// ─── SectionTitle ─────────────────────────────────────────────────────────────
export const SectionTitle = ({ children, color, noMargin = false }) => (
  <h3
    className={`text-[13px] text-text-sub uppercase tracking-[1px] font-semibold ${noMargin ? "m-0" : "m-0 mb-4"}`}
    style={color ? { color } : undefined}
  >
    {children}
  </h3>
);

// ─── BackButton ───────────────────────────────────────────────────────────────
export const BackButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="self-start bg-border hover:bg-border-2 border-none text-text-sub px-4 py-2 rounded-lg cursor-pointer text-[13px] transition-colors"
  >
    ← Volver
  </button>
);

// ─── Card wrapper ─────────────────────────────────────────────────────────────
export const Card = ({ children, className = "", style = {}, overflow = false }) => (
  <div
    className={`${overflow ? "bg-card border border-border rounded-xl overflow-hidden" : "bg-card border border-border rounded-xl p-6"} ${className}`}
    style={style}
  >
    {children}
  </div>
);

// ─── CustomTooltip para Recharts ──────────────────────────────────────────────
export const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border-2 rounded-lg px-3.5 py-2.5 text-xs">
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
  <th className={`py-2.5 px-3.5 text-left text-text-dim font-semibold text-[11px] uppercase tracking-[0.5px] ${className}`}>{children}</th>
);

export const Td = ({ children, className = "", style = {} }) => (
  <td className={`py-[11px] px-3.5 ${className}`} style={style}>{children}</td>
);

export const MonoTd = ({ children, style = {}, className = "" }) => (
  <td className={`py-[11px] px-3.5 ${className}`} style={{
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 13,
    ...style,
  }}>
    {children}
  </td>
);
