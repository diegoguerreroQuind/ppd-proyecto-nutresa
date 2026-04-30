import { useMemo } from "react";
import { avg } from "../utils/format";

/**
 * Hook para procesar datos semanales agrupando ejecuciones.
 */
export const useWeeklyData = (rawData, ejFilter) =>
  useMemo(() => {
    const semanaMap = {};
    (rawData ?? []).forEach(ejecucion => {
      if (!semanaMap[ejecucion.semana])
        semanaMap[ejecucion.semana] = { semana: ejecucion.semana, all: [], filtered: [] };
      
      semanaMap[ejecucion.semana].all.push(ejecucion);
      
      if (ejFilter === "ambos" || ejecucion.turno === ejFilter)
        semanaMap[ejecucion.semana].filtered.push(ejecucion);
    });

    return Object.values(semanaMap).map(({ semana, all, filtered }) => {
      const validos    = filtered.filter(ej => ej.total_min && ej.total_min > 0);
      const ej1        = all.filter(ej => ej.turno === "EJ1");
      const ej2        = all.filter(ej => ej.turno === "EJ2");
      const validosEJ1 = ej1.filter(ej => ej.total_min && ej.total_min > 0);
      const validosEJ2 = ej2.filter(ej => ej.total_min && ej.total_min > 0);
      
      const regs       = filtered.filter(ej => ej.registros_cargados)
                           .map(ej => ej.registros_cargados);
      const regsAct    = filtered.filter(ej => ej.registros_actualizados)
                           .map(ej => ej.registros_actualizados);

      return {
        semana,
        promEJ1:     ejFilter !== "EJ2" && validosEJ1.length
                       ? avg(validosEJ1.map(ej => ej.total_min)) : null,
        promEJ2:     ejFilter !== "EJ1" && validosEJ2.length
                       ? avg(validosEJ2.map(ej => ej.total_min)) : null,
        promTotal:   avg(validos.map(ej => ej.total_min)),
        minTotal:    validos.length
                       ? Math.min(...validos.map(ej => ej.total_min)) : null,
        maxTotal:    validos.length
                       ? Math.max(...validos.map(ej => ej.total_min)) : null,
        pctDir:      avg(validos.map(
                       ej => (ej.total_min ? (ej.directo_min / ej.total_min * 100) : 0))),
        ejecuciones: filtered.length,
        picoReg:     regs.length    ? Math.max(...regs)    : null,
        picoRegAct:  regsAct.length ? Math.max(...regsAct) : null,
        fallos:      filtered.filter(ej => !ej.exitoso).length,
        items:       filtered,
      };
    });
  }, [rawData, ejFilter]);
