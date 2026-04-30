import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import {
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
} from '../services/ejecucionesService';

export const useSupabaseData = () => {
  const [rawData, setRawData] = useState([]);
  const [kpisData, setKpisData] = useState([]);
  const [tendenciaData, setTendenciaData] = useState([]);
  const [semanalData, setSemanalData] = useState([]);
  const [diarioData, setDiarioData] = useState([]);
  const [volData, setVolData] = useState([]);
  const [correlacionesData, setCorrelacionesData] = useState([]);
  const [correlacionesSpearmanData, setCorrelacionesSpearmanData] = useState([]);
  const [anotacionesData, setAnotacionesData] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        raw, kpis, tendencia, semanal,
        diario, vol, correlaciones, correlacionesSpearman, anotaciones
      ] = await Promise.all([
        fetchEjecuciones(),
        fetchKpis(),
        fetchTendencia(),
        fetchResumenSemanal(),
        fetchResumenDiario(),
        fetchVolometria(),
        fetchCorrelaciones(),
        fetchCorrelacionesSpearman(),
        fetchAnotaciones(),
      ].map(p => p.catch(e => {
        throw new Error(`Data fetch failed: ${e.message}`);
      })));

      setRawData(raw ?? []);
      setKpisData(kpis ?? []);
      setTendenciaData(tendencia ?? []);
      setSemanalData(semanal ?? []);
      setDiarioData(diario ?? []);
      setVolData(vol ?? []);
      setCorrelacionesData(correlaciones ?? []);
      setCorrelacionesSpearmanData(correlacionesSpearman ?? []);
      setAnotacionesData(anotaciones ?? []);
      setLastUpdate(new Date());

      // ─── Auto-crear anotaciones por fallos ──────────────────────────────────
      try {
        const incompletas = (raw ?? []).filter(ej => 
          !ej.exitoso && (!ej.total_min || ej.total_min <= 0)
        );

        let creadas = 0;
        for (const ej of incompletas) {
          const yaExiste = (anotaciones ?? []).some(a => 
            a.fecha_inicio === ej.fecha && a.titulo.includes(ej.turno)
          );

          if (!yaExiste) {
            await createAnotacion({
              fecha_inicio: ej.fecha,
              fecha_fin:    null,
              titulo:       `Falla en ejecución ${ej.turno} — ${ej.fecha}`,
              descripcion:  ej.notas
                              ? ej.notas
                              : "Ejecución no completada. No se registraron tiempos de proceso.",
              tipo:         "critico",
              created_by:   "Equipo Quind",
            });
            creadas++;
          }
        }
        if (creadas > 0) loadAll();
      } catch (annoErr) {
        console.error('Error auto-creating annotations:', annoErr);
      }
    } catch (err) {
      console.error('Error fetching Supabase data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll();

    // 5 minutes fallback interval
    const intervalId = setInterval(() => {
      loadAll();
    }, 5 * 60 * 1000);

    // Realtime subscription
    const channel = supabase
      .channel('ppd_realtime_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ppd_ejecuciones' },
        () => {
          loadAll();
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      clearInterval(intervalId);
      supabase.removeChannel(channel);
    };
  }, [loadAll]);

  return {
    rawData,
    kpisData,
    tendenciaData,
    semanalData,
    diarioData,
    volData,
    correlacionesData,
    correlacionesSpearmanData,
    anotacionesData,
    loading,
    error,
    lastUpdate,
    refresh: loadAll
  };
};
