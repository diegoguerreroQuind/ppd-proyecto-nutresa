import { useTheme } from "../../context/ThemeContext";
import logoQuind from "../../assets/logo-quind.png";

export const DashboardHeader = ({
  lastUpdate, onRefresh, theme, onToggleTheme
}) => {
  const { colors: C } = useTheme();

  return (
    <div className="mb-8 relative">
      {/* Acento de marca: barra izquierda azul visible solo en modo claro */}
      {theme === "light" && (
        <div style={{
          position:     "absolute",
          left:         -24,
          top:          0,
          bottom:       0,
          width:        3,
          background:   `linear-gradient(to bottom, ${C.blue}, ${C.teal})`,
          borderRadius: 2,
        }} />
      )}

      <div className="flex items-center gap-2 mb-1.5">
        <div
          className="w-2 h-2 rounded-full"
          style={{
            background: C.green,
            boxShadow:  theme === "light" ? `0 0 6px ${C.green}88` : "0 0 8px #00e5a0",
          }}
        />
        <span
          className="text-[11px] tracking-[2.5px] uppercase font-semibold"
          style={{ color: C.green }}
        >
          Sistema activo
        </span>
      </div>

      <h1
        style={{
          color:       C.text,
          fontSize:    26,
          fontWeight:  800,
          margin:      0,
          letterSpacing: "-0.3px",
          lineHeight:  1.2,
        }}
      >
        Monitor de Ejecuciones PPD
      </h1>
      <p
        style={{
          color:      C.textMuted,
          fontSize:   13,
          marginTop:  5,
          marginBottom: 0,
          fontWeight: 400,
        }}
      >
        Nutresa · Portafolio, Precios y Descuentos · Histórico desde Mar 31
      </p>

      {lastUpdate && (
        <p style={{
          color:      C.textDim,
          fontSize:   11,
          margin:     "6px 0 0",
          fontFamily: "'IBM Plex Mono', monospace",
        }}>
          Última actualización: {lastUpdate.toLocaleTimeString("es-CO")}
          {" · "}
          <span
            onClick={onRefresh}
            style={{ color: C.blue, cursor: "pointer", textDecoration: "underline" }}
          >
            Actualizar ahora
          </span>
        </p>
      )}

      {/* Controles: toggle + logo */}
      <div style={{
        position:   "absolute",
        top:        0,
        right:      0,
        display:    "flex",
        alignItems: "center",
        gap:        12,
      }}>
        <button
          onClick={onToggleTheme}
          title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          style={{
            background:   C.card,
            border:       `1px solid ${C.border2}`,
            borderRadius: 10,
            padding:      "7px 14px",
            cursor:       "pointer",
            display:      "flex",
            alignItems:   "center",
            gap:          6,
            fontSize:     12,
            fontWeight:   600,
            color:        C.textSub,
            boxShadow:    C.shadow,
            transition:   "all 0.18s ease",
          }}
        >
          {theme === "dark" ? (
            <><span style={{ fontSize: 15 }}>☀️</span><span>Modo Claro</span></>
          ) : (
            <><span style={{ fontSize: 15 }}>🌙</span><span>Modo Oscuro</span></>
          )}
        </button>

        <div style={{
          background:   theme === "light" ? C.cardAlt : "transparent",
          border:       theme === "light" ? `1px solid ${C.border}` : "none",
          borderRadius: 10,
          padding:      theme === "light" ? "6px 10px" : 0,
          transition:   "all 0.18s ease",
        }}>
          <img
            src={logoQuind}
            alt="Quind logo"
            style={{
              height:    50,
              width:     "auto",
              objectFit: "contain",
              opacity:   theme === "light" ? 1 : 0.88,
            }}
          />
        </div>
      </div>
    </div>
  );
};
