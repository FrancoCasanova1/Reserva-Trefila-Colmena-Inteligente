// /frontend/pages/admin/hives.js

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
// Importamos useUser y useSupabaseClient
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';

// Importaciones corregidas y explícitas
import HiveAdminCard from '../../components/Admin/HiveAdminCard.jsx'; 
import AdminLayout from '../../components/Layout/AdminLayout.jsx'; 

export default function AdminHivesPage() {
    const supabase = useSupabaseClient();
    const router = useRouter();

    // 🚨 CORRECCIÓN CLAVE 1: Desestructuración Segura
    // Si useUser() devuelve null (durante el prerender), desestructura de un objeto vacío {}
    const { user, isLoading: isAuthLoading } = useUser() || {}; 

    // Estado local para los datos
    const [hives, setHives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 🚨 CORRECCIÓN CLAVE 2: Usar useCallback para estabilizar la función y evitar bucles
    const fetchHives = useCallback(async () => {
        // Solo intenta hacer fetch si user existe (lo que ya se verifica en useEffect)
        if (!user) return;
        
        setLoading(true);
        setError(null);

        try {
            // Filtrar las colmenas solo para el usuario actual (RLS)
            const { data, error } = await supabase
                .from('hives')
                .select('*')
                .eq('user_id', user.id) // Filtrar por el ID del usuario
                .order('created_at', { ascending: false }); 

            if (error) {
                 console.error("Error devuelto por Supabase:", error); 
                 throw error;
            }
            setHives(data);

        } catch (e) {
            console.error("Error Capturado en fetchHives:", e); 
            // Mensaje claro para ayudar a diagnosticar RLS
            setError("Fallo al cargar datos. Verifique sus políticas RLS o la conexión.");
        } finally {
            setLoading(false); 
        }
    }, [supabase, user]); // Dependencias: el cliente Supabase y el objeto user

    // --- PROTECCIÓN & FETCH LOGIC ---
    useEffect(() => {
        // 1. Si isAuthLoading es undefined (inicio) o true, esperar
        if (isAuthLoading === undefined || isAuthLoading) return;

        if (!user) {
            // 2. Si no hay usuario, redirigir al login
            router.push('/login');
        } else {
            // 3. Si el usuario está presente, cargar las colmenas
            fetchHives();
        }
    }, [user, router, isAuthLoading, fetchHives]); // Agregamos fetchHives a las dependencias

    // --- RENDERIZADO CONDICIONAL ---
    
    // 🚨 Priorizar el estado de autenticación y carga
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
                            hive={hive} 
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