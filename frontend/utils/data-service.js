import { supabase } from './supabase'; // Asegúrate de que la ruta sea correcta

// Obtiene el historial de datos para una colmena específica dentro de un rango de tiempo.
export async function getHiveHistory(hiveId, days = 7) {
  // Calcula la fecha límite (hace X días)
  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() - days); // Resta el número de días

  const { data, error } = await supabase
    .from('sensor_data')
    .select('*')
    .eq('hive_unique_id', hiveId) // CRUCIAL: Filtra por la ID de la colmena del ESP32
    .gte('created_at', limitDate.toISOString()) // Filtra por el rango de tiempo
    .order('created_at', { ascending: true }); // Ordena del más antiguo al más reciente para el gráfico

  if (error) {
    console.error(`Error fetching history for hive ${hiveId}:`, error);
    throw new Error('No se pudo cargar el historial de la colmena.');
  }

  // Mapeo y formateo: Aseguramos que la fecha sea legible y los valores sean numéricos.
  return data.map(item => ({
    ...item,
    // Puedes formatear la hora aquí para usarla en el eje X de los gráficos
    time: new Date(item.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    date: new Date(item.created_at).toLocaleDateString('es-AR', { month: 'short', day: 'numeric' }),
    temperature: parseFloat(item.temperature),
    humidity: parseFloat(item.humidity),
    weight: parseFloat(item.weight),
    sound_level: parseInt(item.sound_level, 10),
  }));
}