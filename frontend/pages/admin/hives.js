// /frontend/pages/admin/hives.js

import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';

// Componente para manejar el cierre de sesión
function LogoutButton({ supabase }) {
  const router = useRouter();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Redirigir al inicio después de cerrar sesión
    router.push('/');
  };
  return (
    <button onClick={handleLogout} className="logout-button">
      Cerrar Sesión
    </button>
  );
}

// -----------------------------------------------------

export default function AdminHivesPage() {
  const user = useUser();
  const router = useRouter();
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [hives, setHives] = useState([]);
  const [error, setError] = useState(null);

  // 1. Efecto para la protección de ruta y la carga de datos
  useEffect(() => {
    // Si el usuario no está logueado, redirige a login
    if (!user) {
      setLoading(true); // Mantener cargando hasta que la redirección ocurra
      router.push('/login');
      return; 
    }

    // El usuario está logueado, procedemos a cargar los datos
    fetchAdminHives();
  }, [user, router, supabase]); 

  // 2. Función para cargar las colmenas (similar a index.js, pero para admin)
  const fetchAdminHives = async () => {
    setLoading(true);
    try {
      // Nota: Aquí se usa 'supabase' del cliente autenticado. 
      // Las políticas RLS deben permitir 'SELECT' a los usuarios 'authenticated'.
      const { data, error } = await supabase
        .from('hives')
        .select('hive_unique_id, name, location, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setHives(data);

    } catch (e) {
      console.error("Error al cargar colmenas de administración:", e);
      setError("Fallo al cargar la lista de colmenas. Verifique permisos RLS.");
    } finally {
      setLoading(false);
    }
  };


  // 3. Renderizado condicional
  if (loading) {
    return (
        <div className="admin-container loading">
            <p>Cargando panel de administración...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="admin-container error">
            <h3>Error</h3>
            <p>{error}</p>
            <p>Por favor, verifique la consola para más detalles del error.</p>
            <LogoutButton supabase={supabase} />
        </div>
    );
  }

  // Si no hay usuario, el efecto redirige, por lo que este código solo se ejecuta si user existe.
  return (
    <div className="admin-container">
      <div className="header-admin">
        <h1>Panel de Administración</h1>
        <LogoutButton supabase={supabase} />
      </div>

      <div className="controls">
        <Link href="/admin/add-hive" className="add-button">
            ➕ Agregar Nueva Colmena
        </Link>
      </div>

      <p className="total-count">Total de Colmenas Registradas: **{hives.length}**</p>

      {hives.length === 0 ? (
        <p className="no-hives-message">No hay colmenas registradas aún. ¡Añade la primera!</p>
      ) : (
        <div className="hive-list">
          {hives.map((hive) => (
            <div key={hive.hive_unique_id} className="hive-item">
              <span className="hive-name-id">**{hive.name}** ({hive.hive_unique_id})</span>
              <span className="hive-location">{hive.location || 'Ubicación sin definir'}</span>
              <Link href={`/hive/${hive.hive_unique_id}`} className="view-button">
                Ver Datos
              </Link>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .admin-container {
          max-width: 900px;
          margin: 40px auto;
          padding: 30px;
          background-color: #f9f9f9;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header-admin {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 2px solid #ddd;
        }
        h1 {
          color: #2c3e50;
          font-size: 2em;
        }
        .logout-button {
          padding: 8px 15px;
          background-color: #e74c3c;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .logout-button:hover {
          background-color: #c0392b;
        }
        .controls {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 20px;
        }
        .add-button {
            background-color: #27ae60;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: 600;
            transition: background-color 0.2s;
        }
        .add-button:hover {
            background-color: #2ecc71;
        }
        .total-count {
            font-size: 1.1em;
            margin-bottom: 20px;
            color: #34495e;
        }
        .hive-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .hive-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: white;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #eee;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }
        .hive-name-id {
            font-weight: 700;
            color: #f39c12;
            flex-basis: 40%;
        }
        .hive-location {
            color: #555;
            flex-basis: 30%;
        }
        .view-button {
            background-color: #3498db;
            color: white;
            padding: 8px 12px;
            border-radius: 5px;
            text-decoration: none;
            transition: background-color 0.2s;
        }
        .view-button:hover {
            background-color: #2980b9;
        }
        .no-hives-message {
            text-align: center;
            padding: 40px;
            background-color: #fff;
            border-radius: 8px;
            color: #7f8c8d;
            border: 1px dashed #ccc;
        }
      `}</style>
    </div>
  );
}