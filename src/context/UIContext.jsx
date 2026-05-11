import { createContext, useContext, useReducer, useCallback } from "react";

const UIContext = createContext(null);

const initialState = {
  ejFilter:     "ambos",
  viewMode:     "resumen",
  detailData:   null,
  selectedDate: "",
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_EJ_FILTER":
      return { ...state, ejFilter: action.payload };
    case "SET_VIEW_MODE":
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

export const UIProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setEjFilter     = useCallback((ej)     => dispatch({ type: "SET_EJ_FILTER",     payload: ej }),     []);
  const setViewMode     = useCallback((tab)    => dispatch({ type: "SET_VIEW_MODE",     payload: tab }),    []);
  const setDetail       = useCallback((detail) => dispatch({ type: "SET_DETAIL",        payload: detail }), []);
  const clearDetail     = useCallback(()       => dispatch({ type: "CLEAR_DETAIL" }),                       []);
  const setSelectedDate = useCallback((date)   => dispatch({ type: "SET_SELECTED_DATE", payload: date }),   []);

  const value = {
    ...state,
    dispatch,
    setEjFilter,
    setViewMode,
    setDetail,
    clearDetail,
    setSelectedDate,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};

export const useUIContext = () => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUIContext debe usarse dentro de <UIProvider>");
  return ctx;
};
