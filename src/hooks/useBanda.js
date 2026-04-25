import { useMemo } from "react";

export const useBanda = (_rawData, kpisData) => {
  return useMemo(() => {
    if (!kpisData || kpisData.length === 0) {
      return { media: 0, sigma: 0, advertencia: 0, critico: 0 };
    }
    // Average the values from both turnos for a global band
    const avg = (field) =>
      kpisData.reduce((sum, r) => sum + (Number(r[field]) || 0), 0) / kpisData.length;

    const media       = avg("prom_total_30d");
    const sigma       = avg("stddev_30d");
    const advertencia = avg("umbral_advertencia");
    const critico     = avg("umbral_critico");

    return { media, sigma, advertencia, critico };
  }, [kpisData]);
};
