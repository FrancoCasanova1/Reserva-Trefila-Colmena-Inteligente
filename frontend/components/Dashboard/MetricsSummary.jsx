// /frontend/components/Dashboard/MetricsSummary.jsx

import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

// --- Función Auxiliar para formateo ---
const formatValue = (value, unit, decimals = 1) => {
    if (value === null || value === undefined) return 'N/A';
    return `${value.toFixed(decimals)} ${unit}`;
};

// --- Componente de Resumen de Métricas ---
export default function MetricsSummary() {
    const supabase = useSupabaseClient();
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!supabase) return;

        const fetchMetrics = async () => {
            setLoading(true);
            setError(null);
            try {
                // Llamada a la función PostgreSQL que devuelve una tabla
                const { data, error: rpcError } = await supabase.rpc('get_apiary_summary_metrics');

                if (rpcError) throw rpcError;

                // La función RPC con RETURNS TABLE retorna un array con un único objeto
                setMetrics(data ? data[0] : null); 
            } catch (e) {
                console.error("Error al cargar métricas del apiario:", e);
                setError("Fallo al cargar el resumen del apiario.");
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, [supabase]);

    if (loading) return <p className="summary-status">Cargando métricas del apiario...</p>;
    if (error) return <p className="summary-error">Error al cargar métricas: {error}</p>;
    if (!metrics) return <p className="summary-status">No hay suficientes datos para generar el resumen.</p>;

    const weightChangeClass = metrics.total_net_weight_change_7d > 0 ? 'gain' : metrics.total_net_weight_change_7d < 0 ? 'loss' : 'neutral';
    
    return (
        <div className="metrics-summary-container">
            <h2>Resumen Analítico del Apiario</h2>
            <div className="metrics-grid">
                
                <MetricCard 
                    title="Total de Colmenas" 
                    value={metrics.total_hive_count} 
                    unit="colmenas" 
                    type="count"
                />

                <MetricCard 
                    title="Ganancia Neta (7 días)" 
                    value={metrics.total_net_weight_change_7d} 
                    unit="kg" 
                    type={weightChangeClass}
                    decimals={2}
                />
                
                <MetricCard 
                    title="Temp. Media Reciente" 
                    value={metrics.avg_temp_apiary} 
                    unit="°C" 
                    type="temp"
                />
                
                <MetricCard 
                    title="Humedad Media Reciente" 
                    value={metrics.avg_humidity_apiary} 
                    unit="%" 
                    type="humidity"
                />
            </div>

            <style jsx>{`
                .metrics-summary-container {
                    margin: 40px 0;
                    padding: 20px;
                    background-color: #f8f9fa;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                }
                h2 {
                    color: #2c3e50;
                    border-left: 4px solid #f39c12;
                    padding-left: 15px;
                    margin-bottom: 25px;
                }
                .metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                }
            `}</style>
        </div>
    );
}

// --- Componente Auxiliar para la Tarjeta de Métrica ---
function MetricCard({ title, value, unit, type, decimals = 1 }) {
    const formattedValue = formatValue(value, unit, decimals);
    
    return (
        <div className={`metric-card ${type}`}>
            <p className="metric-title">{title}</p>
            <p className="metric-value">{formattedValue}</p>
            
            <style jsx>{`
                .metric-card {
                    padding: 20px;
                    border-radius: 8px;
                    text-align: center;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                    color: white;
                }
                .metric-card.count {
                    background-color: #3498db; /* Azul */
                }
                .metric-card.gain {
                    background-color: #2ecc71; /* Verde - Ganancia */
                }
                .metric-card.loss {
                    background-color: #e74c3c; /* Rojo - Pérdida */
                }
                .metric-card.neutral {
                    background-color: #f39c12; /* Naranja - Neutro */
                }
                .metric-card.temp {
                    background-color: #d35400; /* Naranja Oscuro */
                }
                .metric-card.humidity {
                    background-color: #2980b9; /* Azul medio */
                }
                .metric-title {
                    font-size: 0.9em;
                    margin: 0 0 5px 0;
                    opacity: 0.8;
                }
                .metric-value {
                    font-size: 2em;
                    font-weight: 700;
                    margin: 0;
                }
            `}</style>
        </div>
    );
}