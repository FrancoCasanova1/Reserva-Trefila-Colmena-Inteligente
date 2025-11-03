// /frontend/pages/api/weather.js

export default async function handler(req, res) {
  // Intentar obtener la clave de las variables de entorno de Render
  const apiKey = process.env.CLIMA_API_KEY; 
  const city = req.query.city || 'Campana,AR'; 

  // --- COMPROBACIÓN CRÍTICA ---
  if (!apiKey || apiKey === '78bb833c2b996c4c4d5918990f711c17') {
    // Si la clave es nula O si todavía es la clave de ejemplo que te di, devolvemos 500
    console.error("ERROR: CLIMA_API_KEY no se cargó o no se reemplazó.");
    // Devolvemos 500 y un mensaje útil para el log de Render
    return res.status(500).json({ error: 'Configuración fallida: CLIMA_API_KEY no encontrada o no válida en Render.' });
  }

  // Paso 1: Obtener Latitud y Longitud (Geocoding API)
  const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
  
  try {
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    if (geoData.length === 0) {
      return res.status(404).json({ error: 'Ubicación no encontrada.' });
    }

    const { lat, lon } = geoData[0];
    
    // Paso 2: Obtener Pronóstico de 5 días (One Call API)
    const weatherUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&units=metric&lang=es&appid=${apiKey}`;
    
    const weatherResponse = await fetch(weatherUrl);
    // ¡CRÍTICO! Revisar si la respuesta de OpenWeatherMap fue un error (ej. 401 por clave no activa)
    if (!weatherResponse.ok) {
        console.error("OpenWeatherMap API Response Error:", weatherResponse.status, await weatherResponse.text());
        return res.status(weatherResponse.status).json({ error: 'Fallo de la API de OpenWeatherMap.' });
    }
    
    const weatherData = await weatherResponse.json();
    res.status(200).json(weatherData);

  } catch (error) {
    console.error("Error general al obtener clima:", error);
    res.status(500).json({ error: 'Fallo al procesar la solicitud del clima (error de red o interno).' });
  }
}