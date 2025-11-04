// /frontend/components/Layout/AdminLayout.jsx

import Head from 'next/head';

export default function AdminLayout({ children, title = 'Panel de Administración' }) {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className="admin-page-wrapper">
        <header className="admin-header">
          {/* Aquí iría la barra de navegación o sidebar del admin */}
          <nav>
            <a href="/admin/hives">Colmenas</a> | 
            <a href="/">Dashboard</a>
          </nav>
        </header>
        <main className="admin-main-content">
          {children}
        </main>
        <footer className="admin-footer">
          <p>© {new Date().getFullYear()} Colmena Inteligente Admin</p>
        </footer>
      </div>
      <style jsx global>{`
        .admin-page-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .admin-header {
          background-color: #34495e; /* Azul oscuro */
          color: white;
          padding: 15px 30px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .admin-main-content {
          flex-grow: 1;
          padding: 30px;
          background-color: #ecf0f1; /* Gris claro */
        }
        .admin-footer {
          text-align: center;
          padding: 10px;
          background-color: #bdc3c7; /* Gris medio */
          color: #2c3e50;
          font-size: 0.8em;
        }
        /* Estilos básicos para el nav */
        .admin-header nav a {
          color: white;
          margin-right: 15px;
          text-decoration: none;
        }
      `}</style>
    </>
  );
}