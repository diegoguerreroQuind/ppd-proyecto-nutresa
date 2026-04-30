import { useMemo } from "react";

/**
 * Hook para transformar los KPIs de Supabase en un formato consumible por el dashboard.
 */
export const useKpis = (_rawData, kpisData) =>
  useMemo(() => {
    const rowEJ1 = (kpisData ?? []).find(row => row.turno === "EJ1") ?? {};
    const rowEJ2 = (kpisData ?? []).find(row => row.turno === "EJ2") ?? {};

    const toStats7d = (row) => ({
      prom:   Number(row.prom_total_7d || 0),
      min:    Number(row.min_total_7d || 0),
      max:    Number(row.max_total_7d || 0),
      fallos: Number(row.fallos_7d || 0),
      tasa:   row.tasa_exito_7d != null
                ? Number(row.tasa_exito_7d).toFixed(1) : "–",
      pctDir: (Number(row.prom_total_7d) && Number(row.prom_total_7d) > 0)
                ? (Number(row.prom_directo_7d || 0)
                   / Number(row.prom_total_7d) * 100) : 0,
      pctInd: (Number(row.prom_total_7d) && Number(row.prom_total_7d) > 0)
                ? (Number(row.prom_indirecto_7d || 0)
                   / Number(row.prom_total_7d) * 100) : 0,
      maxReg: Number(row.max_registros_7d || 0),
    });

    const toStats30d = (row) => ({
      prom:      Number(row.prom_total_30d || 0),
      min:       Number(row.min_total_30d || 0),
      max:       Number(row.max_total_30d || 0),
      fallos:    Number(row.fallos_30d || 0),
      tasa:      row.tasa_exito_30d != null
                   ? Number(row.tasa_exito_30d).toFixed(1) : "–",
      pctDir:    0,
      pctInd:    0,
      maxReg:    Number(row.max_registros_30d || 0),
      maxRegAct: Number(row.max_registros_actualizados_30d || 0),
    });

    return {
      "EJ1": { "7d": toStats7d(rowEJ1), "30d": toStats30d(rowEJ1) },
      "EJ2": { "7d": toStats7d(rowEJ2), "30d": toStats30d(rowEJ2) },
    };
  }, [kpisData]);
