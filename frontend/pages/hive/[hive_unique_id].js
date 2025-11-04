// /frontend/pages/hive/[hive_unique_id].js

import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function HiveDataPage() {
    const router = useRouter();
    const supabase = useSupabaseClient();
    // Obtener el ID único de la URL
    const { hive_unique_id } = router.query; 

    const [loading, setLoading] = useState(true);
    const [hiveData, setHiveData] = useState([]);
    const [hiveInfo, setHiveInfo] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!hive_unique_id) return;

        async function fetchData() {
            setLoading(true);
            setError(null);

            try {
                // 1. Obtener la información de la colmena (nombre, ubicación)
                const { data: infoData, error: infoError } = await supabase
                    .from('hives')
                    .select('name, location')
                    .eq('hive_unique_id', hive_unique_id)
                    .single();

                if (infoError) throw infoError;
                setHiveInfo(infoData);


                // 2. Obtener los datos históricos de los sensores
                const { data: sensorData, error: sensorError } = await supabase
                    .from('sensor_data')
                    .select('*')
                    .eq('hive_unique_id', hive_unique_id)
                    .order('created_at', { ascending: false }) // Mostrar los más recientes primero
                    .limit(100); // Limitar a las últimas 100 lecturas para no sobrecargar

                if (sensorError) throw sensorError;
                setHiveData(sensorData);

            } catch (e) {
                console.error("Error al cargar datos históricos:", e);
                setError(e.message || "Fallo al cargar los datos históricos.");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [hive_unique_id, supabase]); 


    if (loading) {
        return <div className="data-container loading">Cargando datos históricos de la colmena...</div>;
    }

    if (error) {
        return <div className="data-container error">Error: {error}</div>;
    }
    
    // Si no hay información de colmena (ID no existe)
    if (!hiveInfo) {
        return <div className="data-container error">Colmena no encontrada: {hive_unique_id}</div>;
    }

    // El mensaje de error original está aquí
    if (hiveData.length === 0) {
        return (
             <div className="data-container">
                <Link href="/admin/hives" className="back-link">
                    &larr; Volver al Panel
                </Link>
                <h1>{hiveInfo.name || 'Colmena sin nombre'}</h1>
                <p className="no-data-message">
                   **No hay datos históricos** registrados en la tabla `sensor_data` para esta colmena ({hive_unique_id}).
                   Verifique si el ESP32 está encendido y enviando datos (código 201).
                </p>
            </div>
        );
    }

    // ---------------------------------------------
    // RENDERIZADO DE LA TABLA DE DATOS HISTÓRICOS
    // ---------------------------------------------
    return (
        <div className="data-container">
            <Link href="/admin/hives" className="back-link">
                &larr; Volver al Panel
            </Link>
            
            <h1>Datos Históricos: {hiveInfo.name} ({hive_unique_id})</h1>
            <p className="location-info">Ubicación: {hiveInfo.location || 'Sin definir'}</p>

            <div className="data-table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Fecha y Hora</th>
                            <th>Temp (°C)</th>
                            <th>Hum (%)</th>
                            <th>Peso (kg)</th>
                            <th>Sonido (RAW)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {hiveData.map((data) => (
                            <tr key={data.id}>
                                <td>{new Date(data.created_at).toLocaleString('es-AR')}</td>
                                <td>{data.temperature.toFixed(1)}</td>
                                <td>{data.humidity.toFixed(0)}</td>
                                <td>{data.weight.toFixed(2)}</td>
                                <td>{data.sound_level}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
                .data-container {
                    max-width: 1200px;
                    margin: 40px auto;
                    padding: 30px;
                    background-color: #f9f9f9;
                    border-radius: 10px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }
                h1 {
                    color: #2c3e50;
                    margin-top: 0;
                    font-size: 2em;
                }
                .location-info {
                    color: #7f8c8d;
                    margin-bottom: 25px;
                }
                .back-link {
                    color: #3498db;
                    text-decoration: none;
                    margin-bottom: 15px;
                    display: inline-block;
                }
                .data-table-wrapper {
                    overflow-x: auto; /* Permite desplazamiento en móviles */
                }
                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                    background-color: white;
                }
                .data-table th, .data-table td {
                    padding: 12px 15px;
                    text-align: left;
                    border-bottom: 1px solid #eee;
                }
                .data-table th {
                    background-color: #ecf0f1;
                    color: #2c3e50;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                .data-table tr:hover {
                    background-color: #f4f6f8;
                }
                .no-data-message {
                    text-align: center;
                    padding: 40px;
                    background-color: #fff;
                    border-radius: 8px;
                    color: #e74c3c;
                    border: 1px dashed #e74c3c;
                }
            `}</style>
        </div>
    );
}