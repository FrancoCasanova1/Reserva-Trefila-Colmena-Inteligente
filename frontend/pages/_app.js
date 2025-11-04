import { useState } from 'react';
import { SessionContextProvider, createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'; 
import Head from 'next/head';

// Asegúrate de que los estilos globales se importen correctamente
import '../styles/globals.css'; 

function MyApp({ Component, pageProps }) {
    
    // Inicializar el cliente, pasando la sesión inicial a la función de creación del cliente
    // Esto es una práctica más robusta para asegurar que el cliente sepa si está
    // en una sesión activa, lo cual puede prevenir errores de contexto durante el prerendering.
    const [supabaseClient] = useState(() => 
        createPagesBrowserClient({
            initialSession: pageProps.initialSession,
        })
    );

    return (
        <SessionContextProvider
            supabaseClient={supabaseClient}
            initialSession={pageProps.initialSession} // Se sigue pasando para el contexto de React
        >
            <Head>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Component {...pageProps} />
        </SessionContextProvider>
    );
}

export default MyApp;