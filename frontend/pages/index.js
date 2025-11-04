// /frontend/pages/index.js

import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import Link from 'next/link';
import Head from 'next/head';
// Importar el componente WeatherBar desde su ubicación en components/Layout
import WeatherBar from '../components/Layout/WeatherBar'; 

// --- Componente para la Tarjeta de Colmena ---
function HiveCard({ hive, latestData }) {
    // Lógica de cambio de peso
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

    useEffect(() => {
        fetchHives();
    }, []);

    const fetchHives = async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Obtener la lista de colmenas
            const { data: hiveList, error: hiveError } = await supabase
                .from('hives')
                .select('hive_unique_id, name, location')
                .order('name', { ascending: true });

            if (hiveError) throw hiveError;

            // 2. Obtener datos analíticos (peso) para cada colmena usando la RPC
            const hivesWithData = await Promise.all(
                hiveList.map(async (hive) => {
                    // Llamar a la función SQL de Supabase (get_daily_weight_change)
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

            {/* Componente de Clima */}
            <WeatherBar />

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
                    margin-bottom: 30px; 
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