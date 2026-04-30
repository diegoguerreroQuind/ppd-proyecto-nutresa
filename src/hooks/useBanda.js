import { useMemo } from "react";

export const useBanda = (_rawData, kpisData) =>
  useMemo(() => {
    if (!kpisData || !kpisData.length)
      return { media: 0, sigma: 0, advertencia: 0, critico: 0 };

    const avgField = (field) =>
      kpisData.reduce((sum, r) => sum + (Number(r[field]) || 0), 0)
      / kpisData.length;

    return {
      media:       avgField("prom_total_30d"),
      sigma:       avgField("stddev_30d"),
      advertencia: avgField("umbral_advertencia"),
      critico:     avgField("umbral_critico"),
    };
  }, [kpisData]);
