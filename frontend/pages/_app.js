// /frontend/pages/_app.js
import '../styles/globals.css';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { useState } from 'react';

function MyApp({ Component, pageProps }) {
  // 1. Inicializa el cliente Supabase
  const [supabaseClient] = useState(() =>
    createPagesBrowserClient({
      // Las variables de entorno son inyectadas por Next.js
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })
  );

  return (
    // 2. Envuelve la aplicación con el contexto de sesión
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <Component {...pageProps} />
    </SessionContextProvider>
  );
}

export default MyApp;