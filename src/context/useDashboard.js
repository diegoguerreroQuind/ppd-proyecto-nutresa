import { useContext } from "react";
import { DashboardContext } from "./DashboardContextValue";

/**
 * Hook de acceso al contexto. Lanza error si se usa fuera del provider.
 */
export const useDashboard = () => {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard debe usarse dentro de <DashboardProvider>");
  return ctx;
};
