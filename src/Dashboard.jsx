import { DashboardProvider } from "./context/DashboardContext";
import { useDashboard } from "./context/useDashboard";


import { DashboardHeader }  from "./components/ui/DashboardHeader";
import { DashboardFooter }  from "./components/ui/DashboardFooter";
import { NavBar }           from "./components/ui/NavBar";
import { KpiRow }           from "./components/ui/KpiRow";

import { VistaResumen }    from "./features/resumen/VistaResumen";
import { VistaSemana }     from "./features/semana/VistaSemana";
import { VistaDia }        from "./features/dia/VistaDia";
import { VistaTendencia }  from "./features/tendencia/VistaTendencia";
import { VistaVolometria } from "./features/volumetria/VistaVolometria";
import { VistaFecha }      from "./features/fecha/VistaFecha";
import { VistaAnalisis }   from "./features/analisis/VistaAnalisis";
import { VistaBitacora }   from "./features/bitacora/VistaBitacora";
import { PanelDetalle }    from "./features/detalle/PanelDetalle";

import { useTheme } from "./context/ThemeContext";

// ─── Contenido interno (accede al contexto) ───────────────────────────────────
const DashboardContent = () => {
  const {
    viewMode, detailData,
    banda, kpis,
    loading, error, refresh, lastUpdate
  } = useDashboard();

  const { colors: C, theme, toggleTheme } = useTheme();

  if (loading) return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 16,
    }}>
      <div style={{
        width: 36,
        height: 36,
        border: `3px solid ${C.border}`,
        borderTop: `3px solid ${C.green}`,
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{ color: C.textSub, fontSize: 14, margin: 0 }}>
        Cargando datos desde Supabase...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        background: C.card,
        border: `1px solid ${C.redBdr}`,
        borderRadius: 12,
        padding: "32px 40px",
        textAlign: "center",
        maxWidth: 400,
      }}>
        <p style={{ fontSize: 32, margin: "0 0 12px" }}>⚠️</p>
        <p style={{ color: C.red, fontWeight: 700, fontSize: 16, margin: "0 0 8px" }}>
          Error de conexión
        </p>
        <p style={{ color: C.textSub, fontSize: 13, margin: "0 0 20px" }}>
          {error}
        </p>
        <button
          onClick={refresh}
          style={{
            background: C.green,
            color: C.bg,
            border: "none",
            borderRadius: 8,
            padding: "10px 24px",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Reintentar
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen bg-bg text-text-base font-sans py-8 px-10"
      style={{
        background: C.bg,
        color: C.text,
        fontFamily: "'Inter','Segoe UI',sans-serif",
        transition: "background 0.2s ease, color 0.2s ease",
      }}
    >
      <DashboardHeader
        lastUpdate={lastUpdate}
        onRefresh={refresh}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      {theme === "light" && (
        <div style={{
          height:     1,
          background: C.border,
          margin:     "0 0 8px 0",
        }} />
      )}
      <NavBar />
      <KpiRow kpis={kpis} banda={banda} />

      {/* Panel de detalle tiene prioridad sobre cualquier vista */}
      {detailData ? (
        <PanelDetalle />
      ) : (
        <>
          {viewMode === "resumen"    && <VistaResumen />}
          {viewMode === "semana"     && <VistaSemana />}
          {viewMode === "dia"        && <VistaDia />}
          {viewMode === "tendencia"  && <VistaTendencia />}
          {viewMode === "volumetria" && <VistaVolometria />}
          {viewMode === "fecha"      && <VistaFecha />}
          {viewMode === "analisis"   && <VistaAnalisis />}
          {viewMode === "bitacora"   && <VistaBitacora />}
        </>
      )}

      <DashboardFooter />
    </div>
  );
};

// ─── Export con Provider ──────────────────────────────────────────────────────
export const Dashboard = () => (
  <DashboardProvider>
    <DashboardContent />
  </DashboardProvider>
);
