export const VENTANAS = { corta: 7, larga: 30 };
export const SIGMA_ADVERTENCIA = 1.5;
export const SIGMA_CRITICO = 2.0;
export const FECHA_MIN = "2026-03-31";
export const FECHA_MAX = new Date().toISOString().split("T")[0];
export const FECHA_REFERENCIA = new Date().toISOString().split("T")[0];

export const FILTROS_EJECUCION = [
  { id: "ambos", label: "Ambas ejecuciones" },
  { id: "EJ1", label: "Ejecución 1" },
  { id: "EJ2", label: "Ejecución 2" },
];

export const TABS = [
  { id: "resumen", label: "Resumen" },
  { id: "semana", label: "Por Semana" },
  { id: "dia", label: "Por Día" },
  { id: "tendencia", label: "Tendencia" },
  { id: "volumetria", label: "Volumetría" },
  { id: "fecha", label: "Por Fecha" },
  { id: "analisis", label: "Análisis" },
  { id: "bitacora", label: "Bitácora" },
];
