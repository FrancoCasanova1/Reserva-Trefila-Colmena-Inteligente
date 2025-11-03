import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'; // Si usas Next.js
import { getHiveHistory } from '../utils/data-service'; // Ajusta la ruta

// Importaciones de Recharts (necesitas instalarlos: npm install recharts)
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const HiveDashboard = () => {
  const router = useRouter();
  // Extrae la ID de la colmena de la URL (ej. /hive/colmena_alfa_001)
  const { id } = router.query; 

  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(7); // Rango de tiempo por defecto

  useEffect(() => {
    if (!id) return; // Espera a que la ID esté disponible en la URL

    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getHiveHistory(id, days);
        setHistoryData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, days]); // Vuelve a cargar si cambia la ID o el rango de días

  if (loading) return <p>Cargando historial de {id}...</p>;
  if (error) return <p>Error: {error}</p>;
  if (historyData.length === 0) return <p>No hay datos históricos para esta colmena en el rango seleccionado.</p>;

  // Último dato para mostrar el estado actual al inicio de la página
  const latestData = historyData[historyData.length - 1];

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard Detallado: {id}</h1>
      <p>Última actualización: {new Date(latestData.created_at).toLocaleString('es-AR')}</p>
      
      {/* Selector de Rango de Días */}
      <div style={{ marginBottom: '20px' }}>
        <label>Mostrar últimos:</label>
        <select value={days} onChange={(e) => setDays(e.target.value)}>
          <option value={1}>1 Día</option>
          <option value={7}>7 Días</option>
          <option value={30}>30 Días</option>
        </select>
      </div>

      {/* --- GRÁFICOS --- */}
      
      {/* 1. Gráfico de Peso */}
      <h2>Evolución del Peso (⚖️)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={historyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" /> {/* Mostrar la hora en el eje X */}
          <YAxis label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft' }} />
          <Tooltip 
            labelFormatter={(label) => `Hora: ${label}`}
            formatter={(value) => [`${value.toFixed(2)} kg`, 'Peso']}
          />
          <Legend />
          <Line type="monotone" dataKey="weight" stroke="#8b4513" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>

      {/* 2. Gráfico de Temperatura y Humedad */}
      <h2 style={{ marginTop: '40px' }}>Temperatura (🌡️) y Humedad (💧)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={historyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis yAxisId="left" label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft' }} stroke="#dc3545" />
          <YAxis yAxisId="right" orientation="right" label={{ value: 'Hum (%)', angle: 90, position: 'insideRight' }} stroke="#007bff" />
          <Tooltip 
            formatter={(value, name) => [`${value.toFixed(1)} ${name === 'temperature' ? '°C' : '%'}`, name === 'temperature' ? 'Temperatura' : 'Humedad']}
          />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="temperature" name="Temperatura" stroke="#dc3545" dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="humidity" name="Humedad" stroke="#007bff" dot={false} />
        </LineChart>
      </ResponsiveContainer>

      {/* Puedes agregar un Gráfico para el Nivel de Sonido de manera similar */}
      {/* ... */}
      
    </div>
  );
};

export default HiveDashboard;