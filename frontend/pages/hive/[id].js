// /frontend/pages/hive/[id].js
import { useState, useEffect, useMemo } from 'react'; // Agregamos useMemo
import { useRouter } from 'next/router';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import Link from 'next/link'; // Importamos Link para navegación
// Librerías de gráficos
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Componente para formatear el tooltip (Mejora: maneja el orden de tiempo)
const CustomTooltip = ({ active, payload, label, unit }) => {
    if (active && payload && payload.length) {
        // La etiqueta 'label' aquí es el timestamp (created_at)
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

// Componente para visualizar un gráfico
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
                
                {/* Usamos el componente de Tooltip mejorado */}
                <Tooltip 
                    content={<CustomTooltip unit={unit} />}
                />
                
                <Legend />
                <Line type="monotone" dataKey={dataKey} stroke={color} name={name} dot={false} strokeWidth={2} />
            </LineChart>
        </ResponsiveContainer>
        <style jsx>{`
             .chart-container {
               margin-bottom: 40px;
               background: #fff;
               padding: 20px;
               border-radius: 8px;
               box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
             }
             :global(.custom-tooltip) {
                background: #fff;
                border: 1px solid #ccc;
                padding: 10px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
             }
             :global(.custom-tooltip .label) {
                margin-bottom: 5px;
                font-weight: bold;
             }
        `}</style>
    </div>
);


export default function HiveDetailPage() {
    const router = useRouter();
    // CRÍTICO: El nombre de la variable aquí DEBE ser 'id' si el archivo es [id].js
    const { id: hive_unique_id } = router.query; 
    const supabase = useSupabaseClient();
    
    const [hiveName, setHiveName] = useState('Cargando nombre...');
    const [sensorData, setSensorData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!hive_unique_id) return;

        async function fetchData() {
            setLoading(true);
            setError(null);

            try {
                // 1. OBTENER NOMBRE AMIGABLE DESDE LA TABLA 'hives'
                const { data: hiveData, error: hiveError } = await supabase
                    .from('hives')
                    .select('name')
                    .eq('hive_unique_id', hive_unique_id)
                    .single(); 

                if (hiveError && hiveError.code !== 'PGRST116') throw hiveError; // Ignorar "no rows found" inicialmente
                
                if (hiveData && hiveData.name) {
                    setHiveName(hiveData.name);
                } else {
                    setHiveName(`Colmena: ${hive_unique_id}`); // Usa el ID si no hay nombre registrado
                }

                // 2. OBTENER DATOS DE SENSORES DESDE LA TABLA 'sensor_data'
                const { data: sensorRows, error: sensorError } = await supabase
                    .from('sensor_data')
                    .select('created_at, temperature, humidity, weight, sound_level')
                    .eq('hive_unique_id', hive_unique_id)
                    .order('created_at', { ascending: false }) 
                    .limit(100); 

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

        fetchData();
    }, [hive_unique_id, supabase]);

    // Resumen de estado actual (calculado solo cuando sensorData cambia)
    const latestData = useMemo(() => sensorData.length > 0 ? sensorData[sensorData.length - 1] : null, [sensorData]);

    if (loading) return <div className="loading-state">Cargando historial de {hive_unique_id}...</div>;
    if (error) return <div className="error-state">{error}</div>;
    if (!latestData) return (
         <div className="empty-state">
            <Link href="/" className="back-link">&larr; Volver al Dashboard</Link>
            <h2>Colmena: {hiveName}</h2>
            <p>**No hay datos históricos** registrados en la tabla `sensor_data` para esta colmena.</p>
        </div>
    );
    
    return (
        <div className="detail-container">
            <header>
                <button onClick={() => router.push('/')} className="back-button">&larr; Volver al Dashboard</button>
                <h2>Historial de: {hiveName}</h2>
                <p className="latest-reading">Última Lectura: {new Date(latestData.created_at).toLocaleString('es-AR')}</p>
            </header>

            {/* 1. Resumen de Estado Actual */}
            <div className="summary-cards">
                <div className="card temp-card">🌡️ Temp: <span>{latestData.temperature.toFixed(1)}°C</span></div>
                <div className="card hum-card">💧 Hum: <span>{latestData.humidity.toFixed(1)}%</span></div>
                <div className="card weight-card">⚖️ Peso: <span>{latestData.weight.toFixed(2)} kg</span></div>
            </div>

            {/* 2. Gráficos Históricos */}
            <div className="charts-grid">
                <CustomChart data={sensorData} dataKey="weight" name="Peso (kg)" color="#e59400" unit="kg" />
                <CustomChart data={sensorData} dataKey="temperature" name="Temperatura (°C)" color="#ff7300" unit="°C" />
                <CustomChart data={sensorData} dataKey="humidity" name="Humedad (%)" color="#3879ff" unit="%" />
            </div>
            
            <style jsx global>{`
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
                .detail-container {
                    padding: 40px;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                header {
                    text-align: center;
                    margin-bottom: 40px;
                }
                header h2 {
                    font-size: 2.5em;
                    color: #333;
                    margin-bottom: 5px;
                }
                .latest-reading {
                    color: #888;
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