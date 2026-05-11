import { useMemo } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { ejColor as ejColorFn, nivelColorMap as nivelColorMapFn } from "../../../constants/colors";
import { Badge, Card, SectionTitle, Th, Td } from "../../../components/ui";
import { NivelesLeyenda } from "../../../components/ui/NivelesLeyenda";
import { fmtMin, fmtM } from "../../../utils/format";
import { clasificarNivel } from "../../../utils/anomalias";

export const AlertasTable = ({ filtered, banda, anotaciones }) => {
  const { colors: C, theme } = useTheme();
  const nivelColors = nivelColorMapFn(C);

  const alertasAutomaticas = useMemo(
    () => (filtered ?? []).filter(
      (d) => !d.exitoso || !d.total_min || d.total_min <= 0 || d.total_min > banda.advertencia
    ),
    [filtered, banda]
  );

  const eventosImportantes = useMemo(
    () => (anotaciones ?? []).filter((a) => a.tipo === "advertencia" || a.tipo === "critico"),
    [anotaciones]
  );

  const totalAlertas = alertasAutomaticas.length + eventosImportantes.length;

  if (totalAlertas === 0) return null;

  return (
    <Card
      overflow
      style={{
        border:       theme === "light" ? "1px solid #c8cdde" : `1px solid ${C.border}`,
        borderRadius: 12,
      }}
    >
      <div
        className="py-4 px-5 flex justify-between items-center"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <SectionTitle noMargin>⚠ Alertas recientes</SectionTitle>
        <Badge label={`${totalAlertas} alertas`} color={C.red} />
      </div>

      {eventosImportantes.length > 0 && (
        <div
          className="px-5 py-3 flex flex-col gap-2"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <p className="text-[11px] uppercase tracking-wide font-semibold m-0" style={{ color: C.textMuted }}>
            Eventos manuales registrados
          </p>
          {eventosImportantes.map((a) => {
            const color = a.tipo === "critico" ? C.red : C.amber;
            return (
              <div
                key={a.id}
                className="rounded-lg px-3.5 py-2.5 flex justify-between items-start gap-3"
                style={{
                  background:  a.tipo === "critico" ? C.redBg : `${C.amber}11`,
                  border:      `1px solid ${color}44`,
                  borderLeft:  `3px solid ${color}`,
                }}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-bold" style={{ color: C.text }}>{a.titulo}</span>
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase"
                      style={{ color, background: `${color}18`, border: `1px solid ${color}44` }}
                    >
                      {a.tipo}
                    </span>
                  </div>
                  {a.descripcion && (
                    <p className="text-xs italic m-0" style={{ color: C.textSub }}>{a.descripcion}</p>
                  )}
                </div>
                <span
                  className="text-[11px] shrink-0"
                  style={{ color: C.textSub, fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {a.fecha_inicio}{a.fecha_fin ? ` → ${a.fecha_fin}` : ""}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr style={{ background: C.cardAlt }}>
              {["Fecha", "Día", "Ejecución", "Tiempo", "vs Media", "Reg. Actualizados", "Reg. Cargados", "Nivel"].map((h) => (
                <Th key={h}>{h}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {alertasAutomaticas.map((ejecucion, index) => {
              const nivel      = clasificarNivel(ejecucion.total_min, banda, ejecucion.exitoso);
              const diff       = ejecucion.total_min - (banda?.media ?? 0);
              const colorNivel = nivelColors[nivel] ?? C.textSub;

              return (
                <tr key={index} style={{ background: C.redBg }}>
                  <Td>{ejecucion.fecha?.slice(5)}</Td>
                  <Td style={{ color: C.textSub }}>{ejecucion.dia_semana}</Td>
                  <Td className="font-bold" style={{ color: ejColorFn(ejecucion.turno, C) }}>{ejecucion.turno}</Td>
                  <Td className="font-bold" style={{ color: C.red }}>{fmtMin(ejecucion.total_min)}</Td>
                  <Td className="text-[11px]" style={{ color: C.red }}>{diff > 0 ? "+" : ""}{fmtMin(diff)}</Td>
                  <Td>
                    <span style={{
                      color:      (ejecucion.registros_actualizados ?? 0) > 50e6 ? C.red : ejecucion.registros_actualizados ? C.teal : C.textDim,
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize:   12,
                      fontWeight: (ejecucion.registros_actualizados ?? 0) > 50e6 ? 700 : 400,
                    }}>
                      {ejecucion.registros_actualizados ? fmtM(ejecucion.registros_actualizados) : "–"}
                    </span>
                  </Td>
                  <Td>
                    <span style={{
                      color:      ejecucion.registros_cargados ? C.teal : C.textDim,
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize:   12,
                    }}>
                      {ejecucion.registros_cargados ? fmtM(ejecucion.registros_cargados) : "–"}
                    </span>
                  </Td>
                  <Td>
                    <span style={{
                      background:   nivel === "FALLO" ? C.redBg : `${colorNivel}18`,
                      color:        colorNivel,
                      border:       nivel === "FALLO" ? `1px solid ${C.redBdr}` : `1px solid ${colorNivel}44`,
                      padding:      "2px 8px",
                      borderRadius: 4,
                      fontSize:     10,
                      fontWeight:   700,
                      textTransform: "uppercase",
                    }}>
                      {nivel}
                    </span>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <NivelesLeyenda />
    </Card>
  );
};
