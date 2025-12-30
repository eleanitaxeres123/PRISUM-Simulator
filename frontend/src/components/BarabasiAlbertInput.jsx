import { useState } from 'react';
import PropTypes from 'prop-types';
import NetworkNameModal from './NetworkNameModal';
import SavedNetworksModal from './SavedNetworksModal';
import './Navbar.css'; // Reutilizamos estilos de Navbar para consistencia

export default function BarabasiAlbertInput({ onGenerateNetwork, onLoadNetwork }) {
  const [numNodes, setNumNodes] = useState('');
  const [numEdges, setNumEdges] = useState('');
  const [showNameModal, setShowNameModal] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [pendingNetworkData, setPendingNetworkData] = useState(null);

  const handleGenerate = () => {
    const nodes = parseInt(numNodes);
    const edges = parseInt(numEdges);
    if (isNaN(nodes) || nodes < 2) {
      alert('Por favor, ingrese un número válido de nodos (mínimo 2).');
      return;
    }
    if (isNaN(edges) || edges < 1 || edges > nodes) {
      alert('Por favor, ingrese un número válido de enlaces por nodo (entre 1 y el número de nodos).');
      return;
    }
    
    console.log('Generando red con parámetros:', { nodes, edges });
    
    // Generar la red primero
    const networkData = onGenerateNetwork(nodes, edges);
    
    console.log('Datos de red generados:', networkData);
    
    if (!networkData || !networkData.nodes) {
      console.error('Error: onGenerateNetwork no retornó datos válidos');
      alert('Error al generar la red. Por favor, intente nuevamente.');
      return;
    }
    
    // Guardar los datos para el modal de nombre
    setPendingNetworkData({
      networkData,
      parameters: { n: nodes, m: edges }
    });
    
    console.log('Datos pendientes establecidos:', {
      networkData,
      parameters: { n: nodes, m: edges }
    });
    
    // Mostrar modal para ingresar nombre
    setShowNameModal(true);
  };

  const handleSaveNetwork = async (networkName) => {
    if (!pendingNetworkData) {
      console.error('No hay datos de red pendientes para guardar');
      return;
    }

    console.log('Datos de red a guardar:', pendingNetworkData);

    try {
      // Normalizar nodos: solo guardar datos esenciales
      const normalizedNodes = pendingNetworkData.networkData.nodes.map(node => ({
        id: node.id,
        cluster: node.cluster || null
      }));

      // Normalizar enlaces: asegurar que source y target sean solo IDs
      const normalizedLinks = pendingNetworkData.networkData.links.map(link => ({
        source: typeof link.source === 'object' ? link.source.id : link.source,
        target: typeof link.target === 'object' ? link.target.id : link.target
      }));

      const requestBody = {
        network_name: networkName,
        network_type: 'barabasi-albert',
        nodes: JSON.stringify(normalizedNodes),
        links: JSON.stringify(normalizedLinks),
        parameters: JSON.stringify(pendingNetworkData.parameters)
      };

      console.log('Enviando petición con datos normalizados:', requestBody);

      const response = await fetch('http://localhost:8000/save-network', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(requestBody)
      });

      console.log('Respuesta del servidor:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error del servidor:', errorText);
        throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Resultado exitoso:', result);
      alert(`Red "${networkName}" guardada correctamente.`);
      
      // Limpiar datos pendientes
      setPendingNetworkData(null);
    } catch (error) {
      console.error('Error al guardar la red:', error);
      alert(`Error al guardar la red: ${error.message}`);
      throw error;
    }
  };

  const handleLoadNetwork = (networkData) => {
    // Normalizar los datos cargados para asegurar que los enlaces tengan solo IDs
    const normalizedNodes = networkData.nodes.map(node => ({
      id: node.id,
      cluster: node.cluster || null
    }));

    const normalizedLinks = networkData.links.map(link => ({
      source: typeof link.source === 'object' ? link.source.id : link.source,
      target: typeof link.target === 'object' ? link.target.id : link.target
    }));

    const loadedNetwork = {
      nodes: normalizedNodes,
      links: normalizedLinks
    };
    
    console.log('Cargando red con datos normalizados:', loadedNetwork);
    
    // Llamar a la función de carga con los datos normalizados
    if (onLoadNetwork) {
      onLoadNetwork(loadedNetwork);
    }
  };

  const handleShowSavedNetworks = () => {
    setShowSavedModal(true);
  };

  return (
    <div className="navbar">
      <div className="navbar-controls">
        <div className="navbar-input-container">
          <label htmlFor="num-nodes" className="navbar-label">Número de Nodos</label>
          <input
            id="num-nodes"
            type="number"
            value={numNodes}
            onChange={(e) => setNumNodes(e.target.value)}
            className="navbar-input"
            placeholder="Ej. 100"
            min="2"
          />
        </div>
        <div className="navbar-input-container">
          <label htmlFor="num-edges" className="navbar-label">Enlaces por Nodo (m)</label>
          <input
            id="num-edges"
            type="number"
            value={numEdges}
            onChange={(e) => setNumEdges(e.target.value)}
            className="navbar-input"
            placeholder="Ej. 2"
            min="1"
          />
        </div>
        <button onClick={handleGenerate} className="button">
          Generar Red
        </button>
        <button onClick={handleShowSavedNetworks} className="button button-secondary">
          Cargar Red Guardada
        </button>
      </div>
      
      {/* Modal para ingresar nombre de la red */}
      <NetworkNameModal
        isOpen={showNameModal}
        onClose={() => setShowNameModal(false)}
        onSave={handleSaveNetwork}
        networkType="barabasi-albert"
      />
      
      {/* Modal para seleccionar redes guardadas */}
      <SavedNetworksModal
        isOpen={showSavedModal}
        onClose={() => setShowSavedModal(false)}
        onLoadNetwork={handleLoadNetwork}
        networkType="barabasi-albert"
      />
    </div>
  );
}

BarabasiAlbertInput.propTypes = {
  onGenerateNetwork: PropTypes.func.isRequired,
  onLoadNetwork: PropTypes.func,
};