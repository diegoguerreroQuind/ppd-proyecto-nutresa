import { createContext, useContext, useMemo } from "react";
import { useDataContext } from "./DataContext";
import { useUIContext }   from "./UIContext";
import { useBanda }      from "../hooks/useBanda";
import { useKpis }       from "../hooks/useKpis";
import { useWeeklyData } from "../hooks/useWeeklyData";
import { useDailyData }  from "../hooks/useDailyData";

const DerivedContext = createContext(null);

export const DerivedProvider = ({ children }) => {
  const { rawData, kpisData } = useDataContext();
  const { ejFilter }          = useUIContext();

  const filtered = useMemo(
    () => ejFilter === "ambos"
      ? (rawData ?? [])
      : (rawData ?? []).filter(e => e.turno === ejFilter),
    [rawData, ejFilter]
  );

  const banda      = useBanda(rawData, kpisData);
  const kpis       = useKpis(rawData, kpisData);
  const weeklyData = useWeeklyData(rawData, ejFilter);
  const dailyData  = useDailyData(rawData, ejFilter);

  const value = useMemo(
    () => ({ filtered, banda, kpis, weeklyData, dailyData }),
    [filtered, banda, kpis, weeklyData, dailyData]
  );

  return (
    <DerivedContext.Provider value={value}>
      {children}
    </DerivedContext.Provider>
  );
};

export const useDerivedContext = () => {
  const ctx = useContext(DerivedContext);
  if (!ctx) throw new Error("useDerivedContext debe usarse dentro de <DerivedProvider>");
  return ctx;
};
