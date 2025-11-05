import { Auth } from '@supabase/auth-ui-react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import Head from 'next/head';

// Importa el tema
import { ThemeSupa } from '@supabase/auth-ui-shared';

export default function Login() {
    const supabase = useSupabaseClient();
    const router = useRouter();

    if (!supabase) {
        return <div className="loading-error"><p>Error: No se pudo inicializar el cliente de Supabase. Verifique las variables de entorno.</p></div>;
    }

    // 🔑 CLAVE DE LA CORRECCIÓN: Usar la firma correcta (event, session) y verificar el evento
    const handleAuthStateChange = (event, session) => {
        // En este punto, 'event' es la cadena de texto ('SIGNED_IN', 'SIGNED_OUT', etc.)
        if (event === 'SIGNED_IN') {
            // console.log("Usuario autenticado. Redirigiendo a /admin/hives"); // Puedes dejar esto para debugging
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
                    appearance={{ theme: ThemeSupa }} 
                    providers={['email']} 
                    
                    // 🚨 CORRECCIÓN IMPLEMENTADA AQUÍ
                    onAuthStateChange={handleAuthStateChange} 
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