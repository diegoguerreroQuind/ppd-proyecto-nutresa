// Fecha de referencia para cálculo de ventanas temporales (demo)
// En producción se reemplaza por: new Date()
export const FECHA_REFERENCIA = "2026-04-24";

// Ventanas temporales para KPIs (en días)
export const VENTANAS = { corta: 7, larga: 30 };

// Opciones del filtro de ejecución
export const FILTROS_EJECUCION = [
  { id: "ambos", label: "Ambas ejecuciones" },
  { id: "6am",   label: "Ejecución 6am"  },
  { id: "2pm",   label: "Ejecución 2pm"  },
];

// Tabs de navegación del dashboard
export const TABS = [
  { id: "resumen",    label: "Resumen"     },
  { id: "semana",     label: "Por Semana"  },
  { id: "dia",        label: "Por Día"     },
  { id: "tendencia",  label: "Tendencia"   },
  { id: "volumetria", label: "Volumetría"  },
  { id: "fecha",      label: "Por Fecha"   },
];

// Umbrales sigma para clasificación de anomalías
export const SIGMA_ADVERTENCIA = 1.5;
export const SIGMA_CRITICO     = 2.0;

// Fecha mínima y máxima del selector de fecha
export const FECHA_MIN = "2026-03-31";
export const FECHA_MAX = "2026-04-24";
