import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './SavedNetworksModal.css';

export default function SavedNetworksModal({ isOpen, onClose, onLoadNetwork, networkType }) {
  const [savedNetworks, setSavedNetworks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedNetwork, setSelectedNetwork] = useState(null);

  // Cargar redes guardadas cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadSavedNetworks();
    }
  }, [isOpen, networkType]);

  const loadSavedNetworks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/saved-networks');
      if (!response.ok) {
        throw new Error('Error al cargar las redes guardadas');
      }
      const networks = await response.json();
      
      // Filtrar por tipo de red
      const filteredNetworks = networks.filter(network => 
        network.network_type === networkType
      );
      
      setSavedNetworks(filteredNetworks);
    } catch (err) {
      console.error('Error al cargar redes:', err);
      setError('Error al cargar las redes guardadas. Verifique la conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadNetwork = async (network) => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:8000/saved-networks/${network.network_id}`);
      if (!response.ok) {
        throw new Error('Error al cargar la red');
      }
      const networkData = await response.json();
      
      // Llamar a la función de carga con los datos de la red
      onLoadNetwork(networkData);
      onClose();
    } catch (err) {
      console.error('Error al cargar la red:', err);
      alert('Error al cargar la red seleccionada.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNetwork = async (networkId, event) => {
    event.stopPropagation();
    
    if (!window.confirm('¿Está seguro de que desea eliminar esta red?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/saved-networks/${networkId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar la red');
      }
      
      // Recargar la lista de redes
      loadSavedNetworks();
    } catch (err) {
      console.error('Error al eliminar la red:', err);
      alert('Error al eliminar la red.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNetworkTypeLabel = (type) => {
    switch (type) {
      case 'barabasi-albert':
        return 'Barabási-Albert';
      case 'holme-kim':
        return 'Holme-Kim';
      default:
        return type;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="saved-networks-modal-overlay">
      <div className="saved-networks-modal">
        <div className="saved-networks-modal-header">
          <h3>Redes Guardadas - {getNetworkTypeLabel(networkType)}</h3>
          <button 
            className="saved-networks-modal-close" 
            onClick={onClose}
            disabled={isLoading}
          >
            ×
          </button>
        </div>
        
        <div className="saved-networks-modal-body">
          {isLoading && savedNetworks.length === 0 ? (
            <div className="saved-networks-modal-loading">
              <div className="saved-networks-modal-spinner"></div>
              <p>Cargando redes guardadas...</p>
            </div>
          ) : error ? (
            <div className="saved-networks-modal-error">
              <p>{error}</p>
              <button 
                className="saved-networks-modal-retry-button"
                onClick={loadSavedNetworks}
              >
                Reintentar
              </button>
            </div>
          ) : savedNetworks.length === 0 ? (
            <div className="saved-networks-modal-empty">
              <p>No hay redes guardadas de tipo {getNetworkTypeLabel(networkType)}.</p>
            </div>
          ) : (
            <div className="saved-networks-modal-list">
              {savedNetworks.map((network) => (
                <div 
                  key={network.network_id}
                  className={`saved-networks-modal-item ${selectedNetwork?.network_id === network.network_id ? 'selected' : ''}`}
                  onClick={() => setSelectedNetwork(network)}
                >
                  <div className="saved-networks-modal-item-content">
                    <div className="saved-networks-modal-item-header">
                      <h4 className="saved-networks-modal-item-name">{network.network_name}</h4>
                      <div className="saved-networks-modal-item-actions">
                        <button
                          className="saved-networks-modal-item-delete"
                          onClick={(e) => handleDeleteNetwork(network.network_id, e)}
                          title="Eliminar red"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                    
                    <div className="saved-networks-modal-item-details">
                      <div className="saved-networks-modal-item-detail">
                        <span className="saved-networks-modal-item-label">Tipo:</span>
                        <span className="saved-networks-modal-item-value">{getNetworkTypeLabel(network.network_type)}</span>
                      </div>
                      
                      {network.parameters && (
                        <div className="saved-networks-modal-item-detail">
                          <span className="saved-networks-modal-item-label">Parámetros:</span>
                          <span className="saved-networks-modal-item-value">
                            {network.parameters.n && `Nodos: ${network.parameters.n}`}
                            {network.parameters.m && `, Enlaces: ${network.parameters.m}`}
                            {network.parameters.p !== undefined && `, Probabilidad: ${network.parameters.p}`}
                          </span>
                        </div>
                      )}
                      
                      <div className="saved-networks-modal-item-detail">
                        <span className="saved-networks-modal-item-label">Creada:</span>
                        <span className="saved-networks-modal-item-value">{formatDate(network.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="saved-networks-modal-footer">
          <button 
            className="saved-networks-modal-button saved-networks-modal-button-cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button 
            className="saved-networks-modal-button saved-networks-modal-button-load"
            onClick={() => selectedNetwork && handleLoadNetwork(selectedNetwork)}
            disabled={isLoading || !selectedNetwork}
          >
            {isLoading ? 'Cargando...' : 'Cargar Red'}
          </button>
        </div>
      </div>
    </div>
  );
}

SavedNetworksModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onLoadNetwork: PropTypes.func.isRequired,
  networkType: PropTypes.string.isRequired,
};
