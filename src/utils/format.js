export const fmtMin = (m) => {
  if (m == null || isNaN(m) || m <= 0) return "–";
  const h   = Math.floor(m / 60);
  const min = Math.round(m % 60);
  return h > 0 ? `${h}h ${min}m` : `${min}m`;
};

export const fmtM = (n) => {
  if (n == null) return "–";
  if (n === 0)   return "0";
  if (n < 1_000)      return `${n}`;
  if (n < 100_000)    return `${(n / 1_000).toFixed(1)}K`;
  if (n < 1_000_000)  return `${Math.round(n / 1_000)}K`;
  if (n < 10_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  return `${(n / 1_000_000).toFixed(1)}M`;
};

export const isIncompleta = (d) =>
  !d.exitoso && (!d.total_min || d.total_min <= 0);

export const getDayName = (dateStr) =>
  ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"][new Date(`${dateStr}T12:00:00`).getDay()];

export const avg = (arr) =>
  arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

export const stddev = (arr) => {
  const m = avg(arr);
  return Math.sqrt(
    arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length
  );
};

export const diasDesde = (fechaStr, ref) =>
  (ref - new Date(`${fechaStr}T12:00:00`)) / 86400000;
