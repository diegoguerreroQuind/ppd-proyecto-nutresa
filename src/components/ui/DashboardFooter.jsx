import { C } from "../../constants/colors";

export const DashboardFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        marginTop: "32px",
        paddingTop: "16px",
        borderTop: `1px solid ${C.border}`,
        textAlign: "center",
        fontSize: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      }}
    >
      <div style={{ color: C.textDim }}>
        © <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{currentYear}</span>. Todos los Derechos Reservados. <span style={{ color: C.purple }}>Quind S.A.S.</span>
      </div>
      <div style={{ color: C.textDim }}>
        Diseñado por <span style={{ color: C.purple }}>Quind</span> — Somos el equipo TI de tu equipo TI
      </div>
    </footer>
  );
};
