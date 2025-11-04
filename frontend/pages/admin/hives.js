import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

// Importamos useUser, useSupabaseClient para el cliente
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';

// Importamos createPagesServerClient para getServerSideProps
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

// Importaciones de Componentes
import HiveAdminCard from '../../components/Admin/HiveAdminCard.jsx'; 
import AdminLayout from '../../components/Layout/AdminLayout.jsx'; 


// ----------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ----------------------------------------------------------------------

export default function AdminHivesPage() {
    const supabase = useSupabaseClient();
    const router = useRouter();

    // El hook useUser ahora funcionará inmediatamente gracias a initialSession inyectada por SSR
    // La desestructuración segura se mantiene como buena práctica.
    const { user, isLoading: isAuthLoading } = useUser() || {}; 

    // Estados
    const [hives, setHives] = useState([]);
    const [loading, setLoading] = useState(true); // Inicializado en true para el fetch de datos
    const [error, setError] = useState(null);

    // Usamos useCallback para estabilizar la función de fetch
    const fetchHives = useCallback(async () => {
        // En este punto, sabemos que 'user' existe gracias a getServerSideProps
        if (!user) return; 
        
        setLoading(true);
        setError(null);
        console.log("LOG: fetchHives INICIADO. Usuario ID:", user.id); 

        try {
            // Consulta de colmenas filtrada por el usuario
            const { data, error: fetchError } = await supabase
                .from('hives')
                .select('*')
                .eq('user_id', user.id) 
                .order('created_at', { ascending: false }); 

            if (fetchError) {
                 // Esto es CRÍTICO para diagnosticar RLS
                 console.error("Error devuelto por Supabase:", fetchError); 
                 throw fetchError;
            }
            
            setHives(data);

        } catch (e) {
            console.error("Error Capturado en fetchHives:", e); 
            // Mensaje claro si hay un fallo (e.g., por RLS)
            setError(`Fallo al cargar datos. Verifique sus políticas RLS (Error: ${e.code || 'Desconocido'}).`);
        } finally {
            setLoading(false); 
        }
    }, [supabase, user]); 

    // --- LÓGICA DE CARGA DE DATOS ---
    useEffect(() => {
        // Ejecuta el fetch una vez que la sesión de Auth haya sido confirmada (no es undefined o null)
        // Ya no necesitamos la redirección aquí, porque getServerSideProps la maneja.
        if (user && !isAuthLoading) {
            fetchHives();
        }
    }, [user, isAuthLoading, fetchHives]); 

    // --- RENDERIZADO CONDICIONAL ---
    
    if (loading) {
        return (
            <AdminLayout>
                <div className="status-message">Cargando colmenas...</div>
            </AdminLayout>
        );
    }
    
    if (error) {
        return (
            <AdminLayout>
                <div className="error-message">
                    Error al cargar: {error}
                    <p>Si ve este error, **revise la política RLS SELECT** en la tabla 'hives' de Supabase.</p>
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
                            onDeleteSuccess={fetchHives} 
                        />
                    ))}
                </div>
            )}
            <style jsx>{`
                /* Estilos (debes tenerlos definidos) */
                .page-title { /* ... */ }
                /* etc. */
            `}</style>
        </AdminLayout>
    );
}

// ----------------------------------------------------------------------
// SSR PARA PROTECCIÓN DE RUTA
// ----------------------------------------------------------------------

/**
 * Función que se ejecuta en el servidor para verificar la sesión antes de renderizar la página.
 */
export const getServerSideProps = async (ctx) => {
  // 1. Crea el cliente Supabase del lado del servidor
  const supabase = createPagesServerClient(ctx);
  
  // 2. Obtiene la sesión del usuario
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 3. Redirige si no hay sesión
  if (!session) {
    return {
      redirect: {
        destination: '/login', // 🚨 Asegúrate de que esta es la ruta correcta
        permanent: false,
      },
    };
  }

  // 4. Si la sesión existe, pasa la sesión como initialSession
  return {
    props: {
      // CRUCIAL: Esto inicializa el SessionContextProvider en el cliente
      initialSession: session, 
      // Puedes pasar otros datos si es necesario
    },
  };
};