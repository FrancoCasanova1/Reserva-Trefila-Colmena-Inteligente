import { Auth } from '@supabase/auth-ui-react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import Head from 'next/head';

// Importa el tema si lo necesitas, o usa la configuración 'minimal'
import { ThemeSupa } from '@supabase/auth-ui-shared';

export default function Login() {
    const supabase = useSupabaseClient();
    const router = useRouter();

    if (!supabase) {
        // En caso de fallo de inicialización del cliente (por variables de entorno)
        return <div className="loading-error"><p>Error: No se pudo inicializar el cliente de Supabase. Verifique las variables de entorno.</p></div>;
    }

    // Función que se dispara cuando el estado de autenticación cambia
    const handleLogin = (event) => {
        // 🔑 CLAVE: Si el evento es 'SIGNED_IN', redirigir al dashboard
        if (event === 'SIGNED_IN') {
            router.push('/admin/hives');
        }
    };

    return (
        <div className="login-page-container">
            <Head><title>Iniciar Sesión | Colmena Inteligente</title></Head>

            <div className="login-box">
                <h1 className="login-title">Acceso de Administrador 🐝</h1>
                
                <Auth 
                    supabaseClient={supabase} 
                    // Apariencia: Usamos ThemeSupa por defecto, pero puedes cambiarlo a 'minimal'
                    appearance={{ theme: ThemeSupa }} 
                    // providers={['email']} // Si solo permites correo/contraseña
                    
                    // CRÍTICO: Definimos la URL de redirección post-login
                    // Aunque la función handleLogin lo gestiona, esta es una buena práctica:
                    redirectTo={process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000/admin/hives'}
                    
                    // 🚨 GESTIÓN DEL CAMBIO DE ESTADO
                    onAuthStateChange={handleLogin} 
                />
            </div>

            <style jsx>{`
                .login-page-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background-color: #f7f7f7;
                }
                .login-box {
                    max-width: 450px;
                    width: 100%;
                    padding: 40px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }
                .login-title {
                    text-align: center;
                    color: #f39c12;
                    margin-bottom: 25px;
                    font-size: 1.8em;
                }
                .loading-error {
                    text-align: center;
                    color: #c0392b;
                }
            `}</style>
        </div>
    );
}