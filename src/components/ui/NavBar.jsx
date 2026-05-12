import { TABS, FILTROS_EJECUCION } from "../../constants/config";
import { useUIContext } from "../../context/UIContext";
import { useTheme } from "../../context/ThemeContext";

// ─── Botón de tab individual ──────────────────────────────────────────────────
const TabBtn = ({ label, active, onClick, theme, C }) => {
  const activeBg   = theme === "light" ? C.blue  : C.green;
  const activeText = "#ffffff";
  const hoverBg    = theme === "light" ? C.border : "rgba(255,255,255,0.07)";

  return (
    <button
      onClick={onClick}
      className="rounded-lg border-none cursor-pointer transition-all"
      style={{
        background:    active ? activeBg : "transparent",
        color:         active ? activeText : C.textMuted,
        padding:       "6px 14px",
        fontSize:      13,
        fontWeight:    active ? 600 : 400,
        letterSpacing: "0.01em",
        whiteSpace:    "nowrap",
      }}
      onMouseOver={(e) => {
        if (!active) {
          e.currentTarget.style.background = hoverBg;
          e.currentTarget.style.color = C.textSub;
        }
      }}
      onMouseOut={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = C.textMuted;
        }
      }}
    >
      {label}
    </button>
  );
};

// ─── Botón de filtro de ejecución ─────────────────────────────────────────────
const EjBtn = ({ label, active, onClick, theme, C }) => {
  const hoverBg = theme === "light" ? C.border : "rgba(255,255,255,0.07)";

  return (
    <button
      onClick={onClick}
      className="rounded-lg border-none cursor-pointer transition-all"
      style={{
        background:    active ? C.blue : "transparent",
        color:         active ? "#ffffff" : C.textMuted,
        padding:       "6px 14px",
        fontSize:      13,
        fontWeight:    active ? 600 : 400,
        letterSpacing: "0.01em",
        whiteSpace:    "nowrap",
      }}
      onMouseOver={(e) => {
        if (!active) {
          e.currentTarget.style.background = hoverBg;
          e.currentTarget.style.color = C.textSub;
        }
      }}
      onMouseOut={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = C.textMuted;
        }
      }}
    >
      {label}
    </button>
  );
};

// ─── Barra de navegación completa ─────────────────────────────────────────────
export const NavBar = () => {
  const { viewMode, ejFilter, detailData, setViewMode, setEjFilter } = useUIContext();
  const { colors: C, theme } = useTheme();

  const pillStyle = theme === "light"
    ? {
        background:   C.card,
        border:       `1px solid ${C.border}`,
        borderRadius: 12,
        padding:      "4px",
        boxShadow:    C.shadow,
      }
    : {
        background:   "transparent",
        border:       "none",
        borderRadius: 0,
        padding:      0,
        boxShadow:    "none",
      };

  return (
    <div
      className="flex items-center"
      style={{ marginBottom: 24, gap: 8 }}
    >
      {/* Tabs de vista */}
      <div className="flex items-center" style={{ gap: 2, ...pillStyle }}>
        {TABS.map(({ id, label }) => (
          <TabBtn
            key={id}
            label={label}
            active={viewMode === id && !detailData}
            onClick={() => setViewMode(id)}
            theme={theme}
            C={C}
          />
        ))}
      </div>

      {/* Filtro de ejecución */}
      <div
        className="flex items-center"
        style={{ marginLeft: "auto", gap: 2, ...pillStyle }}
      >
        {FILTROS_EJECUCION.map(({ id, label }) => (
          <EjBtn
            key={id}
            label={label}
            active={ejFilter === id}
            onClick={() => setEjFilter(id)}
            theme={theme}
            C={C}
          />
        ))}
      </div>
    </div>
  );
};
