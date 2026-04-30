import { useTheme } from "../../context/ThemeContext";
import logoQuind from "../../assets/logo-quind.png";

export const DashboardHeader = ({
  lastUpdate, onRefresh, theme, onToggleTheme
}) => {
  const { colors: C } = useTheme();

  return (
    <div className="mb-9 relative">
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-2 h-2 rounded-full bg-quind-green shadow-[0_0_8px_#00e5a0]" />
        <span className="text-[11px] text-quind-green tracking-[3px] uppercase">
          Sistema activo
        </span>
      </div>
      <h1
        style={{
          color:      theme === "light" ? "#0d1117" : C.text,
          fontSize:   28,
          fontWeight: 800,
          margin:     0,
        }}
      >
        Monitor de Ejecuciones PPD
      </h1>
      <p
        style={{
          color: theme === "light" ? "#374151" : C.textSub,
          fontSize: 13,
          marginTop: 4,
          marginBottom: 0,
        }}
      >
        Nutresa · Portafolio, Precios y Descuentos · Histórico desde Mar 31
      </p>
      {lastUpdate && (
        <p style={{ color: C.textDim, fontSize: 11, margin: "4px 0 0", fontFamily: "'IBM Plex Mono', monospace" }}>
          Última actualización: {lastUpdate.toLocaleTimeString("es-CO")}
          {" · "}
          <span
            onClick={onRefresh}
            style={{ color: C.green, cursor: "pointer", textDecoration: "underline" }}
          >
            Actualizar ahora
          </span>
        </p>
      )}

      <div style={{
        position: "absolute",
        top:      0,
        right:    0,
        display:  "flex",
        alignItems: "center",
        gap:      16,
      }}>
        {/* Theme toggle button */}
        <button
          onClick={onToggleTheme}
          title={theme === "dark"
            ? "Cambiar a modo claro"
            : "Cambiar a modo oscuro"}
          style={{
            background:   theme === "light" ? C.cardAlt : C.card,
            border:       `1px solid ${C.border2}`,
            borderRadius: 20,
            padding:      "7px 14px",
            cursor:       "pointer",
            display:      "flex",
            alignItems:   "center",
            gap:          6,
            fontSize:     12,
            fontWeight:   600,
            color:        C.textSub,
            boxShadow:    C.shadow ?? "none",
            transition:   "all 0.2s ease",
          }}
        >
          {theme === "dark" ? (
            <>
              <span style={{ fontSize: 16 }}>☀️</span>
              <span>Modo Claro</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: 16 }}>🌙</span>
              <span>Modo Oscuro</span>
            </>
          )}
        </button>

        <div style={{
          background:   theme === "light"
                          ? "rgba(0,0,0,0.06)"
                          : "transparent",
          borderRadius: 8,
          padding:      theme === "light" ? "4px 8px" : 0,
          transition:   "all 0.2s ease",
        }}>
          <img
            src={logoQuind}
            alt="Quind logo"
            style={{
              height:    56,
              width:     "auto",
              objectFit: "contain",
              opacity:   theme === "light" ? 1 : 0.9,
            }}
          />
        </div>
      </div>
    </div>
  );
};
