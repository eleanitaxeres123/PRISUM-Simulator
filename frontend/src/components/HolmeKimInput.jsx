import { useState } from 'react';
import PropTypes from 'prop-types';
import NetworkNameModal from './NetworkNameModal';
import SavedNetworksModal from './SavedNetworksModal';
import './HolmeKimInput.css';

export default function HolmeKimInput({ onGenerateNetwork, onLoadNetwork }) {
  const [numNodes, setNumNodes] = useState('');
  const [numEdges, setNumEdges] = useState('');
  const [triadProb, setTriadProb] = useState('');
  const [showNameModal, setShowNameModal] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [pendingNetworkData, setPendingNetworkData] = useState(null);

  const handleGenerate = () => {
    const n = parseInt(numNodes);
    const m = parseInt(numEdges);
    const p = parseFloat(triadProb);

    if (isNaN(n) || n < 2) {
      alert('El número de nodos debe ser al menos 2.');
      return;
    }
    if (isNaN(m) || m < 1 || m >= n) {
      alert('El número de enlaces por nodo debe ser al menos 1 y menor que el número de nodos.');
      return;
    }
    if (isNaN(p) || p < 0 || p > 1) {
      alert('La probabilidad de formación de triadas debe estar entre 0 y 1.');
      return;
    }

    console.log('Generando red con parámetros:', { n, m, p });

    // Generar la red primero
    const networkData = onGenerateNetwork(n, m, p);
    
    console.log('Datos de red generados:', networkData);
    
    if (!networkData || !networkData.nodes) {
      console.error('Error: onGenerateNetwork no retornó datos válidos');
      alert('Error al generar la red. Por favor, intente nuevamente.');
      return;
    }
    
    // Guardar los datos para el modal de nombre
    setPendingNetworkData({
      networkData,
      parameters: { n, m, p }
    });
    
    console.log('Datos pendientes establecidos:', {
      networkData,
      parameters: { n, m, p }
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
        network_type: 'holme-kim',
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
        <div className="navbar-input-container">
          <label htmlFor="triad-prob" className="navbar-label">Probabilidad de Triadas (p)</label>
          <input
            id="triad-prob"
            type="number"
            value={triadProb}
            onChange={(e) => setTriadProb(e.target.value)}
            className="navbar-input"
            placeholder="Ej. 0.5"
            step="0.1"
            min="0"
            max="1"
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
        networkType="holme-kim"
      />
      
      {/* Modal para seleccionar redes guardadas */}
      <SavedNetworksModal
        isOpen={showSavedModal}
        onClose={() => setShowSavedModal(false)}
        onLoadNetwork={handleLoadNetwork}
        networkType="holme-kim"
      />
    </div>
  );
}

HolmeKimInput.propTypes = {
  onGenerateNetwork: PropTypes.func.isRequired,
  onLoadNetwork: PropTypes.func,
};