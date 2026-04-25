import { useMemo } from "react";

export const useKpis = (_rawData, kpisData) => {
  return useMemo(() => {
    const row6am = kpisData?.find(r => r.turno === "6am") ?? {};
    const row2pm = kpisData?.find(r => r.turno === "2pm") ?? {};

    const toStats7d = (row) => ({
      prom:   Number(row.prom_total_7d)    || 0,
      min:    Number(row.min_total_7d)     || 0,
      max:    Number(row.max_total_7d)     || 0,
      fallos: Number(row.fallos_7d)        || 0,
      tasa:   row.tasa_exito_7d != null
                ? Number(row.tasa_exito_7d).toFixed(1)
                : "–",
      pctDir: row.prom_total_7d
                ? (Number(row.prom_directo_7d) / Number(row.prom_total_7d) * 100)
                : 0,
      pctInd: row.prom_total_7d
                ? (Number(row.prom_indirecto_7d) / Number(row.prom_total_7d) * 100)
                : 0,
      maxReg: Number(row.max_registros_7d) || 0,
    });

    const toStats30d = (row) => ({
      prom:   Number(row.prom_total_30d)   || 0,
      min:    Number(row.min_total_30d)    || 0,
      max:    Number(row.max_total_30d)    || 0,
      fallos: Number(row.fallos_30d)       || 0,
      tasa:   row.tasa_exito_30d != null
                ? Number(row.tasa_exito_30d).toFixed(1)
                : "–",
      pctDir: 0,
      pctInd: 0,
      maxReg: Number(row.max_registros_30d) || 0,
    });

    return {
      "6am": { "7d": toStats7d(row6am), "30d": toStats30d(row6am) },
      "2pm": { "7d": toStats7d(row2pm), "30d": toStats30d(row2pm) },
    };
  }, [kpisData]);
};
