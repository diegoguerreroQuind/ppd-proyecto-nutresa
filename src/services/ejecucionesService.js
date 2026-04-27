import { supabase } from './supabaseClient'

export const fetchEjecuciones = async () => {
  const { data, error } = await supabase
    .from('ppd_ejecuciones')
    .select('*')
    .order('fecha', { ascending: true })
  
  if (error) throw error
  return data
}

export const fetchKpis = async () => {
  const { data, error } = await supabase
    .from('v_kpis_operativos')
    .select('*')
  
  if (error) throw error
  return data
}

export const fetchTendencia = async () => {
  const { data, error } = await supabase
    .from('v_tendencia_diaria')
    .select('*')
    .order('fecha', { ascending: true })
  
  if (error) throw error
  return data
}

export const fetchResumenSemanal = async () => {
  const { data, error } = await supabase
    .from('v_resumen_semanal')
    .select('*')
    .order('semana', { ascending: true })
  
  if (error) throw error
  return data
}

export const fetchResumenDiario = async () => {
  const { data, error } = await supabase
    .from('v_resumen_diario')
    .select('*')
    .order('fecha', { ascending: false })
  
  if (error) throw error
  return data
}

export const fetchVolometria = async () => {
  const { data, error } = await supabase
    .from('v_alertas_volumetria')
    .select('*')
    .order('fecha', { ascending: true })
  
  if (error) throw error
  return data
}

export const fetchCorrelaciones = async () => {
  const { data, error } = await supabase
    .from('v_correlaciones')
    .select('*')
    .order('turno', { ascending: true });
  if (error) throw error;
  return data;
};

export const fetchCorrelacionesSpearman = async () => {
  const { data, error } = await supabase
    .from('v_correlaciones_spearman')
    .select('*')
    .order('turno', { ascending: true });
  if (error) throw error;
  return data;
};

export const fetchAnotaciones = async () => {
  const { data, error } = await supabase
    .from('v_anotaciones_activas')
    .select('*')
    .order('fecha_inicio', { ascending: false });
  if (error) throw error;
  return data;
};

export const createAnotacion = async (anotacion) => {
  const { data, error } = await supabase
    .from('ppd_anotaciones')
    .insert([anotacion])
    .select();
  if (error) throw error;
  return data;
};

export const deactivateAnotacion = async (id) => {
  const { error } = await supabase
    .from('ppd_anotaciones')
    .update({ activo: false })
    .eq('id', id);
  if (error) throw error;
};

export const updateAnotacion = async (id, changes) => {
  const { data, error } = await supabase
    .from('ppd_anotaciones')
    .update(changes)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data;
};
