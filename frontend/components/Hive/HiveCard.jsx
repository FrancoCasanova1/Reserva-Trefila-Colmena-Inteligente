// /frontend/components/Hive/HiveCard.js
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

// Colores basados en el estado
const STATUS_COLORS = {
  active: '#2ecc71', // Verde
  inactive: '#f39c12', // Naranja/Amarillo
  error: '#e74c3c', // Rojo
};

export default function HiveCard({ hiveId, hiveName, hiveLocation }) {
  const router = useRouter();
  
  // Simulación de estado para fines de diseño. En un proyecto real, esto vendría de una API.
  const [status, setStatus] = useState('active'); // Puede ser 'active', 'inactive', 'error'
  
  // En un proyecto real: Obtendrías el estado de la colmena (última hora de envío)

  // Función para manejar el clic y navegar a la página de detalle
  const handleCardClick = () => {
    // Usamos el ID técnico para la ruta
    router.push(`/hive/${hiveId}`);
  };

  // Prevenir que el componente se renderice si faltan propiedades críticas
  if (!hiveId || !hiveName) {
    console.error("HiveCard: Propiedades críticas (ID o Nombre) no definidas.");
    return null; 
  }

  const statusStyle = {
    backgroundColor: STATUS_COLORS[status] || STATUS_COLORS.inactive,
  };

  return (
    <div className="hive-card" onClick={handleCardClick}>
      <div className="header" style={statusStyle}>
        {hiveName}
      </div>
      
      <div className="content">
        <p className="id-text">ID Técnica: <span>{hiveId}</span></p>
        <p className="location-text">Ubicación: <span>{hiveLocation || 'Sin definir'}</span></p>
        
        <div className="status-indicator">
            <span className="status-label">Estado:</span> 
            <span className="status-badge" style={statusStyle}>
                {status === 'active' ? 'En Línea' : status === 'inactive' ? 'Inactivo' : 'Error'}
            </span>
        </div>
      </div>

      <style jsx>{`
        .hive-card {
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: pointer;
          background-color: #ffffff;
          display: flex;
          flex-direction: column;
        }
        .hive-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }
        .header {
          color: white;
          padding: 15px;
          font-size: 1.5em;
          font-weight: 700;
          text-align: center;
        }
        .content {
          padding: 20px;
          flex-grow: 1;
        }
        .id-text, .location-text {
            font-size: 0.9em;
            color: #555;
            margin-bottom: 10px;
        }
        .id-text span, .location-text span {
            font-weight: 400;
            color: #333;
            display: block;
            margin-top: 2px;
        }
        .status-indicator {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #eee;
        }
        .status-label {
            font-weight: 700;
            color: #333;
        }
        .status-badge {
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: 700;
        }
      `}</style>
    </div>
  );
}
