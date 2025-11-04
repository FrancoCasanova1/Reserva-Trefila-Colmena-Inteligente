// /frontend/pages/index.js (NUEVAMENTE REVISADO Y COMPLETO CON CLIMA)

import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import Link from 'next/link';
import Head from 'next/head';

// --- Nuevo Componente: Barra de Clima ---
function WeatherBar({ weather }) {
    if (!weather || !weather.main) {
        // Si no hay datos o la estructura principal (main) falta, no mostrar nada o un mensaje.
        if (weather) {
            return <div className="weather-bar status">Cargando datos del clima...</div>;
        }
        return null;
    }

    // Usamos el encadenamiento opcional para la desestructuración, aunque ya verificamos 'main' arriba.
    const { name, main, weather: weatherDetails } = weather;
    
    // Usamos encadenamiento opcional para manejar casos donde weatherDetails es vacío o null
    const description = weatherDetails?.[0]?.description || 'Datos no disponibles'; 
    const iconCode = weatherDetails?.[0]?.icon;
    const iconUrl = iconCode ? `https://openweathermap.org/img/wn/${iconCode}.png` : null;

    return (
        <div className="weather-bar">
            {iconUrl && <img src={iconUrl} alt={description} className="weather-icon" />}
            <span className="location-name">Clima en **{name}**:</span>
            <span className="temp">
                {/* CRÍTICO: Usar el encadenamiento opcional y verificar el valor */}
                {main?.temp ? `${main.temp.toFixed(1)}°C` : 'N/A'}
            </span>
            <span className="details"> 
                / {description} / Humedad: {main?.humidity ? `${main.humidity}%` : 'N/A'}
            </span>
            
            <style jsx>{`
                .weather-bar {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: #ecf0f1;
                    padding: 10px 20px;
                    border-radius: 8px;
                    margin-bottom: 30px;
                    font-size: 1.1em;
                    color: #2c3e50;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                }
                .weather-bar.status {
                    background-color: #fcf8e3;
                    color: #8a6d3b;
                }
                .weather-icon {
                    width: 40px;
                    height: 40px;
                    margin-right: 10px;
                }
                .location-name {
                    font-weight: 500;
                    margin-right: 10px;
                }
                .temp {
                    font-weight: bold;
                    color: #e67e22;
                }
                .details {
                    color: #7f8c8d;
                    margin-left: 10px;
                }
            `}</style>
        </div>
    );
}

// --- Componente para la Tarjeta de Colmena ---
function HiveCard({ hive, latestData }) {
    // ... (El código de HiveCard sigue siendo el mismo que antes)
    const changeClass = latestData?.change > 0 
        ? 'gain' 
        : latestData?.change < 0 
        ? 'loss' 
        : 'neutral';
        
    const changeText = latestData?.change !== null && latestData?.change !== undefined
        ? `${latestData.change.toFixed(2)} kg`
        : 'Datos insuficientes';

    const latestWeight = latestData?.latest_weight !== null && latestData?.latest_weight !== undefined
        ? `${latestData.latest_weight.toFixed(2)} kg`
        : 'N/A';

    return (
        <div className="hive-card">
            <h3>{hive.name || `Colmena ID: ${hive.hive_unique_id}`}</h3>
            <p className="location">📍 {hive.location || 'Ubicación sin definir'}</p>
            
            <div className="data-row">
                <span className="label">Peso Actual:</span>
                <span className="value">{latestWeight}</span>
            </div>

            <div className="data-row">
                <span className="label">Cambio Diario (24h):</span>
                <span className={`value change ${changeClass}`}>
                    {changeText}
                </span>
            </div>
            
            <Link href={`/hive/${hive.hive_unique_id}`} className="view-button">
                Ver Historial &rarr;
            </Link>

            <style jsx>{`
                .hive-card {
                    background-color: #ffffff;
                    padding: 25px;
                    border-radius: 10px;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                    transition: transform 0.3s;
                    border-top: 5px solid #f39c12;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }
                .hive-card:hover {
                    transform: translateY(-5px);
                }
                h3 {
                    margin-top: 0;
                    color: #2c3e50;
                    font-size: 1.5em;
                    border-bottom: 1px dashed #eee;
                    padding-bottom: 10px;
                    margin-bottom: 15px;
                }
                .location {
                    color: #7f8c8d;
                    margin-bottom: 20px;
                }
                .data-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    font-size: 1.1em;
                }
                .label {
                    color: #34495e;
                    font-weight: 500;
                }
                .value {
                    font-weight: bold;
                }
                .change.gain {
                    color: #27ae60; 
                }
                .change.loss {
                    color: #e74c3c; 
                }
                .change.neutral {
                    color: #3498db;
                }
                .view-button {
                    display: block;
                    text-align: center;
                    margin-top: 20px;
                    padding: 10px;
                    background-color: #f39c12;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    transition: background-color 0.3s;
                }
                .view-button:hover {
                    background-color: #e67e22;
                }
            `}</style>
        </div>
    );
}

// --- Componente Principal ---
export default function Home() {
    const supabase = useSupabaseClient();
    const [hives, setHives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Nuevo estado para el clima
    const [weatherData, setWeatherData] = useState(null);

    // Efecto para obtener el clima
    useEffect(() => {
        const fetchWeatherData = async () => {
            try {
                // Llama a nuestra API de Next.js
                const res = await fetch('/api/weather');
                if (!res.ok) throw new Error('Error al conectar con el servidor del clima.');
                
                const data = await res.json();
                setWeatherData(data);

            } catch (e) {
                console.error("Fallo al obtener el clima:", e);
                // No establecemos error general, solo ignoramos si el clima falla
            }
        };

        fetchWeatherData();
        // Opcional: Recargar el clima cada hora
        const intervalId = setInterval(fetchWeatherData, 3600000); 

        return () => clearInterval(intervalId); // Limpiar en el desmontaje
    }, []);

    // Efecto para obtener las colmenas y sus datos de peso
    useEffect(() => {
        fetchHives();
    }, []);

    const fetchHives = async () => {
        setLoading(true);
        setError(null);
        try {
            // ... (Lógica para obtener colmenas y RPC de peso) ...
            const { data: hiveList, error: hiveError } = await supabase
                .from('hives')
                .select('hive_unique_id, name, location')
                .order('name', { ascending: true });

            if (hiveError) throw hiveError;

            const hivesWithData = await Promise.all(
                hiveList.map(async (hive) => {
                    const { data: rpcData, error: rpcError } = await supabase.rpc('get_daily_weight_change', { hive_id: hive.hive_unique_id });
                    
                    if (rpcError) {
                        return { ...hive, latestData: { change: null, latest_weight: null } };
                    }
                    return { ...hive, latestData: rpcData };
                })
            );

            setHives(hivesWithData);

        } catch (e) {
            console.error("Error al cargar colmenas:", e);
            setError("Fallo al cargar datos. Verifique la conexión o las políticas RLS.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="container">
            <Head>
                <title>Apiario Digital | Monitoreo</title>
            </Head>

            <header>
                <h1>Monitoreo de Colmenas</h1>
                <Link href="/login" className="login-link">
                    Admin Login
                </Link>
            </header>

            {/* BARRA DE CLIMA REINTRODUCIDA */}
            <WeatherBar weather={weatherData} />

            {loading && <p className="status-message">Cargando datos del apiario...</p>}
            {error && <p className="error-message">Error: {error}</p>}

            {!loading && hives.length === 0 && !error && (
                <p className="status-message">No hay colmenas registradas. Vaya a Admin Login para agregar una.</p>
            )}

            <div className="hive-grid">
                {hives.map((hive) => (
                    <HiveCard 
                        key={hive.hive_unique_id} 
                        hive={hive} 
                        latestData={hive.latestData} 
                    />
                ))}
            </div>

            <style jsx>{`
                .container {
                    padding: 40px 20px;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px; /* Reducido para dejar espacio a la barra de clima */
                    border-bottom: 2px solid #f39c12;
                    padding-bottom: 15px;
                }
                h1 {
                    color: #2c3e50;
                    font-size: 2.5em;
                }
                .login-link {
                    background-color: #3498db;
                    color: white;
                    padding: 10px 15px;
                    border-radius: 5px;
                    text-decoration: none;
                    transition: background-color 0.2s;
                }
                .login-link:hover {
                    background-color: #2980b9;
                }
                .status-message, .error-message {
                    text-align: center;
                    padding: 20px;
                    margin-top: 30px;
                    border-radius: 8px;
                    font-size: 1.1em;
                }
                .error-message {
                    background-color: #fdd;
                    color: #c0392b;
                }
                .hive-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 30px;
                }
            `}</style>
        </div>
    );
}