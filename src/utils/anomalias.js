import { SIGMA_ADVERTENCIA, SIGMA_CRITICO } from "../constants/config";
import { nivelColorMap } from "../constants/colors";

/**
 * Clasifica un valor de tiempo según su distancia a la banda de tolerancia.
 * @param {number} valor   - Tiempo total en minutos
 * @param {object} banda   - { media, sigma, advertencia, critico }
 * @returns {"CRÍTICO"|"ADVERTENCIA"|"RÁPIDO"|"NORMAL"}
 */
export const clasificarNivel = (valor, banda) => {
  if (valor > banda.critico)                              return "CRÍTICO";
  if (valor > banda.advertencia)                          return "ADVERTENCIA";
  if (valor < banda.media - SIGMA_ADVERTENCIA * banda.sigma) return "RÁPIDO";
  return "NORMAL";
};

/**
 * Retorna el color correspondiente al nivel de alerta.
 */
export const colorDeNivel = (nivel) => nivelColorMap[nivel] ?? nivelColorMap.NORMAL;

/**
 * Clasifica el nivel de una alerta de volumetría según ratio vs. promedio.
 * @param {number} valor   - Registros actualizados
 * @param {number} media   - Promedio histórico
 * @param {number} sigma   - Desviación estándar
 * @returns {"DELTA_MASIVO"|"DELTA_ALTO"|"NORMAL"}
 */
export const clasificarVolumen = (valor, media, sigma) => {
  if (valor > media + SIGMA_CRITICO     * sigma) return "DELTA_MASIVO";
  if (valor > media + SIGMA_ADVERTENCIA * sigma) return "DELTA_ALTO";
  return "NORMAL";
};

/**
 * Color para una alerta de volumetría.
 */
export const colorDeVolumen = (alerta, C) => ({
  DELTA_MASIVO: C.red,
  DELTA_ALTO:   C.amber,
  NORMAL:       C.teal,
}[alerta] ?? C.teal);
