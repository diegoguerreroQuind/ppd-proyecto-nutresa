import { TABS, FILTROS_EJECUCION } from "../../constants/config";
import { useDashboard } from "../../context/useDashboard";
import { useTheme } from "../../context/ThemeContext";

// ─── Botón de tab individual ──────────────────────────────────────────────────
const TabBtn = ({ label, active, onClick }) => {
  const { colors: C } = useTheme();
  return (
    <button
      onClick={onClick}
      className="rounded-lg border-none cursor-pointer transition-all"
      style={{
        background: active ? C.green : "transparent",
        color: active ? C.bg : C.textSub,
        padding: "7px 14px",
        fontSize: 13,
        fontWeight: active ? 700 : 400,
      }}
      onMouseOver={(e) => {
        if (!active) e.currentTarget.style.color = C.text;
      }}
      onMouseOut={(e) => {
        if (!active) e.currentTarget.style.color = C.textSub;
      }}
    >
      {label}
    </button>
  );
};

// ─── Botón de filtro de ejecución ─────────────────────────────────────────────
const EjBtn = ({ label, active, onClick }) => {
  const { colors: C } = useTheme();
  return (
    <button
      onClick={onClick}
      className="rounded-lg border-none cursor-pointer transition-all"
      style={{
        background: active ? C.blue : "transparent",
        color: active ? "#ffffff" : C.textSub,
        padding: "7px 14px",
        fontSize: 13,
        fontWeight: active ? 700 : 400,
      }}
      onMouseOver={(e) => {
        if (!active) e.currentTarget.style.color = C.text;
      }}
      onMouseOut={(e) => {
        if (!active) e.currentTarget.style.color = C.textSub;
      }}
    >
      {label}
    </button>
  );
};

// ─── Barra de navegación completa ─────────────────────────────────────────────
export const NavBar = () => {
  const { viewMode, ejFilter, detailData, setViewMode, setEjFilter } = useDashboard();
  const { colors: C } = useTheme();

  return (
    <div
      className="flex items-center"
      style={{
        marginBottom: 24,
        gap: 8,
        background: "transparent",
        border: "none",
      }}
    >
      {/* Tabs de vista */}
      <div
        className="flex items-center"
        style={{
          gap: 4,
          background: "transparent",
          border: "none",
        }}
      >
        {TABS.map(({ id, label }) => (
          <TabBtn
            key={id}
            label={label}
            active={viewMode === id && !detailData}
            onClick={() => setViewMode(id)}
          />
        ))}
      </div>

      {/* Filtro de ejecución */}
      <div
        className="flex items-center"
        style={{
          marginLeft: "auto",
          gap: 4,
          background: "transparent",
          border: "none",
        }}
      >
        {FILTROS_EJECUCION.map(({ id, label }) => (
          <EjBtn
            key={id}
            label={label}
            active={ejFilter === id}
            onClick={() => setEjFilter(id)}
          />
        ))}
      </div>
    </div>
  );
};
