/**
 * Formatea minutos a string legible: "2h 15m" o "45m"
 */
export const fmtMin = (m) => {
  if (m == null || isNaN(m)) return "–";
  const sign = m < 0 ? "-" : "";
  const abs  = Math.abs(m);
  const h    = Math.floor(abs / 60);
  const min  = Math.round(abs % 60);
  return sign + (h > 0 ? `${h}h ${min}m` : `${min}m`);
};

/**
 * Formatea número grande a millones con 1 decimal: "12.3M"
 */
export const fmtM = (n) =>
  n != null ? `${(n / 1e6).toFixed(1)}M` : "–";

/**
 * Nombre corto del día de la semana a partir de una fecha ISO
 */
export const getDayName = (dateStr) => {
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  return days[new Date(`${dateStr}T12:00:00`).getDay()];
};

/**
 * Promedio de un array numérico. Retorna 0 si el array está vacío.
 */
export const avg = (arr) =>
  arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

/**
 * Desviación estándar poblacional de un array numérico.
 */
export const stddev = (arr) => {
  if (!arr.length) return 0;
  const m = avg(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
};

/**
 * Diferencia en días entre una fecha ISO y la fecha de referencia.
 */
export const diasDesde = (fechaStr, referencia) =>
  (referencia - new Date(`${fechaStr}T12:00:00`)) / 86400000;
