import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import {
  fetchEjecuciones,
  fetchKpis,
  fetchTendencia,
  fetchResumenSemanal,
  fetchResumenDiario,
  fetchVolometria
} from '../services/ejecucionesService';

export const useSupabaseData = () => {
  const [rawData, setRawData] = useState([]);
  const [kpisData, setKpisData] = useState([]);
  const [tendenciaData, setTendenciaData] = useState([]);
  const [semanalData, setSemanalData] = useState([]);
  const [diarioData, setDiarioData] = useState([]);
  const [volData, setVolData] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        raw,
        kpis,
        tendencia,
        semanal,
        diario,
        vol
      ] = await Promise.all([
        fetchEjecuciones(),
        fetchKpis(),
        fetchTendencia(),
        fetchResumenSemanal(),
        fetchResumenDiario(),
        fetchVolometria()
      ].map(p => p.catch(e => {
        throw new Error(`Data fetch failed: ${e.message}`);
      })));

      setRawData(raw ?? []);
      setKpisData(kpis ?? []);
      setTendenciaData(tendencia ?? []);
      setSemanalData(semanal ?? []);
      setDiarioData(diario ?? []);
      setVolData(vol ?? []);
      setLastUpdate(new Date());
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
    loading,
    error,
    lastUpdate,
    refresh: loadAll
  };
};
