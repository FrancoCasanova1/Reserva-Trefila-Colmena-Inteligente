// /frontend/pages/admin/add-hive.js

import { useState, useEffect } from 'react';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function AddHivePage() {
    const user = useUser();
    const router = useRouter();
    const supabase = useSupabaseClient();

    const [loading, setLoading] = useState(true);
    const [hiveId, setHiveId] = useState('');
    const [hiveName, setHiveName] = useState('');
    const [hiveLocation, setHiveLocation] = useState('');
    const [message, setMessage] = useState(null);

    // 1. Protección de ruta: Si no hay usuario, redirige a login
    useEffect(() => {
        if (!user) {
            router.push('/login');
        } else {
            setLoading(false);
        }
    }, [user, router]);

    // 2. Manejo del envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // Limpieza básica del ID para asegurar compatibilidad con ESP32 (sin espacios)
        const sanitizedHiveId = hiveId.trim().toLowerCase().replace(/\s+/g, '_');
        
        if (!sanitizedHiveId) {
            setMessage({ type: 'error', text: 'El ID único es obligatorio.' });
            setLoading(false);
            return;
        }

        try {
            // Insertar la nueva colmena en la tabla 'hives'
            const { error } = await supabase
                .from('hives')
                .insert([
                    {
                        hive_unique_id: sanitizedHiveId,
                        name: hiveName.trim() || `Colmena ${sanitizedHiveId}`,
                        location: hiveLocation.trim(),
                        user_id: user.id, // Asigna el registro al usuario actual
                    }
                ]);

            if (error) {
                // Manejar error de ID duplicado
                if (error.code === '23505') { // Código de error de PostgreSQL para violación de clave única
                    throw new Error(`Ya existe una colmena con el ID: ${sanitizedHiveId}.`);
                }
                throw error;
            }

            setMessage({ type: 'success', text: `¡Colmena '${hiveName}' registrada exitosamente con ID: ${sanitizedHiveId}!` });
            
            // Limpiar formulario para el siguiente registro
            setHiveId('');
            setHiveName('');
            setHiveLocation('');

        } catch (e) {
            console.error('Error al registrar colmena:', e);
            setMessage({ type: 'error', text: e.message });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-container loading">
                <p>Cargando formulario...</p>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <header className="form-header">
                <Link href="/admin/hives" className="back-link">
                    &larr; Volver al Listado
                </Link>
                <h1>Registrar Nueva Colmena</h1>
            </header>

            <form onSubmit={handleSubmit} className="add-form">
                
                <label>
                    ID Único de la Colmena (Ej: colmena_alfa_001)
                    <input
                        type="text"
                        value={hiveId}
                        onChange={(e) => setHiveId(e.target.value)}
                        placeholder="Debe coincidir con HIVE_UNIQUE_ID del ESP32"
                        required
                        disabled={loading}
                    />
                </label>
                
                <label>
                    Nombre de la Colmena
                    <input
                        type="text"
                        value={hiveName}
                        onChange={(e) => setHiveName(e.target.value)}
                        placeholder="Colmena Alfa"
                        disabled={loading}
                    />
                </label>
                
                <label>
                    Ubicación / Apiario
                    <input
                        type="text"
                        value={hiveLocation}
                        onChange={(e) => setHiveLocation(e.target.value)}
                        placeholder="Apiario Sur, Lote 3"
                        disabled={loading}
                    />
                </label>

                <button type="submit" disabled={loading}>
                    {loading ? 'Registrando...' : 'Registrar Colmena'}
                </button>
            </form>

            {/* Mensaje de estado */}
            {message && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}
            
            <style jsx>{`
                .admin-container {
                    max-width: 600px;
                    margin: 40px auto;
                    padding: 30px;
                    background-color: #fff;
                    border-radius: 10px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }
                .form-header {
                    margin-bottom: 25px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #eee;
                }
                .back-link {
                    color: #3498db;
                    text-decoration: none;
                    margin-bottom: 15px;
                    display: inline-block;
                }
                h1 {
                    color: #2c3e50;
                    font-size: 1.8em;
                }
                .add-form label {
                    display: block;
                    margin-bottom: 15px;
                    font-weight: 600;
                    color: #555;
                }
                .add-form input {
                    width: 100%;
                    padding: 10px;
                    margin-top: 5px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    box-sizing: border-box;
                    font-size: 1em;
                }
                .add-form button {
                    width: 100%;
                    padding: 12px;
                    background-color: #f39c12; 
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1.1em;
                    cursor: pointer;
                    transition: background-color 0.3s;
                    margin-top: 20px;
                }
                .add-form button:hover:not(:disabled) {
                    background-color: #e67e22;
                }
                .message {
                    margin-top: 20px;
                    padding: 15px;
                    border-radius: 8px;
                    font-weight: 600;
                }
                .message.success {
                    background-color: #d4edda;
                    color: #155724;
                    border: 1px solid #c3e6cb;
                }
                .message.error {
                    background-color: #f8d7da;
                    color: #721c24;
                    border: 1px solid #f5c6cb;
                }
            `}</style>
        </div>
    );
}