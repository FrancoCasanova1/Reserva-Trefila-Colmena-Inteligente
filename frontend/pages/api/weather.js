// /frontend/pages/api/weather.js

export default async function handler(req, res) {
  // La clave se lee de la variable de entorno de Render
  const apiKey = process.env.CLIMA_API_KEY; 
  // Usaremos Campana, Argentina como ubicación por defecto
  const city = req.query.city || 'Campana,AR'; 

  if (!apiKey) {
    return res.status(500).json({ error: 'CLIMA_API_KEY no configurada en Render.' });
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
    // Usamos 'exclude=current,minutely,hourly,alerts' para optimizar la respuesta
    const weatherUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&units=metric&lang=es&appid=${apiKey}`;
    
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    res.status(200).json(weatherData);

  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({ error: 'Fallo al procesar la solicitud del clima.' });
  }
}