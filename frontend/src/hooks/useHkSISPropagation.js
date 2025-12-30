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
 * Custom hook para manejar la propagación SIS en redes Holme-Kim
 * @param {Object} params - Parámetros del hook
 * @param {Array} params.hkGraphData - Datos del grafo Holme-Kim
 * @param {Function} params.setHkSISBeta - Función para establecer beta
 * @param {Function} params.setHkSISGamma - Función para establecer gamma
 * @param {Function} params.setSelectedUser - Función para establecer usuario seleccionado
 * @param {Function} params.setHkSISHighlightedLinks - Función para establecer enlaces destacados
 * @param {Function} params.setHkSISPropagationLog - Función para establecer log de propagación
 * @param {Function} params.setHkSISPropagationStatus - Función para establecer estado de propagación
 * @param {Function} params.setShowHkSISPropagationResult - Función para mostrar resultado de propagación
 * @param {Function} params.setHighlightId - Función para establecer ID destacado
 * @returns {Function} Función para manejar la propagación SIS
 */
export const useHkSISPropagation = ({
  hkGraphData,
  setHkSISBeta,
  setHkSISGamma,
  setSelectedUser,
  setHkSISHighlightedLinks,
  setHkSISPropagationLog,
  setHkSISPropagationStatus,
  setShowHkSISPropagationResult,
  setHighlightId,
}) => {
  const handleHkSISPropagation = useCallback(async ({ beta, gamma, k, policy, selectedUser, propagationName }) => {

    // Validaciones iniciales
    if (!hkGraphData.nodes.length) {
      setHkSISPropagationStatus('Por favor, genere una red Holme-Kim primero.');
      return;
    }
    
    if (!selectedUser) {
      setHkSISPropagationStatus('Por favor, seleccione un nodo inicial.');
      return;
    }

    // Configuración inicial
    setHkSISPropagationStatus('Iniciando propagación Holme-Kim SIS…');
    setHkSISBeta(beta);
    setHkSISGamma(gamma);
    setSelectedUser(selectedUser);
    setShowHkSISPropagationResult(true);

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
      formData.append('metodo', 'SIS');  // Método de propagación explícito
      formData.append('nodes_csv_file', new Blob([nodesCsv], { type: 'text/csv' }), 'nodes.csv');
      formData.append('links_csv_file', new Blob([linksCsv], { type: 'text/csv' }), 'links.csv');

      // Llamar al endpoint del backend
      const response = await fetch('http://localhost:8000/propagate-hk-sis', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error en la propagación Holme-Kim SIS');
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
      setHkSISPropagationLog(propagationLog);
      setHkSISHighlightedLinks(highlightedLinks);
      setHighlightId(selectedUser);
      setHkSISPropagationStatus('Propagación Holme-Kim SIS completada.');
      
    } catch (error) {
      console.error('❌ Error en propagación Holme-Kim SIS:', error);
      setHkSISPropagationStatus(`Error: ${error.message}`);
    }
  }, [
    hkGraphData,
    setHkSISBeta,
    setHkSISGamma,
    setSelectedUser,
    setHkSISHighlightedLinks,
    setHkSISPropagationLog,
    setHkSISPropagationStatus,
    setShowHkSISPropagationResult,
    setHighlightId,
  ]);

  return handleHkSISPropagation;
};
