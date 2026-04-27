import logoQuind from "../../assets/logo-quind.png";

export const DashboardHeader = ({ lastUpdate, onRefresh }) => (
  <div className="mb-9 relative">
    <div className="flex items-center gap-2.5 mb-1">
      <div className="w-2 h-2 rounded-full bg-quind-green shadow-[0_0_8px_#00e5a0]" />
      <span className="text-[11px] text-quind-green tracking-[3px] uppercase">
        Sistema activo
      </span>
    </div>
    <h1 className="text-[26px] font-bold m-0 bg-[linear-gradient(135deg,#e2e4ed_0%,#6b7280_100%)] bg-clip-text text-transparent">
      Monitor de Ejecuciones PPD
    </h1>
    <p className="text-text-muted text-[13px] mt-1 mb-0">
      Nutresa · Portafolio, Precios y Descuentos · Histórico desde Mar 31
    </p>
    {lastUpdate && (
      <p style={{ color: "#3a3d4d", fontSize: 11, margin: "4px 0 0", fontFamily: "'IBM Plex Mono', monospace" }}>
        Última actualización: {lastUpdate.toLocaleTimeString("es-CO")}
        {" · "}
        <span
          onClick={onRefresh}
          style={{ color: "#00e5a0", cursor: "pointer", textDecoration: "underline" }}
        >
          Actualizar ahora
        </span>
      </p>
    )}

    <img
      src={logoQuind}
      alt="Quind logo"
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        height: 64,
        width: "auto",
        objectFit: "contain",
        opacity: 0.9,
      }}
    />
  </div>
);
