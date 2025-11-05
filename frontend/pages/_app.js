// /pages/_app.js

import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { useState } from 'react';

export default function MyApp({ Component, pageProps }) {
  // Asegúrate de que el cliente se inicialice correctamente aquí
  const [supabaseClient] = useState(() => 
    createBrowserSupabaseClient({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })
  );

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient} // Propiedad CORRECTA
      initialSession={pageProps.initialSession} // Propiedad CORRECTA
    >
      <Component {...pageProps} />
    </SessionContextProvider>
    // 🚨 Verifica que NO se pase 'onAuthStateChange' aquí
  );
}