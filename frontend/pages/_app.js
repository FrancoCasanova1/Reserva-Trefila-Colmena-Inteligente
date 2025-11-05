// /frontend/pages/login.js

import { Auth } from '@supabase/auth-ui-react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Login() {
    const supabase = useSupabaseClient();
    const router = useRouter();

    if (!supabase) {
        // Esto indica un fallo en la conexión del cliente
        return <p>Error: No se pudo inicializar el cliente de Supabase.</p>;
    }
    
    // Si la sesión es exitosa, redirigir al dashboard
    const handleLogin = (event) => {
        if (event.event === 'SIGNED_IN') {
            router.push('/admin/hives');
        }
    };

    return (
        <div className="login-container">
            <Head><title>Login</title></Head>
            <h1>Acceso de Administrador</h1>
            <Auth 
                supabaseClient={supabase} 
                appearance={{ theme: "minimal" }} 
                // CRÍTICO: Asegúrate de que solo permites 'email'
                providers={['email']} 
                // Añade la función para manejar la redirección
                onAuthStateChange={handleLogin}
            />
        </div>
    );
}

// Nota: Si usas getServerSideProps en otras páginas, asegúrate de que /login NO LO USE.
// La página de login debe ser estática o Client-Side Rendered (CSR).