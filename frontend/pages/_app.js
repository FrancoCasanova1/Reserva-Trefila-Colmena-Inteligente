// /frontend/pages/_app.js - Versión Corregida con createPagesBrowserClient

import { useState } from 'react';
// 🚨 CORRECCIÓN: Usar createPagesBrowserClient en lugar de createBrowserSupabaseClient
import { SessionContextProvider, createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'; 
import Head from 'next/head';

// Asegúrate de que los estilos globales se importen correctamente
import '../styles/globals.css'; 

function MyApp({ Component, pageProps }) {
    // 🚨 CORRECCIÓN: Inicializar el cliente usando createPagesBrowserClient
    const [supabaseClient] = useState(() => createPagesBrowserClient());

    return (
        // SessionContextProvider sigue siendo la pieza central para la sesión
        <SessionContextProvider
            supabaseClient={supabaseClient}
            initialSession={pageProps.initialSession}
        >
            <Head>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Component {...pageProps} />
        </SessionContextProvider>
    );
}

export default MyApp;