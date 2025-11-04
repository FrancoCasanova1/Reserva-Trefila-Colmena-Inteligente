// /frontend/pages/api/alert.js

/**
 * Este endpoint recibe los datos de alerta enviados por el trigger de Supabase.
 * En un entorno real, esta función manejaría el envío de notificaciones (email, SMS).
 */
export default async function handler(req, res) {
    // Solo permitir el método POST, ya que la base de datos es la que "envía" la alerta.
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido. Solo se acepta POST.' });
    }

    try {
        const alertData = req.body;

        // 🚨 1. VALIDACIÓN BÁSICA DE DATOS
        if (!alertData || !alertData.hive_unique_id || !alertData.alert_type) {
            console.warn('Alerta recibida sin datos esenciales:', alertData);
            return res.status(400).json({ error: 'Faltan datos esenciales de la alerta.' });
        }

        console.log(`\n--- ALERTA CRÍTICA RECIBIDA para ${alertData.hive_unique_id} ---`);
        console.log(`Tipo: ${alertData.alert_type}`);
        console.log(`Mensaje: ${alertData.message}`);
        console.log(`Valor: ${alertData.current_value}`);
        console.log(`Umbral: ${alertData.threshold_value}`);
        console.log('------------------------------------------------------\n');

        // 🚨 2. LÓGICA DE NOTIFICACIÓN REAL
        // Aquí es donde se integraría un servicio de email (SendGrid, Postmark) o un servicio de mensajería (Twilio, Telegram).
        
        // Ejemplo de envío de email (requiere integración real)
        /*
        await sendEmail({
            to: 'apicultor@dominio.com',
            subject: `ALERTA DE COLMENA: ${alertData.alert_type}`,
            body: alertData.message,
        });
        */

        // Por ahora, solo confirmamos la recepción.
        res.status(200).json({ success: true, message: 'Alerta recibida y procesada (notificación simulada).' });

    } catch (error) {
        console.error('Error al procesar la alerta:', error);
        res.status(500).json({ error: 'Fallo interno al procesar la alerta.' });
    }
}