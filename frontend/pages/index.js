// /frontend/pages/index.js
import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import HiveCard from '../components/Hive/HiveCard'; 
import WeatherBar from '../components/Layout/WeatherBar';

export default function HomePage() {
  const supabase = useSupabaseClient();
  const [hives, setHives] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchHives() {
      try {
        setLoading(true);
        setError(null);

        // CONSULTA: Traemos los datos de la tabla 'hives' (ID, nombre, etc.)
        const { data, error } = await supabase
          .from('hives')
          .select('hive_unique_id, name, location'); 

        if (error) {
          // Lanza el error al bloque catch para manejar fallos de RLS o conexión
          throw error; 
        }

        // Si data es null o undefined, establecemos un array vacío para evitar errores
        if (data) {
          setHives(data);
        } else {
          setHives([]); 
        }

      } catch (e) {
        console.error("Error fetching hives:", e.message);
        // El mensaje de error es crucial para el usuario
        setError("Error al cargar la lista de colmenas. Verifique la política RLS de la tabla 'hives' (debe permitir SELECT al rol 'public').");
        setHives([]);
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
      <WeatherBar />
      
      <h1>Apiario Digital - Estado en Vivo ({hives.length} Colmena(s) Registrada(s))</h1>

      {/* 2. CUADRÍCULA DE COLMENAS */}
      <div className="hive-grid">
        {/* Usamos Array.isArray() para garantizar que 'hives' es un array antes de mapear. */}
        {/* Verificamos que 'hive' no sea nulo antes de renderizar la tarjeta. */}
        {Array.isArray(hives) && hives.map((hive) => (
          hive && (
            <HiveCard 
              key={hive.hive_unique_id} 
              hiveId={hive.hive_unique_id}     // ID técnica (ej. colmena_alfa_001)
              hiveName={hive.name}            // Nombre amigable (ej. Colmena Principal)
              hiveLocation={hive.location}    // Ubicación
            />
          )
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
            color: #c0392b; /* Rojo más fuerte para errores */
            font-weight: bold;
            background: #f7e6e4;
            border-radius: 8px;
            margin: 20px;
            border: 1px solid #c0392b;
        }
      `}</style>
    </div>
  );
}