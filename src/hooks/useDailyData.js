import { useMemo } from "react";
import { avg, getDayName } from "../utils/format";

/**
 * useDailyData
 *
 * Agrupa por fecha y expone ambas series (ej6am / ej2pm) como columnas
 * separadas para poder mostrar la comparativa día a día.
 */
export const useDailyData = (rawData, ejFilter) => {
  return useMemo(() => {
    const map = {};

    (rawData ?? []).forEach((ejecucion) => {
      if (!map[ejecucion.fecha]) {
        map[ejecucion.fecha] = {
          fecha:      ejecucion.fecha,
          dia:        getDayName(ejecucion.fecha),
          fin_semana: ejecucion.es_fin_semana,
          all:        [],
        };
      }
      map[ejecucion.fecha].all.push(ejecucion);
    });

    return Object.values(map)
      .map(({ fecha, dia, fin_semana, all }) => {
        const f   = ejFilter === "ambos" ? all : all.filter((ejecucion) => (ejecucion.turno || ejecucion.ejecucion) === ejFilter);
        const e6  = all.find((ejecucion) => (ejecucion.turno || ejecucion.ejecucion) === "6am");
        const e2  = all.find((ejecucion) => (ejecucion.turno || ejecucion.ejecucion) === "2pm");

        return {
          fecha,
          dia,
          fin_semana,
          label:       `${dia} ${fecha.slice(5)}`,
          ej6am:       ejFilter !== "2pm" ? (e6?.total_min ?? null) : null,
          ej2pm:       ejFilter !== "6am" ? (e2?.total_min ?? null) : null,
          promDia:     avg(f.map((ejecucion) => ejecucion.total_min)),
          deltaTurnos: e6 && e2 && e6.total_min != null && e2.total_min != null ? Math.abs(e6.total_min - e2.total_min) : null,
          regDia:          f.reduce((s, ejecucion) => s + (ejecucion.registros_cargados || 0), 0),
          regCargados:     f.reduce((s, ejecucion) => s + (ejecucion.registros_cargados || 0), 0),
          regActualizados: f.reduce((s, ejecucion) => s + (ejecucion.registros_actualizados || 0), 0),
          tieneFallo:  f.some((ejecucion) => !ejecucion.exitoso),
          items:       f,
        };
      })
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  }, [rawData, ejFilter]);
};
