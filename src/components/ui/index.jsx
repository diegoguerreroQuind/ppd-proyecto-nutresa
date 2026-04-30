import { useState } from "react";
import { fmtMin } from "../../utils/format";
import { useTheme } from "../../context/ThemeContext";

// ─── KpiCard ─────────────────────────────────────────────────────────────────
export const KpiCard = ({ label, value, sub, color, tooltip }) => {
  const { colors: C } = useTheme();
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
      className="rounded-xl p-4 min-h-[100px] flex flex-col justify-between"
      style={{
        position: "relative",
        background: C.card,
        border: `1px solid ${C.border}`,
        borderTop: `2px solid ${color}44`,
        cursor: tooltip ? "help" : "default",
        boxShadow: C.shadow ?? "none",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
    >
      <p className="text-[11px] m-0 mb-1.5 uppercase tracking-[1px]" style={{ color: C.textMuted }}>{label}</p>
      <p className="text-[22px] font-bold m-0 mb-0.5" style={{ color, fontFamily: "'IBM Plex Mono', monospace" }}>{value}</p>
      <p className="text-[11px] m-0" style={{ color: C.textDim }}>{sub}</p>

      {tooltip && hovered && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            ...(showAbove ? { bottom: "calc(100% + 8px)" } : { top: "calc(100% + 8px)" }),
            background: C.cardAlt,
            border: `1px solid ${C.border2}`,
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 11,
            color: C.textSub,
            width: 220,
            zIndex: 50,
            lineHeight: 1.5,
            boxShadow: C.shadowMd ?? "0 4px 20px rgba(0,0,0,0.4)",
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
                    borderColor: `${C.border2} transparent transparent transparent`,
                  }
                : {
                    bottom: "100%",
                    borderWidth: "0 6px 6px 6px",
                    borderStyle: "solid",
                    borderColor: `transparent transparent ${C.border2} transparent`,
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
  <span
    className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold"
    style={{
      background: `${color}18`,
      color: color,
      border: `1px solid ${color}44`,
      padding: "2px 8px",
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 600,
    }}
  >
    {label}
  </span>
);

// ─── SectionTitle ─────────────────────────────────────────────────────────────
export const SectionTitle = ({ children, color, noMargin = false }) => {
  const { colors: C } = useTheme();
  return (
    <h3
      className={`text-[13px] uppercase tracking-[1px] font-semibold ${noMargin ? "m-0" : "m-0 mb-4"}`}
      style={{ color: color || C.textSub }}
    >
      {children}
    </h3>
  );
};

// ─── BackButton ───────────────────────────────────────────────────────────────
export const BackButton = ({ onClick }) => {
  const { colors: C } = useTheme();
  return (
    <button
      onClick={onClick}
      className="self-start px-4 py-2 rounded-lg cursor-pointer text-[13px] transition-colors border-none"
      style={{
        background: C.border,
        color: C.textSub,
      }}
      onMouseOver={(e) => e.currentTarget.style.background = C.border2}
      onMouseOut={(e) => e.currentTarget.style.background = C.border}
    >
      ← Volver
    </button>
  );
};

// ─── Card wrapper ─────────────────────────────────────────────────────────────
export const Card = ({ children, className = "", style = {}, overflow = false }) => {
  const { colors: C } = useTheme();
  return (
    <div
      className={`rounded-xl ${overflow ? "overflow-hidden" : "p-6"} ${className}`}
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        boxShadow: C.shadow ?? "none",
        ...style
      }}
    >
      {children}
    </div>
  );
};

// ─── CustomTooltip para Recharts ──────────────────────────────────────────────
export const CustomTooltip = ({ active, payload, label }) => {
  const { colors: C } = useTheme();
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3.5 py-2.5 text-xs"
      style={{
        background: C.card,
        border: `1px solid ${C.border2}`,
        color: C.text,
        boxShadow: C.shadowMd ?? "none"
      }}
    >
      <p className="mb-1.5" style={{ color: C.textSub }}>{label}</p>
      {(payload ?? []).map((entry, index) =>
        entry.value != null ? (
          <p key={index} className="my-0.5" style={{ color: entry.color }}>
            {entry.name}: <strong>{fmtMin(entry.value)}</strong>
          </p>
        ) : null
      )}
    </div>
  );
};

// ─── Componentes de Tabla ─────────────────────────────────────────────────────
export const Th = ({ children, className = "" }) => {
  const { colors: C, theme } = useTheme();
  return (
    <th
      className={`py-2.5 px-3.5 text-left font-semibold text-[11px] uppercase tracking-[0.5px] ${className}`}
      style={{
        color: C.textDim,
        background: C.cardAlt,
        borderBottom: theme === "light"
          ? "2px solid #c8cdde"
          : `1px solid ${C.border}`
      }}
    >
      {children}
    </th>
  );
};

export const Td = ({ children, className = "", style = {} }) => {
  const { colors: C, theme } = useTheme();
  return (
    <td
      className={`py-[11px] px-3.5 ${className}`}
      style={{
        color: C.text,
        borderTop: theme === "light"
          ? `1px solid #d1d5e0`
          : `1px solid ${C.border}`,
        ...style
      }}
    >
      {children}
    </td>
  );
};

export const MonoTd = ({ children, style = {}, className = "" }) => {
  const { colors: C, theme } = useTheme();
  return (
    <td
      className={`py-[11px] px-3.5 ${className}`}
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 13,
        color: C.text,
        borderTop: theme === "light"
          ? `1px solid #d1d5e0`
          : `1px solid ${C.border}`,
        ...style,
      }}
    >
      {children}
    </td>
  );
};
