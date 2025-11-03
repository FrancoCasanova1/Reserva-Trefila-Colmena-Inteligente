// /frontend/pages/index.js
import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import HiveCard from '../components/Hive/HiveCard'; 
import WeatherBar from '../components/Layout/WeatherBar';

// NOTA: El componente WeatherBar podría seguir fallando con 500 si la clave de OpenWeatherMap no está activa.
// El resto del código de Supabase funcionará sin problemas.

export default function HomePage() {
  const supabase = useSupabaseClient();
  // Cambiamos el estado para almacenar objetos de colmena, no solo strings de ID
  const [hives, setHives] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchHives() {
      try {
        setLoading(true);
        // CONSULTA CLAVE: Traemos los datos de la tabla 'hives' (ID, nombre, etc.)
        const { data, error } = await supabase
          .from('hives')
          .select('hive_unique_id, name, location'); 

        if (error) {
          throw error;
        }

        // Si hay datos, los guardamos en el estado
        if (data) {
          setHives(data);
        }

      } catch (e) {
        console.error("Error fetching hives:", e.message);
        setError("Error al cargar la lista de colmenas. Verifique la conexión a Supabase y la política RLS de la tabla 'hives'.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchHives();
  }, [supabase]);

  if (loading) return <div className="loading-state">Cargando dashboard y colmenas...</div>;
  if (error) return <div className="error-state">{error}</div>;
  if (hives.length === 0) return <div className="empty-state">No hay colmenas registradas. ¡Añade una en el panel de administración!</div>;

  return (
    <div className="homepage-container">
      
      {/* 1. BARRA DE PRONÓSTICO SEMANAL */}
      {/* Si la clave del clima falla, esta barra simplemente no se mostrará */}
      <WeatherBar />
      
      <h1>Apiario Digital - Estado en Vivo ({hives.length} Colmena(s) Registrada(s))</h1>

      {/* 2. CUADRÍCULA DE COLMENAS */}
      <div className="hive-grid">
        {hives.map((hive) => (
          <HiveCard 
            key={hive.hive_unique_id} 
            hiveId={hive.hive_unique_id} // ID técnica
            hiveName={hive.name}        // Nombre amigable
            hiveLocation={hive.location} // Ubicación
          />
        ))}
      </div>

      <style jsx>{`
        .homepage-container {
          padding: 20px;
          text-align: center;
        }
        .hive-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 30px;
        }
        .loading-state, .error-state, .empty-state {
            padding: 50px;
            font-size: 1.2em;
            color: #555;
        }
        .error-state {
            color: red;
            font-weight: bold;
        }
      `}</style>
    </div>
  );
}