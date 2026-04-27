import { TABS, FILTROS_EJECUCION } from "../../constants/config";
import { useDashboard } from "../../context/useDashboard";

// ─── Botón de tab individual ──────────────────────────────────────────────────
const TabBtn = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3.5 py-1.5 rounded-md border-none cursor-pointer text-xs font-semibold transition-all ${
      active ? "bg-quind-green text-bg" : "bg-transparent text-text-muted hover:text-text-sub"
    }`}
  >
    {label}
  </button>
);

// ─── Botón de filtro de ejecución ─────────────────────────────────────────────
const EjBtn = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-md border-none cursor-pointer text-xs font-semibold transition-all ${
      active ? "bg-quind-blue text-white" : "bg-transparent text-text-muted hover:text-text-sub"
    }`}
  >
    {label}
  </button>
);

// ─── Barra de navegación completa ─────────────────────────────────────────────
export const NavBar = () => {
  const { viewMode, ejFilter, detailData, setViewMode, setEjFilter } = useDashboard();

  return (
    <div className="flex flex-wrap gap-2.5 items-center mb-7">
      {/* Tabs de vista */}
      <div className="flex bg-card rounded-lg p-[3px] border border-border">
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
      <div className="flex bg-card rounded-lg p-[3px] border border-border">
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
