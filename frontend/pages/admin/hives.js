import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

// Importamos hooks de cliente
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';

// Importamos helpers de servidor para SSR
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

// Importaciones de Componentes
import HiveAdminCard from '../../components/Admin/HiveAdminCard.jsx'; 
import AdminLayout from '../../components/Layout/AdminLayout.jsx'; 


// ----------------------------------------------------------------------
// COMPONENTE PRINCIPAL (CLIENTE)
// ----------------------------------------------------------------------

export default function AdminHivesPage() {
    const supabase = useSupabaseClient();
    const router = useRouter();

    // El hook useUser ya tiene la sesión gracias a initialSession inyectada por SSR.
    const { user } = useUser() || {}; 

    if (user) {
        console.log("LOG: User ID Autenticado (CORRECTO):", user.id); 
    } else {
        console.log("LOG: User ID Autenticado (Transitorio): undefined"); 
    }

    if (user && user.id) {
        console.log("LOG: User ID Autenticado (FINAL):", user.id); 
    } else {
        console.log("LOG: User ID Autenticado (Esperando...):", user); 
    }

    // Estados
    const [hives, setHives] = useState([]);
    // 🚨 CORRECCIÓN CLAVE: Inicializamos loading en FALSE. Solo se activa al iniciar el fetch.
    const [loading, setLoading] = useState(false); 
    const [error, setError] = useState(null);

    // Usamos useCallback para estabilizar la función de fetch
    const fetchHives = useCallback(async () => {
        // En este punto, sabemos que 'user' existe gracias a getServerSideProps
        if (!user) return; 
        
        // 🚨 Se activa loading JUSTO antes de la llamada de red
        setLoading(true); 
        setError(null);
        console.log("LOG: 1. fetchHives INICIADO. Usuario ID:", user.id); 

        try {
            const { data, error: fetchError } = await supabase
                .from('hives')
                .select('*')
                .eq('user_id', user.id) 
                .order('created_at', { ascending: false }); 

            if (fetchError) {
                 console.error("LOG: ERROR en Supabase:", fetchError); 
                 throw fetchError;
            }
            
            setHives(data);
            console.log(`LOG: 2. Datos cargados: ${data.length}`);

        } catch (e) {
            console.error("LOG: 3. Error Capturado en fetchHives:", e); 
            setError(`Fallo al cargar datos. Revise la política RLS. (Error: ${e.message || 'Desconocido'}).`);
        } finally {
            // 🚨 Se desactiva loading SIEMPRE al final de la ejecución
            setLoading(false); 
            console.log("LOG: 4. fetchHives FINALIZADO.");
        }
    }, [supabase, user]); 

    // --- LÓGICA DE CARGA DE DATOS ---
    useEffect(() => {
        // 🚨 CORRECCIÓN CLAVE: Si hay un usuario, iniciamos el fetch de datos.
        // Esto elimina el chequeo complejo de isAuthLoading.
        if (user) {
            console.log("LOG: Usuario disponible. Iniciando fetchHives en useEffect.");
            fetchHives();
        }
    // Añadimos solo user y fetchHives como dependencia
    }, [user, fetchHives]); 

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
                /* Estilos ... */
                .status-message { text-align: center; padding: 20px; font-size: 1.2em; color: #2c3e50; }
                .error-message { text-align: center; padding: 20px; background-color: #fdd; color: #c0392b; border-radius: 8px; font-weight: bold; }
                .no-hives { border: 1px dashed #f39c12; background-color: #fff9e6; border-radius: 8px; }
                /* ... otros estilos */
            `}</style>
        </AdminLayout>
    );
}

// ----------------------------------------------------------------------
// SSR PARA PROTECCIÓN DE RUTA Y CARGA INICIAL DE SESIÓN (SERVIDOR)
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
        destination: '/login', // Asegúrate de que esta es la ruta de login
        permanent: false,
      },
    };
  }

  // 4. Si la sesión existe, pasa la sesión como initialSession
  return {
    props: {
      // CRUCIAL: Esto inicializa el SessionContextProvider en el cliente
      initialSession: session, 
    },
  };
};