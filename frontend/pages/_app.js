// /frontend/pages/_app.js (Versión Corregida)

import '../styles/globals.css';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { useState } from 'react';

function MyApp({ Component, pageProps }) {
  
  // 🚨 CORRECCIÓN CLAVE: Llama a la función sin argumentos.
  // La función lee las variables NEXT_PUBLIC_* automáticamente.
  const [supabaseClient] = useState(() => createPagesBrowserClient());

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <Component {...pageProps} />
    </SessionContextProvider>
  );
}

export default MyApp;