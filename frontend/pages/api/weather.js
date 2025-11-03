// /frontend/pages/api/weather.js

export default async function handler(req, res) {
    // La clave ahora se usa para WeatherAPI.com
    const API_KEY = process.env.CLIMA_API_KEY; 
    
    // Usaremos la ciudad de Campana y pediremos 7 días de pronóstico.
    const city = req.query.city || 'Campana, Buenos Aires, AR'; 
    const days = 7; 

    if (!API_KEY) {
        console.error("ERROR: CLIMA_API_KEY no se cargó o no se reemplazó.");
        // Devolver un error 500 para indicar que el backend falló.
        return res.status(500).json({ error: 'La clave API del clima no está configurada en el servidor.' });
    }

    // Endpoint de WeatherAPI para el pronóstico
    const apiUrl = `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=${days}&lang=es`;

    try {
        const apiResponse = await fetch(apiUrl);

        if (!apiResponse.ok) {
            // Si WeatherAPI devuelve un error (ej. clave inválida, ciudad no encontrada)
            const errorData = await apiResponse.json();
            console.error('Error de WeatherAPI:', errorData);
            return res.status(apiResponse.status).json({ error: 'Fallo al obtener datos del clima: ' + errorData.error.message });
        }

        const data = await apiResponse.json();

        // Mapear los datos de WeatherAPI al formato simple que espera tu frontend
        const mappedForecast = data.forecast.forecastday.map(day => ({
            date: day.date,
            condition: day.day.condition.text,
            icon: `https:${day.day.condition.icon}`, // WeatherAPI requiere HTTPS:
            temp_max: day.day.maxtemp_c,
            temp_min: day.day.mintemp_c,
        }));

        res.status(200).json({
            city: data.location.name,
            country: data.location.country,
            forecast: mappedForecast,
        });

    } catch (error) {
        console.error('Error interno al procesar la solicitud del clima:', error);
        res.status(500).json({ error: 'Error interno del servidor al procesar la API.' });
    }
}