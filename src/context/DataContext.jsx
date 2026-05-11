import { createContext, useContext } from "react";
import { useSupabaseData } from "../hooks/useSupabaseData";

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const data = useSupabaseData();
  return (
    <DataContext.Provider value={data}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useDataContext debe usarse dentro de <DataProvider>");
  return ctx;
};
