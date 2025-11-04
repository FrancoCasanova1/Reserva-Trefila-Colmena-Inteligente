// /frontend/pages/admin/hives.js - Versión Corregida con useCallback

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
// Importamos useUser y useSupabaseClient
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import HiveAdminCard from '@/components/Admin/HiveAdminCard.jsx'; 
import AdminLayout from '@/components/Layout/AdminLayout.jsx';

export default function AdminHivesPage() {
    const supabase = useSupabaseClient();
    const router = useRouter();
    // Usamos 'isLoading' para un manejo de autenticación más robusto
    const { user, isLoading: isAuthLoading } = useUser();

    // Estado local para los datos
    const [hives, setHives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 🚨 CORRECCIÓN CLAVE 🚨
    // Usamos useCallback para memoizar (estabilizar) la función fetchHives.
    const fetchHives = useCallback(async () => {
        setLoading(true);
        setError(null);
        // console.log("Iniciando fetchHives..."); // Puedes dejar los logs si lo deseas

        try {
            // Asumimos que la tabla 'hives' tiene una columna 'user_id' para RLS
            const { data, error } = await supabase
                .from('hives')
                .select('*')
                .eq('user_id', user.id) // Filtramos por el usuario actual
                .order('created_at', { ascending: false }); 

            if (error) {
                 console.error("Error devuelto por Supabase:", error); 
                 throw error;
            }
            setHives(data);
            
        } catch (e) {
            console.error("Error Capturado en fetchHives:", e); 
            setError("Fallo al cargar datos. Verifique sus políticas RLS o la conexión.");
        } finally {
            // console.log("fetchHives finalizado. Seteando loading a false.");
            setLoading(false); 
        }
    }, [supabase, user]); // Dependencias: el cliente Supabase y el objeto user

    // --- PROTECCIÓN & FETCH LOGIC ---
    useEffect(() => {
        // 1. Esperar a que el estado de autenticación se resuelva
        if (isAuthLoading || user === undefined) return;

        if (!user) {
            // 2. Si no hay usuario, redirigir
            router.push('/login');
        } else {
            // 3. Si hay usuario, llamar a la función de fetch estable
            fetchHives();
        }
    }, [user, router, isAuthLoading, fetchHives]); // Agregamos fetchHives a las dependencias

    if (isAuthLoading || loading) {
        return (
            <AdminLayout>
                <div className="status-message">
                    {isAuthLoading ? 'Verificando sesión...' : 'Cargando colmenas...'}
                </div>
            </AdminLayout>
        );
    }
    
    // Si hay un error y no estamos cargando
    if (error) {
        return (
            <AdminLayout>
                <div className="error-message">Error: {error}</div>
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
                            hive={hive} // Pasamos el objeto hive completo
                            onDeleteSuccess={fetchHives} // Para recargar la lista después de borrar
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