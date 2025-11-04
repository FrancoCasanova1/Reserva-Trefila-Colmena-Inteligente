import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';

// Importaciones corregidas y explícitas (asumiendo que los archivos existen)
import HiveAdminCard from '../../components/Admin/HiveAdminCard.jsx'; 
import AdminLayout from '../../components/Layout/AdminLayout.jsx'; 

export default function AdminHivesPage() {
    const supabase = useSupabaseClient();
    const router = useRouter();

    // 🚨 CORRECCIÓN CLAVE: Desestructuración Segura
    // Si useUser() devuelve null/undefined (como en el prerender), desestructura de un objeto vacío {}
    const { user, isLoading: isAuthLoading } = useUser() || {}; 

    // Estados
    const [hives, setHives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- LOGS DE DIAGNÓSTICO EN NAVEGADOR (CONSOLA) ---
    // Remueve estos logs una vez que la página funcione
    console.log("Estado de Autenticación (isAuthLoading):", isAuthLoading);
    console.log("Estado del Usuario (user):", user);
    console.log("Estado de Carga de Datos (loading):", loading);
    // ----------------------------------------------------

    // Usamos useCallback para estabilizar la función de fetch
    const fetchHives = useCallback(async () => {
        // Doble verificación en caso de que se llame antes de tiempo
        if (!user) {
            console.log("fetchHives abortado: Usuario no disponible.");
            return;
        }
        
        setLoading(true);
        setError(null);
        console.log("Iniciando fetchHives para el usuario:", user.id); 

        try {
            // Filtrar las colmenas solo para el usuario actual (usando RLS)
            const { data, error: fetchError } = await supabase
                .from('hives')
                .select('*')
                // 💡 Asume que tienes una política RLS que requiere esta igualdad
                .eq('user_id', user.id) 
                .order('created_at', { ascending: false }); 

            if (fetchError) {
                 throw fetchError;
            }
            
            setHives(data);
            console.log(`fetchHives completado. Colmenas cargadas: ${data.length}`);

        } catch (e) {
            console.error("Error Capturado en fetchHives:", e); 
            // Mensaje de error más detallado para el usuario final
            setError(`Fallo al cargar datos: ${e.message || "Error desconocido. Verifique RLS."}`);
        } finally {
            setLoading(false); 
        }
    }, [supabase, user]); 

    // --- PROTECCIÓN & REDIRECCIÓN ---
    useEffect(() => {
        // Si isAuthLoading es undefined (inicio) o true, esperar
        if (isAuthLoading === undefined || isAuthLoading) return;

        // Si la carga de Auth terminó y NO hay usuario
        if (!user) {
            console.log("Usuario NO ENCONTRADO. Redirigiendo a /login"); 
            router.push('/login');
        } else {
            // Si el usuario está presente, cargar las colmenas
            console.log("Usuario ENCONTRADO. Llamando a fetchHives."); 
            fetchHives();
        }
        
    }, [user, router, isAuthLoading, fetchHives]); 

    // --- RENDERIZADO CONDICIONAL (ESTADOS DE CARGA Y ERROR) ---
    
    // Si la autenticación o la carga de datos están en curso, mostrar el mensaje de carga
    if (isAuthLoading || loading) {
        return (
            <AdminLayout>
                <div className="status-message">
                    {/* Muestra un mensaje específico para saber dónde está esperando */}
                    {isAuthLoading ? 'Verificando sesión...' : 'Cargando colmenas...'}
                </div>
            </AdminLayout>
        );
    }
    
    // Si hay un error (después de que la carga terminó)
    if (error) {
        return (
            <AdminLayout>
                <div className="error-message">
                    Error al cargar: {error}
                    <p>Revise la consola del navegador para más detalles o verifique sus políticas RLS en Supabase.</p>
                </div>
            </AdminLayout>
        );
    }

    // Renderizado principal
    return (
        <AdminLayout>
            <Head>
                <title>Colmenas | Panel de Administración</title>
            </Head>

            <h1 className="page-title">Administración de Colmenas ({hives.length})</h1>
            
            <button className="add-button" onClick={() => router.push('/admin/hives/new')}>
                + Añadir Nueva Colmena
            </button>

            {hives.length === 0 ? (
                <p className="status-message no-hives">No se encontraron colmenas. ¡Añade una!</p>
            ) : (
                <div className="hives-grid">
                    {hives.map(hive => (
                        <HiveAdminCard 
                            key={hive.hive_unique_id}
                            hive={hive} 
                            // Pasamos fetchHives para refrescar la lista después de un borrado
                            onDeleteSuccess={fetchHives} 
                        />
                    ))}
                </div>
            )}
            <style jsx>{`
                .page-title {
                    color: #2c3e50;
                    border-bottom: 2px solid #f39c12;
                    padding-bottom: 15px;
                    margin-bottom: 30px;
                }
                .add-button {
                    background-color: #f39c12;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 1em;
                    margin-bottom: 30px;
                    transition: background-color 0.2s;
                }
                .add-button:hover {
                    background-color: #e67e22;
                }
                .status-message {
                    text-align: center;
                    padding: 20px;
                    color: #2c3e50;
                    font-size: 1.2em;
                }
                .error-message {
                    text-align: center;
                    padding: 20px;
                    background-color: #fdd;
                    color: #c0392b;
                    border-radius: 8px;
                    font-weight: bold;
                }
                .no-hives {
                    border: 1px dashed #f39c12;
                    background-color: #fff9e6;
                    border-radius: 8px;
                }
                .hives-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                }
            `}</style>
        </AdminLayout>
    );
}