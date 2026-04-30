import { useMemo } from "react";
import { avg, getDayName } from "../utils/format";

/**
 * Hook para procesar datos diarios agrupando ejecuciones por fecha.
 */
export const useDailyData = (rawData, ejFilter) =>
  useMemo(() => {
    const fechaMap = {};
    (rawData ?? []).forEach(ejecucion => {
      if (!fechaMap[ejecucion.fecha])
        fechaMap[ejecucion.fecha] = {
          fecha:      ejecucion.fecha,
          dia:        getDayName(ejecucion.fecha),
          fin_semana: ejecucion.es_fin_semana,
          all:        [],
        };
      fechaMap[ejecucion.fecha].all.push(ejecucion);
    });

    return Object.values(fechaMap)
      .map(({ fecha, dia, fin_semana, all }) => {
        const filtered = ejFilter === "ambos"
          ? all : all.filter(ej => ej.turno === ejFilter);
        
        const ej1 = all.find(ej => ej.turno === "EJ1");
        const ej2 = all.find(ej => ej.turno === "EJ2");
        
        const validos = filtered.filter(ej => ej.total_min && ej.total_min > 0);

        return {
          fecha, dia, fin_semana,
          label:           `${dia} ${fecha.slice(5)}`,
          ejEJ1:           ejFilter !== "EJ2" ? (ej1?.total_min ?? null) : null,
          ejEJ2:           ejFilter !== "EJ1" ? (ej2?.total_min ?? null) : null,
          promDia:         avg(validos.map(ej => ej.total_min)),
          deltaTurnos:     (ej1 && ej2)
                             ? Math.abs((ej1.total_min || 0) - (ej2.total_min || 0)) : null,
          regDia:          filtered.reduce(
                             (sum, ej) => sum + (ej.registros_cargados || 0), 0),
          regCargados:     filtered.reduce(
                             (sum, ej) => sum + (ej.registros_cargados || 0), 0),
          regActualizados: filtered.reduce(
                             (sum, ej) => sum + (ej.registros_actualizados || 0), 0),
          tieneFallo:      filtered.some(ej => !ej.exitoso),
          tieneIncompleta: filtered.some(ej =>
                             !ej.exitoso && (!ej.total_min || ej.total_min <= 0)),
          items:           filtered,
        };
      })
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  }, [rawData, ejFilter]);
