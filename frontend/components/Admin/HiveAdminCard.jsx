// /frontend/components/Admin/HiveAdminCard.jsx

import { useRouter } from 'next/router';

export default function HiveAdminCard({ hive, onDeleteSuccess }) {
  const router = useRouter();

  // Función de ejemplo para la navegación a la edición
  const handleEdit = () => {
    // Asume una ruta de edición: /admin/hives/[id]/edit
    router.push(`/admin/hives/${hive.hive_unique_id}/edit`);
  };

  // Función de ejemplo para el borrado (requeriría lógica de Supabase)
  const handleDelete = () => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la colmena ${hive.name}?`)) {
        // En un proyecto real, aquí iría la llamada a Supabase para DELETE
        console.log(`Eliminando colmena con ID: ${hive.hive_unique_id}`);

        // Si el borrado fue exitoso, llamas a onDeleteSuccess
        // onDeleteSuccess(); 
    }
  };

  return (
    <div className="hive-admin-card">
      <h3 className="hive-name">{hive.name}</h3>
      <p className="hive-id">ID: {hive.hive_unique_id}</p>
      <p className="hive-location">Ubicación: {hive.location || 'N/A'}</p>
      <div className="action-buttons">
        <button className="edit-btn" onClick={handleEdit}>Editar</button>
        <button className="delete-btn" onClick={handleDelete}>Eliminar</button>
      </div>
      <style jsx>{`
        .hive-admin-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
          background-color: white;
          transition: box-shadow 0.2s;
        }
        .hive-name {
          color: #f39c12;
          margin-top: 0;
          margin-bottom: 10px;
          font-size: 1.4em;
        }
        .hive-id, .hive-location {
          color: #555;
          font-size: 0.9em;
          margin-bottom: 5px;
        }
        .action-buttons {
          margin-top: 15px;
          display: flex;
          gap: 10px;
        }
        .edit-btn, .delete-btn {
          padding: 8px 15px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 0.9em;
          transition: background-color 0.2s;
        }
        .edit-btn {
          background-color: #2980b9; /* Azul */
          color: white;
        }
        .edit-btn:hover {
          background-color: #3498db;
        }
        .delete-btn {
          background-color: #e74c3c; /* Rojo */
          color: white;
        }
        .delete-btn:hover {
          background-color: #c0392b;
        }
      `}</style>
    </div>
  );
}