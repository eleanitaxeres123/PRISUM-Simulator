import { useCallback } from 'react';

// Función auxiliar para convertir datos a CSV
const convertToCSV = (data) => {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => row[header]).join(','))
  ].join('\n');
  
  return csvContent;
};

/**
 * Hook personalizado para manejar la propagación SIS (Susceptible-Infected-Susceptible)
 * en redes del mundo real.
 * @param {Object} params - Parámetros del hook
 * @param {Array} params.realWorldGraphData - Datos del grafo del mundo real
 * @param {Function} params.setRwSISPropagationStatus - Función para actualizar el estado de propagación
 * @param {Function} params.setRwSISBeta - Función para actualizar beta
 * @param {Function} params.setRwSISGamma - Función para actualizar gamma
 * @param {Function} params.setSelectedUser - Función para actualizar el usuario seleccionado
 * @param {Function} params.setShowRwSISPropagationResult - Función para mostrar/ocultar el resultado
 * @param {Function} params.setRwSISPropagationLog - Función para actualizar el log de propagación
 * @param {Function} params.setRwSISHighlightedLinks - Función para actualizar los enlaces destacados
 * @param {Function} params.setHighlightId - Función para actualizar el ID destacado
 * @returns {Function} Función para iniciar la propagación SIS
 */
export const useRWSISPropagation = ({
  realWorldGraphData,
  setRwSISPropagationStatus,
  setRwSISBeta,
  setRwSISGamma,
  setSelectedUser,
  setShowRwSISPropagationResult,
  setRwSISPropagationLog,
  setRwSISHighlightedLinks,
  setHighlightId,
}) => {
  /**
   * Función principal para manejar la propagación SIS
   * @param {Object} params - Parámetros de propagación
   * @param {number} params.beta - Tasa de infección
   * @param {number} params.gamma - Tasa de recuperación
   * @param {string} params.selectedUser - Usuario inicial infectado
   */
  const handleRwSISPropagation = useCallback(async ({ beta, gamma, k, policy, selectedUser, propagationName }) => {
    
    // Validaciones iniciales
    if (!realWorldGraphData.nodes.length) {
      setRwSISPropagationStatus('Por favor, cargue una red HR primero.');
      return;
    }

    if (!selectedUser) {
      setRwSISPropagationStatus('Por favor, seleccione un nodo inicial.');
      return;
    }

    // Configuración inicial
    setRwSISPropagationStatus('Iniciando propagación SIS en red HR…');
    setRwSISBeta(beta);
    setRwSISGamma(gamma);
    setSelectedUser(selectedUser);
    setShowRwSISPropagationResult(true);

    try {
      // Preparar datos para enviar al backend
      const nodes = [...realWorldGraphData.nodes];
      const links = [...realWorldGraphData.links];
      
      // Crear DataFrames para el backend
      const nodesData = nodes.map(node => ({ node: node.id }));
      const linksData = links.map(link => ({
        source: link.source.id || link.source,
        target: link.target.id || link.target
      }));

      // Crear archivos CSV en memoria
      const nodesCsv = convertToCSV(nodesData);
      const linksCsv = convertToCSV(linksData);

      // Crear FormData para enviar al backend
      const formData = new FormData();
      formData.append('seed_user', selectedUser);
      formData.append('beta', beta.toString());
      formData.append('gamma', gamma.toString());
      formData.append('k', k.toString());
      formData.append('policy', policy);
      formData.append('max_steps', '50');
      formData.append('propagation_name', propagationName);
      formData.append('tipo_red', 'real-world');  // Tipo de red explícito
      formData.append('metodo', 'SIS');  // Método de propagación explícito
      formData.append('nodes_csv_file', new Blob([nodesCsv], { type: 'text/csv' }), 'nodes.csv');
      formData.append('links_csv_file', new Blob([linksCsv], { type: 'text/csv' }), 'links.csv');

      // Llamar al endpoint del backend
      const response = await fetch('http://localhost:8000/propagate-rw-sis', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error en la propagación SIS en red HR');
      }

      const result = await response.json();

      // Procesar resultado del backend
      const propagationLog = result.log;
      const highlightedLinks = [];

      // Convertir log del backend a formato esperado por el frontend
      // Mostrar TODOS los eventos del backend, no solo las infecciones
      propagationLog.forEach((entry, index) => {
        if (entry.action === 'infect') {
          highlightedLinks.push({
            source: entry.receiver,
            target: entry.sender,
            timeStep: entry.t,
            animationDelay: index * 1000, // Usar índice para delay más consistente
          });
        }
      });

      // Usar el log completo del backend (incluye infecciones y recuperaciones)
      setRwSISPropagationLog(propagationLog);
      setRwSISHighlightedLinks(highlightedLinks);
      setHighlightId(selectedUser);
      setRwSISPropagationStatus('Propagación SIS en red HR completada.');
      
    } catch (error) {
      console.error('❌ Error en propagación SIS en red HR:', error);
      setRwSISPropagationStatus(`Error: ${error.message}`);
    }
  }, [
    realWorldGraphData,
    setRwSISPropagationStatus,
    setRwSISBeta,
    setRwSISGamma,
    setSelectedUser,
    setShowRwSISPropagationResult,
    setRwSISPropagationLog,
    setRwSISHighlightedLinks,
    setHighlightId,
  ]);

  return handleRwSISPropagation;
};

export default useRWSISPropagation;
