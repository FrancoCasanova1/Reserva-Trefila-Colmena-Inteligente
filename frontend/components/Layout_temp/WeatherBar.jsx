// /frontend/components/Layout/WeatherBar.js

import { useState, useEffect } from 'react';
import Image from 'next/image';

const iconSize = 40; // Tamaño fijo para los íconos

export default function WeatherBar() {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchWeather() {
            setLoading(true);
            setError(null);
            
            // Llama a la ruta API de Next.js
            const url = '/api/weather?city=Campana,AR'; 

            try {
                const response = await fetch(url);

                if (!response.ok) {
                    // Si el backend devuelve un 500 o 400, lee el mensaje de error
                    const errorBody = await response.json().catch(() => ({ error: 'Fallo de conexión o respuesta no JSON.' }));
                    throw new Error(errorBody.error || `Error HTTP: ${response.status}`);
                }

                const data = await response.json();

                // 🚨 VERIFICACIÓN DE DATOS CLAVE PARA EVITAR EL ERROR DE 'SLICE' 🚨
                if (data && Array.isArray(data.forecast)) {
                    // Si los datos son válidos, los establecemos
                    setWeather({
                        city: data.city,
                        // Aplicamos .slice() con seguridad, tomando los primeros 5 días
                        forecast: data.forecast.slice(0, 5) 
                    });
                } else {
                    // Si la API devuelve un JSON pero los datos de pronóstico no están
                    throw new Error("Respuesta de API de clima inválida: falta el pronóstico.");
                }

            } catch (e) {
                console.error("Error al obtener el clima:", e);
                setError(`Error al obtener el clima: ${e.message}`);
                setWeather(null);
            } finally {
                setLoading(false);
            }
        }

        fetchWeather();
    }, []);

    if (loading) return <div className="weather-bar loading">Cargando pronóstico del clima...</div>;
    if (error) return <div className="weather-bar error">{error}</div>;
    if (!weather || !weather.forecast) return null; // No renderizar si no hay datos

    return (
        <div className="weather-bar">
            <h3 className="city-title">Pronóstico para {weather.city} ({weather.country})</h3>
            <div className="forecast-grid">
                {weather.forecast.map((day, index) => (
                    <div key={day.date} className="day-card">
                        <p className="day-name">{index === 0 ? 'Hoy' : new Date(day.date).toLocaleDateString('es-AR', { weekday: 'short' })}</p>
                        
                        {/* Se usa el componente Image de Next.js con el host configurado */}
                        {day.icon && (
                            <Image 
                                src={day.icon} 
                                alt={day.condition} 
                                width={iconSize} 
                                height={iconSize}
                            />
                        )}
                        <p className="temp-range">
                            <span className="max-temp">{day.temp_max.toFixed(0)}°C</span> / <span className="min-temp">{day.temp_min.toFixed(0)}°C</span>
                        </p>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .weather-bar {
                    background-color: #eaf1f7;
                    padding: 15px 25px;
                    border-radius: 12px;
                    margin-bottom: 30px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
                }
                .weather-bar.loading {
                    text-align: center;
                    color: #555;
                }
                .weather-bar.error {
                    background-color: #fdd;
                    color: #c0392b;
                    border: 1px solid #c0392b;
                    text-align: center;
                }
                .city-title {
                    font-size: 1.2em;
                    color: #2c3e50;
                    margin-top: 0;
                    margin-bottom: 15px;
                    text-align: center;
                }
                .forecast-grid {
                    display: flex;
                    justify-content: space-around;
                    gap: 10px;
                }
                .day-card {
                    text-align: center;
                    padding: 8px 0;
                    flex-grow: 1;
                    min-width: 80px;
                }
                .day-name {
                    font-weight: bold;
                    color: #34495e;
                    text-transform: capitalize;
                    margin-bottom: 5px;
                }
                .temp-range {
                    font-size: 0.9em;
                    margin-top: 5px;
                }
                .max-temp {
                    font-weight: bold;
                    color: #e74c3c;
                }
                .min-temp {
                    color: #7f8c8d;
                }
            `}</style>
        </div>
    );
}