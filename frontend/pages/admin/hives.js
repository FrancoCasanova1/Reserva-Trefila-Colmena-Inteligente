import Head from 'next/head';
import { useRouter } from 'next/router';
import { useUser } from '@supabase/auth-helpers-react';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

import AdminLayout from '../../components/Layout/AdminLayout';

export default function AdminHivesPage({ hivesData, error }) {
    // 🚨 El user ya existe gracias a SSR, pero lo mantenemos por seguridad
    const { user, isLoading: isAuthLoading } = useUser() || {};
    const router = useRouter();

    // Filtro de carga (solo se activa si la sesión aún se está inyectando)
    if (isAuthLoading) {
        return <AdminLayout><p>Verificando sesión...</p></AdminLayout>;
    }
    
    // Si hay un error de fetching (ej: fallo de RLS o de DB)
    if (error) {
        return <AdminLayout><p className="error-message">Error al cargar colmenas: {error}</p></AdminLayout>;
    }

    // Redirección si el usuario desaparece después de la carga inicial
    if (!user) {
        router.push('/login');
        return null; 
    }

    return (
        <AdminLayout>
            <Head><title>Mis Colmenas | Admin</title></Head>

            <div className="hive-header">
                <h1 className="page-title">Mis Colmenas 🐝</h1>
                <button 
                    onClick={() => router.push('/admin/add-hive')} 
                    className="add-hive-button"
                >
                    + Añadir Nueva Colmena
                </button>
            </div>

            {hivesData.length === 0 ? (
                <p>Aún no tienes colmenas. ¡Crea la primera!</p>
            ) : (
                <div className="hive-list">
                    {hivesData.map(hive => (
                        <div key={hive.id} className="hive-card">
                            <h2>{hive.name}</h2>
                            <p>Ubicación: {hive.location}</p>
                            {/* Mostrar datos sensibles como user_id solo por debugging */}
                            {/* <small>ID: {hive.user_id}</small> */} 
                        </div>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}

// ----------------------------------------------------------------------
// SSR: Protección y Fetching
// ----------------------------------------------------------------------

export const getServerSideProps = async (ctx) => {
    const supabase = createPagesServerClient(ctx);
    
    // 1. Verificar Sesión
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return {
            redirect: {
                destination: '/login', // Redirección inmediata del lado del servidor
                permanent: false,
            },
        };
    }

    // 2. Fetch de Datos (RLS se aplica automáticamente aquí)
    const { data: hivesData, error } = await supabase
        .from('hives')
        .select('id, name, location, user_id'); // Seleccionar campos necesarios
        
    // 3. Devolver Props
    return {
        props: {
            initialSession: session, // CRUCIAL para cargar la sesión en el cliente
            hivesData: hivesData || [],
            error: error ? error.message : null,
        },
    };
};