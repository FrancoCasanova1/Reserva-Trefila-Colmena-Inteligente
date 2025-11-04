// /frontend/pages/admin/edit/[id].js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import Head from 'next/head';

export default function EditHivePage() {
    const router = useRouter();
    const { id: hive_unique_id } = router.query;
    const supabase = useSupabaseClient();

    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Cargar datos iniciales de la colmena
    useEffect(() => {
        if (!hive_unique_id) return;

        async function loadHiveData() {
            setInitialLoading(true);
            try {
                const { data, error } = await supabase
                    .from('hives')
                    .select('name, location')
                    .eq('hive_unique_id', hive_unique_id)
                    .single();
                
                if (error) throw error;
                
                if (data) {
                    setName(data.name || '');
                    setLocation(data.location || '');
                } else {
                    setError('Colmena no encontrada.');
                }
            } catch (e) {
                console.error("Error al cargar datos de la colmena:", e);
                setError('Fallo al cargar datos: ' + e.message);
            } finally {
                setInitialLoading(false);
            }
        }

        loadHiveData();
    }, [hive_unique_id, supabase]);

    // 2. Manejar el envío del formulario de actualización
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase
                .from('hives')
                .update({ name, location, updated_at: new Date().toISOString() })
                .eq('hive_unique_id', hive_unique_id);

            if (error) throw error;

            alert(`Colmena "${name}" (${hive_unique_id}) actualizada con éxito!`);
            router.push('/admin'); // Volver al panel principal

        } catch (e) {
            console.error("Error al actualizar:", e);
            setError(`Fallo al actualizar: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!router.isReady || initialLoading) {
        return <div className="loading-state">Cargando datos de la colmena...</div>;
    }
    
    return (
        <div className="container">
            <Head><title>Editar Colmena | Admin</title></Head>
            
            <button onClick={() => router.push('/admin')} className="back-button">&larr; Volver al Panel</button>
            <h2>Editar Colmena: {hive_unique_id}</h2>
            {error && <p className="error-message">{error}</p>}

            <form onSubmit={handleSubmit} className="edit-form">
                <label>
                    Nombre de la Colmena:
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Ubicación (Ej: Chacra Norte, Lote 5):
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </label>
                
                <button type="submit" disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </form>

            <style jsx>{`
                .container {
                    padding: 40px;
                    max-width: 600px;
                    margin: 0 auto;
                }
                .back-button {
                    background: #555;
                    color: white;
                    border: none;
                    padding: 10px 15px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-bottom: 30px;
                }
                h2 {
                    border-bottom: 2px solid #f39c12;
                    padding-bottom: 10px;
                    margin-bottom: 30px;
                }
                .edit-form label {
                    display: block;
                    margin-bottom: 20px;
                    font-weight: bold;
                }
                .edit-form input {
                    width: 100%;
                    padding: 10px;
                    margin-top: 5px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    box-sizing: border-box;
                }
                .edit-form button {
                    background-color: #f39c12;
                    color: white;
                    padding: 12px 20px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 1.1em;
                    width: 100%;
                    margin-top: 20px;
                }
                .error-message {
                    color: #e74c3c;
                    background: #fdd;
                    padding: 15px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                }
                .loading-state {
                    text-align: center;
                    padding: 50px;
                }
            `}</style>
        </div>
    );
}