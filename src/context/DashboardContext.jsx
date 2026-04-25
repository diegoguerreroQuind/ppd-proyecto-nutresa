import { useReducer, useMemo, useCallback } from "react";
import { useSupabaseData } from "../hooks/useSupabaseData";
import { DashboardContext } from "./DashboardContextValue";

// Derived data hooks
import { useBanda }      from "../hooks/useBanda";
import { useKpis }       from "../hooks/useKpis";
import { useWeeklyData } from "../hooks/useWeeklyData";
import { useDailyData }  from "../hooks/useDailyData";

// ─── Estado inicial ───────────────────────────────────────────────────────────
const initialState = {
  ejFilter:     "ambos",    // "ambos" | "6am" | "2pm"
  viewMode:     "resumen",  // tab activo
  detailData:   null,       // { type: "semana"|"dia", data: {...} } | null
  selectedDate: "",         // fecha seleccionada en vista "Por Fecha"
};

// ─── Reducer ─────────────────────────────────────────────────────────────────
const reducer = (state, action) => {
  switch (action.type) {
    case "SET_EJ_FILTER":
      return { ...state, ejFilter: action.payload };
    case "SET_VIEW_MODE":
      // Al cambiar de tab, siempre limpiamos el detalle
      return { ...state, viewMode: action.payload, detailData: null };
    case "SET_DETAIL":
      return { ...state, detailData: action.payload };
    case "CLEAR_DETAIL":
      return { ...state, detailData: null };
    case "SET_SELECTED_DATE":
      return { ...state, selectedDate: action.payload };
    default:
      return state;
  }
};

export const DashboardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const {
    rawData,
    kpisData,
    tendenciaData,
    semanalData,
    diarioData,
    volData,
    loading,
    error,
    lastUpdate,
    refresh,
  } = useSupabaseData();

  const filtered = useMemo(
    () => state.ejFilter === "ambos"
      ? rawData
      : (rawData ?? []).filter(d => d.turno === state.ejFilter),
    [rawData, state.ejFilter]
  );

  // Calculate derived data directly in context
  const banda      = useBanda(rawData, kpisData);
  const kpis       = useKpis(rawData, kpisData);
  const weeklyData = useWeeklyData(rawData, state.ejFilter);
  const dailyData  = useDailyData(rawData, state.ejFilter);

  // Actions wrapped in useCallback
  const setEjFilter     = useCallback((ej)   => dispatch({ type: "SET_EJ_FILTER",     payload: ej }), []);
  const setViewMode     = useCallback((tab)  => dispatch({ type: "SET_VIEW_MODE",     payload: tab }), []);
  const setDetail       = useCallback((data) => dispatch({ type: "SET_DETAIL",        payload: data }), []);
  const clearDetail     = useCallback(()     => dispatch({ type: "CLEAR_DETAIL" }), []);
  const setSelectedDate = useCallback((date) => dispatch({ type: "SET_SELECTED_DATE", payload: date }), []);

  const value = useMemo(() => ({
    ...state,
    rawData,
    filtered,
    kpisData,
    tendenciaData,
    semanalData,
    diarioData,
    volData,
    banda,
    kpis,
    weeklyData,
    dailyData,
    loading,
    error,
    lastUpdate,
    refresh,
    dispatch,
    setEjFilter,
    setViewMode,
    setDetail,
    clearDetail,
    setSelectedDate,
  }), [
    state, rawData, filtered, kpisData, tendenciaData, semanalData,
    diarioData, volData, banda, kpis, weeklyData, dailyData,
    loading, error, lastUpdate, refresh,
    setEjFilter, setViewMode, setDetail, clearDetail, setSelectedDate
  ]);

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
