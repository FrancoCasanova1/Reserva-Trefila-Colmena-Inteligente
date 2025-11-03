import React, { useState, useEffect } from 'react';

const API_ENDPOINT = '/api/weather'; 
const CITY_NAME = 'Campana,AR'; 

const WeatherBar = () => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para mapear la descripción del clima a un emoji
  const getWeatherEmoji = (main) => {
    if (main.includes('Sun') || main.includes('Clear')) return '☀️';
    if (main.includes('Cloud') || main.includes('Clouds')) return '☁️';
    if (main.includes('Rain') || main.includes('Drizzle')) return '🌧️';
    if (main.includes('Thunderstorm')) return '⛈️';
    return '🌡️'; // Icono por defecto
  };

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(`${API_ENDPOINT}?city=${CITY_NAME}`);
        if (!response.ok) {
            throw new Error('No se pudo cargar el clima');
        }
        const data = await response.json();
        // Tomamos los próximos 5 días, saltando el día actual (índice 0)
        setForecast(data.daily.slice(1, 6)); 
      } catch (error) {
        console.error("Error al obtener el clima:", error);
        setForecast([]); // Poner un array vacío para detener el loading
      } finally {
        setLoading(false);
      }
    };
    
    fetchWeather();
  }, []);

  if (loading) return <div className="weather-bar">Cargando pronóstico...</div>;
  if (!forecast || forecast.length === 0) return null;

  return (
    <div className="weather-bar">
      <h4>Pronóstico para {CITY_NAME}</h4>
      <div className="forecast-grid">
        {forecast.map((day, index) => (
          <div key={index} className="day-item">
            <span className="day-name">{new Date(day.dt * 1000).toLocaleDateString('es-AR', { weekday: 'short' })}</span>
            <span className="temp-max">{Math.round(day.temp.max)}°C</span>
            <span className="icon">{getWeatherEmoji(day.weather[0].main)}</span>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .weather-bar {
          background-color: #f0f0f0;
          padding: 10px 20px;
          border-bottom: 2px solid #ddd;
          text-align: center;
        }
        .forecast-grid {
          display: flex;
          flex-wrap: wrap; /* Permite envolver si la pantalla es pequeña */
          justify-content: space-around;
          margin-top: 10px;
        }
        .day-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 5px;
          font-size: 0.9em;
        }
        .temp-max {
          font-weight: bold;
          color: #e59400; /* Color miel/oro */
        }
        .icon {
            font-size: 1.5em;
        }
      `}</style>
    </div>
  );
};

export default WeatherBar;