// /frontend/pages/admin/add-hive.js

import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';

import AdminLayout from '../../components/Layout/AdminLayout';

export default function AddHivePage() {
    const supabase = useSupabaseClient();
    const router = useRouter();
    
    // Obtener el usuario autenticado (requerido para la inserción)
    const { user } = useUser() || {}; 

    // Estados del formulario
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Si el usuario no está disponible, redirigimos. (Idealmente manejado por getServerSideProps)
    if (!user) {
        router.push('/login');
        return null; 
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!name.trim() || !location.trim()) {
            setError("El nombre y la ubicación son obligatorios.");
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            const newHive = {
                // 🔑 CLAVE: Asignamos el ID del usuario actual.
                // Esto garantiza que la colmena pertenezca al usuario que la crea.
                user_id: user.id, 
                name: name.trim(),
                location: location.trim(),
                // Asegúrate de incluir aquí cualquier otro campo obligatorio de tu tabla 'hives'
            };

            const { data, error } = await supabase
                .from('hives')
                .insert([newHive])
                .select(); // Usamos select() para confirmar la fila insertada

            if (error) {
                console.error("Error de inserción de Supabase:", error);
                throw error;
            }

            console.log("Colmena creada con éxito:", data);
            setSuccess(true);
            
            // Redirigir de vuelta a la lista de colmenas para que el usuario la vea
            router.push('/admin/hives?created=true');

        } catch (e) {
            console.error("Error al guardar la colmena:", e);
            setError(`Fallo al crear la colmena: ${e.message || 'Error desconocido.'} Revise sus políticas RLS INSERT.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AdminLayout>
            <Head>
                <title>Añadir Colmena | Admin</title>
            </Head>

            <h1 className="page-title">🐝 Añadir Nueva Colmena</h1>
            
            <form onSubmit={handleSubmit} className="hive-form">
                
                <div className="form-group">
                    <label htmlFor="name">Nombre de la Colmena:</label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej: Colmena Jardín Sur"
                        disabled={isSubmitting}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="location">Ubicación / Descripción:</label>
                    <input
                        id="location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Ej: Patio trasero, cerca del roble"
                        disabled={isSubmitting}
                        required
                    />
                </div>

                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">¡Colmena creada con éxito!</p>}

                <button type="submit" disabled={isSubmitting} className="submit-button">
                    {isSubmitting ? 'Guardando...' : 'Crear Colmena'}
                </button>
            </form>

            {/* Estilos JSX (abreviados para concisión) */}
            <style jsx>{`
                .page-title { color: #2c3e50; border-bottom: 2px solid #f39c12; padding-bottom: 10px; margin-bottom: 20px; }
                .hive-form { max-width: 500px; margin-top: 30px; padding: 20px; border: 1px solid #ccc; border-radius: 8px; }
                .form-group { margin-bottom: 15px; }
                label { display: block; margin-bottom: 5px; font-weight: bold; color: #333; }
                input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
                .submit-button { background-color: #f39c12; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 1em; margin-top: 20px; transition: background-color 0.2s; }
                .submit-button:hover:not(:disabled) { background-color: #e67e22; }
                .submit-button:disabled { background-color: #ccc; cursor: not-allowed; }
                .error-message { color: #c0392b; background-color: #fdd; padding: 10px; border-radius: 4px; }
                .success-message { color: #27ae60; background-color: #d8f5e7; padding: 10px; border-radius: 4px; }
            `}</style>
        </AdminLayout>
    );
}