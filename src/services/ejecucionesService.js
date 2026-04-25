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
