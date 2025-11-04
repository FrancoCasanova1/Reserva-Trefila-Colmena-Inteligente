// /frontend/pages/admin/hives.js - VISTA DE GESTIÓN COMPLETA

import { useState, useEffect } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
// Después (usando alias):
import AddHiveForm from '../../components/admin/AddHiveForm';

export default function AdminHivesPage() {
    const supabase = useSupabaseClient();
    const user = useUser();
    const router = useRouter();

    const [hives, setHives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    // --- PROTECCIÓN DE RUTA ---
    useEffect(() => {
        // Si no hay usuario, redirigir al login
        if (!user && loading === false) {
            router.push('/login');
        }
        // Cuando el usuario está presente, cargar las colmenas
        if (user) {
            fetchHives();
        }
    }, [user, loading, router]);
    // -------------------------

    // --- FUNCIÓN DE CARGA ---
    const fetchHives = async () => {
        setLoading(true);
        setError(null);
        try {
            // Se asume RLS para que solo el usuario autenticado vea sus colmenas
            const { data, error } = await supabase
                .from('hives')
                .select('*')
                .order('created_at', { ascending: false }); 

            if (error) throw error;
            setHives(data);
        } catch (e) {
            console.error("Error al cargar colmenas:", e);
            setError("Fallo al cargar datos. Verifique la conexión o sus políticas RLS.");
        } finally {
            setLoading(false);
        }
    };
    // -------------------------

    // --- MANEJO DE ELIMINACIÓN ---
    const handleDelete = async (hiveId, hiveName) => {
        if (!confirm(`¿Estás seguro de que quieres eliminar la colmena "${hiveName}" (ID: ${hiveId})? Esta acción es irreversible y eliminará todos sus datos históricos.`)) {
            return;
        }

        setLoading(true);
        setStatusMessage('');

        try {
            const { error } = await supabase
                .from('hives')
                .delete()
                .eq('hive_unique_id', hiveId);

            if (error) throw error;

            // Actualizar el estado para reflejar la eliminación
            setHives(hives.filter(hive => hive.hive_unique_id !== hiveId));
            setStatusMessage(`Colmena "${hiveName}" eliminada con éxito.`);
        } catch (e) {
            console.error('Error al eliminar:', e);
            setStatusMessage(`Error al eliminar la colmena: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };
    // -------------------------

    // Si está cargando o no hay usuario, muestra un mensaje
    if (loading || !user) {
        return (
            <div className="admin-container loading">
                <p>{user ? 'Cargando colmenas...' : 'Redirigiendo al login...'}</p>
            </div>
        );
    }

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/'); // Redirigir a la página principal tras el logout
    };

    return (
        <div className="admin-container">
            <Head>
                <title>Panel de Administración | Colmenas</title>
            </Head>

            <header>
                <h1>🐝 Gestión de Colmenas</h1>
                <div className="header-actions">
                    <button onClick={() => setIsAdding(true)} className="add-button">
                        + Añadir Nueva Colmena
                    </button>
                    <button onClick={handleLogout} className="logout-button">
                        Cerrar Sesión
                    </button>
                </div>
            </header>

            <Link href="/" className="home-link">
                &larr; Ver Dashboard Público
            </Link>

            {statusMessage && (
                <p className={`status-message ${statusMessage.includes('Error') ? 'error' : 'success'}`}>
                    {statusMessage}
                </p>
            )}

            {error && <p className="error-message">Error: {error}</p>}
            
            {/* Modal de Añadir Colmena */}
            {isAdding && (
                <AddHiveForm 
                    onClose={() => setIsAdding(false)} 
                    onSuccess={() => {
                        setIsAdding(false);
                        fetchHives(); // Recargar la lista después de añadir
                        setStatusMessage('Colmena añadida con éxito. Actualizando lista...');
                    }}
                />
            )}

            <h2>Colmenas Registradas ({hives.length})</h2>

            <div className="hive-list">
                {hives.length === 0 ? (
                    <p className="status-message">No hay colmenas registradas. ¡Añade una para empezar!</p>
                ) : (
                    hives.map((hive) => (
                        <div key={hive.hive_unique_id} className="hive-item">
                            <div className="hive-details">
                                <span className="hive-name">{hive.name || 'Sin Nombre'}</span>
                                <span className="hive-location">📍 {hive.location || 'Ubicación Desconocida'}</span>
                                <span className="hive-id">ID Único: {hive.hive_unique_id}</span>
                            </div>
                            <div className="hive-actions">
                                {/* Botón de EDICIÓN (dirige a la nueva página dinámica) */}
                                <Link href={`/admin/edit-hive/${hive.hive_unique_id}`} className="action-button edit-button">
                                    Editar
                                </Link>
                                
                                {/* Botón de ELIMINACIÓN */}
                                <button 
                                    onClick={() => handleDelete(hive.hive_unique_id, hive.name)} 
                                    className="action-button delete-button"
                                    disabled={loading}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style jsx>{`
                .admin-container {
                    max-width: 900px;
                    margin: 50px auto;
                    padding: 30px;
                    background-color: #fff;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                }
                header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    border-bottom: 2px solid #f39c12;
                    padding-bottom: 15px;
                }
                h1 {
                    font-size: 2em;
                    color: #2c3e50;
                    margin: 0;
                }
                .header-actions {
                    display: flex;
                    gap: 10px;
                }
                .add-button, .logout-button {
                    padding: 10px 15px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: background-color 0.2s;
                    border: none;
                }
                .add-button {
                    background-color: #2ecc71;
                    color: white;
                }
                .add-button:hover {
                    background-color: #27ae60;
                }
                .logout-button {
                    background-color: #e74c3c;
                    color: white;
                }
                .logout-button:hover {
                    background-color: #c0392b;
                }
                .home-link {
                    display: inline-block;
                    margin-bottom: 20px;
                    color: #3498db;
                    font-weight: 500;
                }
                h2 {
                    border-left: 5px solid #f39c12;
                    padding-left: 15px;
                    margin-top: 40px;
                    margin-bottom: 20px;
                    color: #2c3e50;
                }
                .hive-list {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                .hive-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 20px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    background-color: #fafafa;
                }
                .hive-details {
                    display: flex;
                    flex-direction: column;
                }
                .hive-name {
                    font-size: 1.2em;
                    font-weight: bold;
                    color: #34495e;
                }
                .hive-location, .hive-id {
                    font-size: 0.9em;
                    color: #7f8c8d;
                    margin-top: 5px;
                }
                .hive-actions {
                    display: flex;
                    gap: 10px;
                }
                .action-button {
                    padding: 8px 15px;
                    border-radius: 5px;
                    font-size: 0.9em;
                    text-decoration: none;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    border: none;
                }
                .edit-button {
                    background-color: #3498db;
                    color: white;
                }
                .edit-button:hover {
                    background-color: #2980b9;
                }
                .delete-button {
                    background-color: #e74c3c;
                    color: white;
                }
                .delete-button:hover:not(:disabled) {
                    background-color: #c0392b;
                }
                .delete-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .status-message {
                    margin-top: 20px;
                    padding: 10px;
                    border-radius: 8px;
                    font-size: 0.9em;
                    text-align: center;
                }
                .status-message.error {
                    background-color: #fdd;
                    color: #c0392b;
                }
                .status-message.success {
                    background-color: #dfd;
                    color: #27ae60;
                }
            `}</style>
        </div>
    );
}