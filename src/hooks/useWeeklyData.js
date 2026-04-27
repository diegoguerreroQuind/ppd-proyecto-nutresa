import { useMemo } from "react";
import { avg } from "../utils/format";

/**
 * useWeeklyData
 *
 * Agrupa las ejecuciones por semana y calcula métricas por semana.
 * El filtro de ejecución controla qué líneas se muestran en el gráfico
 * pero ambas series siempre se calculan para la tabla comparativa.
 */
export const useWeeklyData = (rawData, ejFilter) => {
  return useMemo(() => {
    const map = {};

    (rawData ?? []).forEach((ejecucion) => {
      if (!map[ejecucion.semana]) {
        map[ejecucion.semana] = { semana: ejecucion.semana, all: [], f: [] };
      }
      map[ejecucion.semana].all.push(ejecucion);
      if (ejFilter === "ambos" || ejecucion.turno === ejFilter || ejecucion.ejecucion === ejFilter) {
        map[ejecucion.semana].f.push(ejecucion);
      }
    });

    return Object.values(map).map(({ semana, all, f }) => {
      const regs = f.filter((ejecucion) => ejecucion.registros_cargados != null).map((ejecucion) => ejecucion.registros_cargados);
      const ej6  = all.filter((ejecucion) => (ejecucion.turno || ejecucion.ejecucion) === "6am");
      const ej2  = all.filter((ejecucion) => (ejecucion.turno || ejecucion.ejecucion) === "2pm");

      return {
        semana,
        // Series del gráfico: null cuando el filtro las excluye
        prom6am:     ejFilter !== "2pm" && ej6.length ? avg(ej6.map((ejecucion) => ejecucion.total_min)) : null,
        prom2pm:     ejFilter !== "6am" && ej2.length ? avg(ej2.map((ejecucion) => ejecucion.total_min)) : null,
        promTotal:   avg(f.map((ejecucion) => ejecucion.total_min)),
        minTotal:    f.length ? Math.min(...f.map((ejecucion) => ejecucion.total_min)) : null,
        maxTotal:    f.length ? Math.max(...f.map((ejecucion) => ejecucion.total_min)) : null,
        ejecuciones: f.length,
        picoReg:     regs.length ? Math.max(...regs) : null,
        picoRegAct:  f.filter((ejecucion) => ejecucion.registros_actualizados)
          .length
          ? Math.max(...f
              .filter((ejecucion) => ejecucion.registros_actualizados)
              .map((ejecucion) => ejecucion.registros_actualizados))
          : null,
        fallos:      f.filter((ejecucion) => !ejecucion.exitoso).length,
        items:       f,
      };
    });
  }, [rawData, ejFilter]);
};
