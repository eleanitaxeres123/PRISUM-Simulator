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
 * Hook personalizado para manejar la propagación SIR (Susceptible-Infected-Recovered) en redes del mundo real
 * @param {Object} params - Parámetros del hook
 * @param {Array} params.realWorldGraphData - Datos del grafo del mundo real
 * @param {Function} params.setRwSIRPropagationStatus - Función para actualizar el estado de propagación
 * @param {Function} params.setRwSIRBeta - Función para actualizar beta
 * @param {Function} params.setRwSIRGamma - Función para actualizar gamma
 * @param {Function} params.setSelectedUser - Función para actualizar el usuario seleccionado
 * @param {Function} params.setShowRwSIRPropagationResult - Función para mostrar/ocultar el resultado
 * @param {Function} params.setRwSIRPropagationLog - Función para actualizar el log de propagación
 * @param {Function} params.setRwSIRHighlightedLinks - Función para actualizar los enlaces destacados
 * @param {Function} params.setHighlightId - Función para actualizar el ID destacado
 * @returns {Function} Función para iniciar la propagación SIR
 */
export const useRWSIRPropagation = ({
  realWorldGraphData,
  setRwSIRPropagationStatus,
  setRwSIRBeta,
  setRwSIRGamma,
  setSelectedUser,
  setShowRwSIRPropagationResult,
  setRwSIRPropagationLog,
  setRwSIRHighlightedLinks,
  setHighlightId,
}) => {
  /**
   * Función principal para manejar la propagación SIR en redes del mundo real
   * @param {Object} params - Parámetros de propagación
   * @param {number} params.beta - Tasa de infección
   * @param {number} params.gamma - Tasa de recuperación
   * @param {string} params.selectedUser - Usuario inicial infectado
   */
  const handleRwSIRPropagation = useCallback(async ({ beta, gamma, k, policy, selectedUser, propagationName }) => {
    
    // Validaciones iniciales
    if (!realWorldGraphData.nodes.length) {
      setRwSIRPropagationStatus('Por favor, cargue una red HR primero.');
      return;
    }

    if (!selectedUser) {
      setRwSIRPropagationStatus('Por favor, seleccione un nodo inicial y escriba un mensaje.');
      return;
    }

    // Configuración inicial
    setRwSIRPropagationStatus('Iniciando propagación SIR en red HR…');
    setRwSIRBeta(beta);
    setRwSIRGamma(gamma);
    setSelectedUser(selectedUser);
    setShowRwSIRPropagationResult(true);

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
      formData.append('metodo', 'SIR');  // Método de propagación explícito
      formData.append('nodes_csv_file', new Blob([nodesCsv], { type: 'text/csv' }), 'nodes.csv');
      formData.append('links_csv_file', new Blob([linksCsv], { type: 'text/csv' }), 'links.csv');

      // Llamar al endpoint del backend
      const response = await fetch('http://localhost:8000/propagate-rw-sir', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error en la propagación SIR en red HR');
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
      setRwSIRPropagationLog(propagationLog);
      setRwSIRHighlightedLinks(highlightedLinks);
      setHighlightId(selectedUser);
      setRwSIRPropagationStatus('Propagación SIR en red HR completada.');
      
    } catch (error) {
      console.error('❌ Error en propagación SIR en red HR:', error);
      setRwSIRPropagationStatus(`Error: ${error.message}`);
    }
  }, [
    realWorldGraphData,
    setRwSIRPropagationStatus,
    setRwSIRBeta,
    setRwSIRGamma,
    setSelectedUser,
    setShowRwSIRPropagationResult,
    setRwSIRPropagationLog,
    setRwSIRHighlightedLinks,
    setHighlightId,
  ]);

  return handleRwSIRPropagation;
};

export default useRWSIRPropagation;
