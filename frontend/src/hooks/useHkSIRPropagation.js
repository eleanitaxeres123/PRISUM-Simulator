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
 * Custom hook para manejar la propagación SIR en redes Holme-Kim
 * @param {Object} params - Parámetros del hook
 * @param {Array} params.hkGraphData - Datos del grafo Holme-Kim
 * @param {Function} params.setHkSIRBeta - Función para establecer beta
 * @param {Function} params.setHkSIRGamma - Función para establecer gamma
 * @param {Function} params.setSelectedUser - Función para establecer usuario seleccionado
 * @param {Function} params.setHkSIRHighlightedLinks - Función para establecer enlaces destacados
 * @param {Function} params.setHkSIRPropagationLog - Función para establecer log de propagación
 * @param {Function} params.setHkSIRPropagationStatus - Función para establecer estado de propagación
 * @param {Function} params.setShowHkSIRPropagationResult - Función para mostrar resultado de propagación
 * @param {Function} params.setHighlightId - Función para establecer ID destacado
 * @returns {Function} Función para manejar la propagación SIR
 */
export const useHkSIRPropagation = ({
  hkGraphData,
  setHkSIRBeta,
  setHkSIRGamma,
  setSelectedUser,
  setHkSIRHighlightedLinks,
  setHkSIRPropagationLog,
  setHkSIRPropagationStatus,
  setShowHkSIRPropagationResult,
  setHighlightId,
}) => {
  const handleHkSIRPropagation = useCallback(async ({ beta, gamma, k, policy, selectedUser, propagationName }) => {

    // Validaciones iniciales
    if (!hkGraphData.nodes.length) {
      setHkSIRPropagationStatus('Por favor, genere una red Holme-Kim primero.');
      return;
    }
    
    if (!selectedUser) {
      setHkSIRPropagationStatus('Por favor, seleccione un nodo inicial y escriba un mensaje.');
      return;
    }

    // Configuración inicial
    setHkSIRPropagationStatus('Iniciando propagación Holme-Kim SIR…');
    setHkSIRBeta(beta);
    setHkSIRGamma(gamma);
    setSelectedUser(selectedUser);
    setShowHkSIRPropagationResult(true);

    try {
      // Preparar datos para enviar al backend
      const nodes = [...hkGraphData.nodes];
      const links = [...hkGraphData.links];
      
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
      formData.append('tipo_red', 'holme-kim');  // Tipo de red explícito
      formData.append('metodo', 'SIR');  // Método de propagación explícito
      formData.append('nodes_csv_file', new Blob([nodesCsv], { type: 'text/csv' }), 'nodes.csv');
      formData.append('links_csv_file', new Blob([linksCsv], { type: 'text/csv' }), 'links.csv');

      // Llamar al endpoint del backend
      const response = await fetch('http://localhost:8000/propagate-hk-sir', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error en la propagación Holme-Kim SIR');
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
      setHkSIRPropagationLog(propagationLog);
      setHkSIRHighlightedLinks(highlightedLinks);
      setHighlightId(selectedUser);
      setHkSIRPropagationStatus('Propagación Holme-Kim SIR completada.');
      
    } catch (error) {
      console.error('❌ Error en propagación Holme-Kim SIR:', error);
      setHkSIRPropagationStatus(`Error: ${error.message}`);
    }
  }, [
    hkGraphData,
    setHkSIRBeta,
    setHkSIRGamma,
    setSelectedUser,
    setHkSIRHighlightedLinks,
    setHkSIRPropagationLog,
    setHkSIRPropagationStatus,
    setShowHkSIRPropagationResult,
    setHighlightId,
  ]);

  return handleHkSIRPropagation;
};

export default useHkSIRPropagation;
