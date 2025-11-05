import { useState, useEffect } from 'react'; 
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'; // Para SSR

import AdminLayout from '../../components/Layout/AdminLayout';

export default function AddHivePage() {
    const supabase = useSupabaseClient();
    const router = useRouter();
    
    const { user, isLoading: isAuthLoading } = useUser() || {}; 

    // Estados del formulario
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // 🔑 LÓGICA DE REDIRECCIÓN DE FALLBACK (CLIENTE): 
    // Captura el caso de que la sesión expire después de la carga inicial.
    useEffect(() => {
        if (!isAuthLoading && !user) {
            router.push('/login'); 
        }
    }, [isAuthLoading, user, router]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!name.trim() || !location.trim()) {
            setError("El nombre y la ubicación son obligatorios.");
            return;
        }

        // Antes de enviar, verificamos el user (aunque SSR lo garantiza)
        if (!user || !user.id) {
            setError("Error: Usuario no autenticado para la inserción.");
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            const newHive = {
                // CLAVE: Asignar el ID del usuario actual
                user_id: user.id, 
                name: name.trim(),
                location: location.trim(),
            };

            const { data, error } = await supabase
                .from('hives')
                .insert([newHive])
                .select(); 

            if (error) {
                console.error("Error de inserción de Supabase:", error);
                throw error;
            }

            setSuccess(true);
            
            // Redirigir a la lista con un indicador de éxito
            router.push('/admin/hives?created=true');

        } catch (e) {
            console.error("Error al guardar la colmena:", e);
            setError(`Fallo al crear la colmena: ${e.message || 'Error desconocido.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 🚨 Manejo del estado de carga inicial
    if (isAuthLoading) {
        return (
            <AdminLayout>
                <div className="status-message">Verificando sesión...</div>
            </AdminLayout>
        );
    }
    
    // Filtro de respaldo para usuario nulo (el useEffect lo maneja, pero detenemos el render)
    if (!user) {
        return null;
    }
    
    // Renderizado del formulario (el user está garantizado)
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
                {/* ... (Resto del formulario y estilos JSX) ... */}
            </form>
            {/* ... (Estilos JSX) ... */}
        </AdminLayout>
    );
}

// ----------------------------------------------------------------------
// SSR: Protección de Ruta
// ----------------------------------------------------------------------

export const getServerSideProps = async (ctx) => {
    const supabase = createPagesServerClient(ctx);
    
    // 1. Verificar Sesión
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return {
            redirect: {
                destination: '/login', // Redirección del lado del servidor si no hay sesión
                permanent: false,
            },
        };
    }

    // 2. Devolver Props
    return {
        props: {
            initialSession: session, // CRUCIAL para cargar la sesión en el cliente
        },
    };
};