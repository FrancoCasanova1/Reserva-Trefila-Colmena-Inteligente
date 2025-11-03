import React from 'react';
// Si usas Next.js, usa 'next/link'. Si usas React Router, usa 'react-router-dom'.
import Link from 'next/link'; 
import styles from './HiveCard.module.css'; // Usaremos un archivo CSS para el hexágono

// Componente que muestra una colmena en la página de inicio
const HiveCard = ({ hiveData }) => {
  // Desestructuramos los datos del último registro
  const { 
    hive_unique_id, 
    temperature, 
    humidity, 
    weight, 
    sound_level, 
    created_at 
  } = hiveData;

  // Asumimos un nombre más amigable para la interfaz, ej. desde una tabla 'hives'
  const hiveName = hiveData.hives ? hiveData.hives.name : `Colmena ${hive_unique_id.slice(-3)}`;

  // Formateo simple de la fecha de la última lectura
  const lastUpdate = new Date(created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  return (
    // El Link envuelve la tarjeta para navegar al dashboard detallado
    <Link href={`/hive/${hive_unique_id}`} passHref>
      <div className={styles.hiveCard}>
        
        {/* Nombre y Última Actualización */}
        <h3 className={styles.hiveName}>{hive.hive_name}</h3>
        <p className={styles.lastUpdate}>Última lectura: {lastUpdate}</p>

        {/* Contenedor de Símbolos y Valores */}
        <div className={styles.dataGrid}>
          
          {/* Temperatura */}
          <div className={styles.dataItem}>
            <span className={styles.icon} role="img" aria-label="Temperatura">🌡️</span>
            <span className={styles.value}>{temperature.toFixed(1)} °C</span>
          </div>

          {/* Humedad */}
          <div className={styles.dataItem}>
            <span className={styles.icon} role="img" aria-label="Humedad">💧</span>
            <span className={styles.value}>{humidity.toFixed(0)} %</span>
          </div>

          {/* Peso */}
          <div className={styles.dataItem}>
            <span className={styles.icon} role="img" aria-label="Peso">⚖️</span>
            <span className={styles.value}>{weight.toFixed(2)} kg</span>
          </div>

          {/* Sonido */}
          <div className={styles.dataItem}>
            <span className={styles.icon} role="img" aria-label="Sonido">🔊</span>
            <span className={styles.value}>{sound_level}</span>
          </div>
          
        </div>

        <span className={styles.detailsButton}>Ver Dashboard &raquo;</span>

      </div>
    </Link>
  );
};

export default HiveCard;