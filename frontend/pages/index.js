import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase'; // RUTA CORRECTA
import HiveCard from '../components/Hive/HiveCard'; 
import WeatherBar from '../components/Layout/WeatherBar'; // <<-- AÑADIDO
// Importa tu componente de barra de clima aquí si ya lo creaste
// import WeatherBar from '../components/Layout/WeatherBar'; 

// --- FUNCIÓN DE CONSULTA DE DATOS ---

// Esta función implementa la lógica para obtener el último registro de cada colmena.
async function getLatestHiveStates() {
  // NOTA: Para obtener el nombre de la colmena junto con el dato, 
  // la tabla 'sensor_data' DEBE tener una clave foránea (FK) que apunte a la ID única 
  // de la colmena en una tabla separada llamada 'hives'.
  // Si no tienes la tabla 'hives', usa .select('*') y solo verás la ID única.
  
  const { data, error } = await supabase
    // La consulta usa el rol 'anon', por eso es esencial la política RLS.
    .from('sensor_data')
    .select('*') // Consulta todos los campos
    .order('created_at', { ascending: false }); // Ordena por el más reciente

  if (error) {
    console.error('Error al obtener datos:', error);
    return [];
  }

  // Lógica para agrupar y obtener SÓLO el registro más reciente por colmena
  const latestDataMap = {};
  for (const item of data) {
      if (!latestDataMap[item.hive_unique_id]) {
          latestDataMap[item.hive_unique_id] = item;
      }
  }

  return Object.values(latestDataMap);
}

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---

const HomePage = () => {
  const [hiveStates, setHiveStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // En este punto, deberías implementar la verificación de usuario de administrador.
  // Por simplicidad, por ahora cargamos los datos directamente.

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getLatestHiveStates();
        setHiveStates(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();

    // Opcional: Establecer un intervalo de actualización periódica del dashboard (ej. cada 60 segundos)
    const intervalId = setInterval(fetchData, 60000); 

    // Limpieza al desmontar el componente
    return () => clearInterval(intervalId);
  }, []);

  if (loading) return <p>Cargando estado de las colmenas...</p>;
  if (error) return <p>Error al cargar: {error}</p>;
  if (hiveStates.length === 0) return <p>No se encontraron datos de colmenas. Asegúrese de que el ESP32 esté enviando datos.</p>;

  return (
    <div className="homepage-container">
      
      {/* 1. BARRA DE PRONÓSTICO SEMANAL */}
      <WeatherBar /> {/* <<-- AÑADIDO */}
      
      <h1>Apiario Digital - Estado en Vivo</h1>

      {/* 2. CUADRÍCULA DE COLMENAS */}
      <div className="hives-grid">
        {hiveStates.map((hive) => (
          // Usamos la ID única del ESP32 como clave
          <HiveCard key={hive.hive_unique_id} hiveData={hive} />
        ))}
      </div>
      
      {/* NOTA: Agregar un botón/link al Panel de Administrador aquí */}
      
      <style jsx global>{`
        /* Estilos globales para la cuadrícula */
        .homepage-container {
          padding: 20px;
          text-align: center;
        }
        .hives-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 20px; /* Espacio entre los hexágonos */
          margin-top: 30px;
        }
      `}</style>
    </div>
  );
};

export default HomePage;