export {
  fetchEjecuciones,
  fetchKpis,
  fetchTendencia,
  fetchResumenSemanal,
  fetchResumenDiario,
  fetchVolometria,
  fetchCorrelaciones,
  fetchCorrelacionesSpearman,
  fetchAnotaciones,
  createAnotacion,
  updateAnotacion,
  deleteAnotacion,
} from '../repositories/ejecucionesRepository';

export { deleteAnotacion as deactivateAnotacion } from '../repositories/ejecucionesRepository';
