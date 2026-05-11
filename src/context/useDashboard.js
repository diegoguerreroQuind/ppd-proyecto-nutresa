import { useDataContext }    from "./DataContext";
import { useUIContext }      from "./UIContext";
import { useDerivedContext } from "./DerivedContext";

/**
 * Combina los tres contextos en una sola interfaz.
 * Para componentes críticos de rendimiento, usar los hooks específicos:
 * - useDataContext()    → rawData, kpisData, loading, error, refresh, lastUpdate
 * - useUIContext()      → viewMode, ejFilter, detailData, selectedDate + setters
 * - useDerivedContext() → filtered, banda, kpis, weeklyData, dailyData
 */
export const useDashboard = () => ({
  ...useDataContext(),
  ...useUIContext(),
  ...useDerivedContext(),
});
