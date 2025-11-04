// /frontend/pages/login.js

import { useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const supabase = useSupabaseClient();
  const user = useUser(); // Hook para verificar el estado de autenticación
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 1. Redirección si ya está autenticado
  if (user) {
    // Redirige al panel de administración
    router.push('/admin/hives');
    return null; 
  }

  // 2. Manejo del inicio de sesión
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Si no hay error, el hook 'useUser' se actualizará y el componente se redirigirá automáticamente.
      setMessage('Inicio de sesión exitoso. Redirigiendo al panel...');

    } catch (error) {
      // Manejo de errores
      if (error.message.includes('Invalid login credentials')) {
        setMessage('Error: Credenciales inválidas. Por favor, revisa tu correo y contraseña.');
      } else {
        setMessage(`Error al iniciar sesión: ${error.message || 'Error desconocido'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Panel de Administración - Iniciar Sesión</h2>
      
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="email"
          placeholder="Correo Electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Cargando...' : 'Entrar'}
        </button>
      </form>

      {/* Mensaje de estado */}
      {message && <p className={`message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</p>}
      
      <style jsx>{`
        .login-container {
          max-width: 400px;
          margin: 100px auto;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          background-color: #fff;
          text-align: center;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        }
        h2 {
          color: #2c3e50;
          margin-bottom: 30px;
        }
        .login-form input {
          width: 100%;
          padding: 12px;
          margin-bottom: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-sizing: border-box;
          font-size: 1em;
        }
        .login-form button {
          width: 100%;
          padding: 12px;
          background-color: #f39c12; /* Naranja/Miel */
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1.1em;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .login-form button:hover:not(:disabled) {
          background-color: #e67e22;
        }
        .login-form button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        .message {
          margin-top: 20px;
          padding: 10px;
          border-radius: 8px;
          font-size: 0.9em;
        }
        .error {
          background-color: #fdd;
          color: #c0392b;
          border: 1px solid #c0392b;
        }
        .success {
          background-color: #dfd;
          color: #27ae60;
        }
      `}</style>
    </div>
  );
}
