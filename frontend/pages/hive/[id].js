// /frontend/pages/hive/[id].js (Código Final con Filtros de Tiempo)

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import Link from 'next/link';
// Librerías de gráficos
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Componente de Tooltip Mejorado ---
const CustomTooltip = ({ active, payload, label, unit }) => {
    if (active && payload && payload.length) {
        const date = new Date(label);
        const formattedLabel = date.toLocaleString('es-AR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });

        return (
            <div className="custom-tooltip">
                <p className="label">{`Tiempo: ${formattedLabel}`}</p>
                {payload.map((entry, index) => (
                    <p key={`item-${index}`} style={{ color: entry.color }}>
                        {`${entry.name}: ${entry.value.toFixed(2)} ${unit}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// --- Componente para visualizar un gráfico ---
const CustomChart = ({ data, dataKey, name, color, unit }) => (
    <div className="chart-container">
        <h3>{name} Histórico</h3>
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis 
                    dataKey="created_at" 
                    tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                />
                <YAxis unit={unit} domain={['auto', 'auto']} />
                
                <Tooltip content={<CustomTooltip unit={unit} />} />
                
                <Legend />
                <Line type="monotone" dataKey={dataKey} stroke={color} name={name} dot={false} strokeWidth={2} />
            </LineChart>
        </ResponsiveContainer>
    </div>
);


export default function HiveDetailPage() {
    const router = useRouter();
    const { id: hive_unique_id } = router.query;
    const supabase = useSupabaseClient();
    
    const [hiveName, setHiveName] = useState('Cargando nombre...');
    const [sensorData, setSensorData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Nuevo estado para el filtro (días)
    const [timeFilter, setTimeFilter] = useState(1); // 1 día por defecto

    // Función para obtener la fecha de inicio del rango
    const getStartTime = (days) => {
        const date = new Date();
        date.setDate(date.getDate() - days);
        // Formato ISO 8601 requerido por Supabase
        return date.toISOString(); 
    };

    useEffect(() => {
        if (!hive_unique_id) return;

        async function fetchData() {
            setLoading(true);
            setError(null);

            // Calcula la fecha mínima de las lecturas basadas en el filtro
            const startTime = getStartTime(timeFilter);
            
            try {
                // 1. Obtener nombre amigable (no depende del filtro)
                const { data: hiveData } = await supabase
                    .from('hives')
                    .select('name')
                    .eq('hive_unique_id', hive_unique_id)
                    .single(); 
                
                if (hiveData && hiveData.name) {
                    setHiveName(hiveData.name);
                } else {
                    setHiveName(`Colmena: ${hive_unique_id}`);
                }

                // 2. Obtener datos de sensores filtrados por tiempo
                const { data: sensorRows, error: sensorError } = await supabase
                    .from('sensor_data')
                    .select('created_at, temperature, humidity, weight, sound_level')
                    .eq('hive_unique_id', hive_unique_id)
                    // CRÍTICO: Filtro para obtener solo datos posteriores a 'startTime'
                    .gte('created_at', startTime) 
                    .order('created_at', { ascending: false }); 

                if (sensorError) throw sensorError;

                if (sensorRows) {
                    // Revertir el orden para que los gráficos vayan de izquierda (antiguo) a derecha (nuevo)
                    setSensorData(sensorRows.reverse()); 
                }

            } catch (e) {
                console.error("Error al cargar datos:", e.message);
                setError(`Fallo al cargar la colmena ${hive_unique_id}. Error: ${e.message}`);
            } finally {
                setLoading(false);
            }
        }

        // Se ejecuta cada vez que cambia el ID o el filtro de tiempo
        fetchData(); 
    }, [hive_unique_id, timeFilter, supabase]); // Añadimos timeFilter a las dependencias

    // Resumen de estado actual (calculado solo cuando sensorData cambia)
    const latestData = useMemo(() => sensorData.length > 0 ? sensorData[sensorData.length - 1] : null, [sensorData]);

    if (loading) return <div className="loading-state">Cargando historial de {hive_unique_id}...</div>;
    if (error) return <div className="error-state">{error}</div>;
    if (!latestData && sensorData.length === 0) return (
         <div className="empty-state">
            <Link href="/" className="back-link">&larr; Volver al Dashboard</Link>
            <h2>Colmena: {hiveName}</h2>
            <p>**No hay datos históricos** registrados en el rango seleccionado ({timeFilter} día(s)).</p>
        </div>
    );
    
    // Opciones de filtro
    const filterOptions = [
        { label: 'Últimas 24h', value: 1 },
        { label: 'Últimos 7 días', value: 7 },
        { label: 'Últimos 30 días', value: 30 },
    ];

    return (
        <div className="detail-container">
            <header>
                <button onClick={() => router.push('/')} className="back-button">&larr; Volver al Dashboard</button>
                <h2>Historial de: {hiveName}</h2>
                <p className="latest-reading">Última Lectura: {latestData ? new Date(latestData.created_at).toLocaleString('es-AR') : 'N/A'}</p>
            </header>

            {/* Selector de Filtro de Tiempo */}
            <div className="filter-controls">
                {filterOptions.map(option => (
                    <button
                        key={option.value}
                        onClick={() => setTimeFilter(option.value)}
                        className={timeFilter === option.value ? 'active' : ''}
                        disabled={loading}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            {/* 1. Resumen de Estado Actual */}
            {latestData && (
                <div className="summary-cards">
                    <div className="card temp-card">🌡️ Temp: <span>{latestData.temperature.toFixed(1)}°C</span></div>
                    <div className="card hum-card">💧 Hum: <span>{latestData.humidity.toFixed(1)}%</span></div>
                    <div className="card weight-card">⚖️ Peso: <span>{latestData.weight.toFixed(2)} kg</span></div>
                </div>
            )}

            {/* 2. Gráficos Históricos */}
            {sensorData.length > 0 && (
                <div className="charts-grid">
                    <CustomChart data={sensorData} dataKey="weight" name="Peso (kg)" color="#e59400" unit="kg" />
                    <CustomChart data={sensorData} dataKey="temperature" name="Temperatura (°C)" color="#ff7300" unit="°C" />
                    <CustomChart data={sensorData} dataKey="humidity" name="Humedad (%)" color="#3879ff" unit="%" />
                </div>
            )}
            
            <style jsx global>{`
                /* Estilos globales y de estado */
                .loading-state, .error-state, .empty-state {
                    text-align: center;
                    padding: 50px;
                    font-size: 1.2em;
                    color: #555;
                }
                .error-state {
                    color: #e74c3c;
                }
                .back-link {
                    color: #3498db;
                    text-decoration: none;
                    display: block;
                    margin-bottom: 20px;
                    text-align: left;
                }
            `}</style>
            <style jsx>{`
                /* Estilos específicos de la página */
                .detail-container {
                    padding: 40px;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .back-button {
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    padding: 10px 15px;
                    background-color: #3498db;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                .back-button:hover {
                    background-color: #2980b9;
                }
                .filter-controls {
                    text-align: center;
                    margin-bottom: 40px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #eee;
                }
                .filter-controls button {
                    padding: 10px 15px;
                    margin: 0 5px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    background-color: #f0f0f0;
                    cursor: pointer;
                    transition: background-color 0.2s, border-color 0.2s;
                }
                .filter-controls button.active {
                    background-color: #f39c12;
                    color: white;
                    border-color: #f39c12;
                    font-weight: bold;
                }
                .filter-controls button:hover:not(.active) {
                    background-color: #e0e0e0;
                }
                .summary-cards {
                    display: flex;
                    justify-content: space-around;
                    gap: 20px;
                    margin-bottom: 50px;
                    flex-wrap: wrap;
                }
                .card {
                    background: #fff;
                    padding: 20px;
                    border-radius: 12px;
                    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.1);
                    font-size: 1.2em;
                    flex: 1;
                    min-width: 250px;
                    text-align: left;
                    border-left: 5px solid;
                }
                .temp-card { border-color: #ff7300; }
                .hum-card { border-color: #3879ff; }
                .weight-card { border-color: #e59400; }
                .card span {
                    font-weight: bold;
                    font-size: 1.5em;
                    display: block;
                    margin-top: 5px;
                }
                .charts-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 30px;
                }
            `}</style>
        </div>
    );
}