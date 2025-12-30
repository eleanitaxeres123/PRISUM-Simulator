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
 * Hook personalizado para manejar la propagación SIR (Susceptible-Infected-Recovered)
 * @param {Object} params - Parámetros del hook
 * @param {Array} params.baGraphData - Datos del grafo Barabási-Albert
 * @param {Function} params.setBaSIRPropagationStatus - Función para actualizar el estado de propagación
 * @param {Function} params.setBaSIRBeta - Función para actualizar beta
 * @param {Function} params.setBaSIRGamma - Función para actualizar gamma
 * @param {Function} params.setSelectedUser - Función para actualizar el usuario seleccionado
 * @param {Function} params.setShowBaSIRPropagationResult - Función para mostrar/ocultar el resultado
 * @param {Function} params.setBaSIRPropagationLog - Función para actualizar el log de propagación
 * @param {Function} params.setBaSIRHighlightedLinks - Función para actualizar los enlaces destacados
 * @param {Function} params.setHighlightId - Función para actualizar el ID destacado
 * @returns {Function} Función para iniciar la propagación SIR
 */
export const useSIRPropagation = ({
  baGraphData,
  setBaSIRPropagationStatus,
  setBaSIRBeta,
  setBaSIRGamma,
  setSelectedUser,
  setShowBaSIRPropagationResult,
  setBaSIRPropagationLog,
  setBaSIRHighlightedLinks,
  setHighlightId,
}) => {
  /**
   * Función principal para manejar la propagación SIR
   * @param {Object} params - Parámetros de propagación
   * @param {number} params.beta - Tasa de infección
   * @param {number} params.gamma - Tasa de recuperación
   * @param {number} params.k - Valor K
   * @param {string} params.policy - Política seleccionada
   * @param {Array|string} params.selectedUsers - Usuarios iniciales infectados (array o string)
   */
  const handleBaSIRPropagation = useCallback(async ({ beta, gamma, k, policy, selectedUser, selectedUsers, propagationName }) => {
    // Normalizar selectedUser/selectedUsers
    let users = [];
    if (selectedUsers && selectedUsers.length > 0) {
      users = Array.isArray(selectedUsers) ? selectedUsers : [selectedUsers];
    } else if (selectedUser) {
      users = [selectedUser];
    }
    const user = users[0]; // Para compatibilidad con el backend
    
    
    // Validaciones iniciales
    if (!baGraphData.nodes.length) {
      setBaSIRPropagationStatus('Por favor, genere una red Barabási-Albert primero.');
      return;
    }

    if (!user) {
      setBaSIRPropagationStatus('Por favor, seleccione al menos un nodo inicial.');
      return;
    }

    // Configuración inicial
    setBaSIRPropagationStatus('Iniciando propagación SIR…');
    setBaSIRBeta(beta);
    setBaSIRGamma(gamma);
    setSelectedUser(user); // Mantener compatibilidad con el estado existente
    setShowBaSIRPropagationResult(true);

    try {
      // Preparar datos para enviar al backend
      const nodes = [...baGraphData.nodes];
      const links = [...baGraphData.links];
      
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
      formData.append('seed_user', user);
      formData.append('beta', beta.toString());
      formData.append('gamma', gamma.toString());
      formData.append('k', k.toString());
      formData.append('policy', policy);
      formData.append('max_steps', '50');
      formData.append('propagation_name', propagationName);
      formData.append('tipo_red', 'barabasi-albert');  // Tipo de red explícito
      formData.append('metodo', 'SIR');  // Método de propagación explícito
      formData.append('nodes_csv_file', new Blob([nodesCsv], { type: 'text/csv' }), 'nodes.csv');
      formData.append('links_csv_file', new Blob([linksCsv], { type: 'text/csv' }), 'links.csv');

      // Llamar al endpoint del backend
      const response = await fetch('http://localhost:8000/propagate-ba-sir', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error en la propagación SIR');
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
      setBaSIRPropagationLog(propagationLog);
      setBaSIRHighlightedLinks(highlightedLinks);
      setHighlightId(user);
      setBaSIRPropagationStatus('Propagación SIR completada.');
      
    } catch (error) {
      console.error('❌ Error en propagación SIR:', error);
      setBaSIRPropagationStatus(`Error: ${error.message}`);
    }
  }, [
    baGraphData,
    setBaSIRPropagationStatus,
    setBaSIRBeta,
    setBaSIRGamma,
    setSelectedUser,
    setShowBaSIRPropagationResult,
    setBaSIRPropagationLog,
    setBaSIRHighlightedLinks,
    setHighlightId,
  ]);

  return handleBaSIRPropagation;
};

export default useSIRPropagation;
