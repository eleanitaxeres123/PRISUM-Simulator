import { useState } from 'react';
import PropTypes from 'prop-types';
import './NetworkNameModal.css';

export default function NetworkNameModal({ isOpen, onClose, onSave, networkType }) {
  const [networkName, setNetworkName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!networkName.trim()) {
      alert('Por favor, ingrese un nombre para la red.');
      return;
    }

    setIsLoading(true);
    try {
      await onSave(networkName.trim());
      setNetworkName('');
      onClose();
    } catch (error) {
      console.error('Error al guardar la red:', error);
      alert('Error al guardar la red. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setNetworkName('');
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="network-name-modal-overlay">
      <div className="network-name-modal">
        <div className="network-name-modal-header">
          <h3>Guardar Red</h3>
          <button 
            className="network-name-modal-close" 
            onClick={handleCancel}
            disabled={isLoading}
          >
            ×
          </button>
        </div>
        
        <div className="network-name-modal-body">
          <p className="network-name-modal-description">
            Ingrese un nombre para la red {networkType === 'barabasi-albert' ? 'Barabási-Albert' : 'Holme-Kim'}:
          </p>
          
          <div className="network-name-modal-input-container">
            <label htmlFor="network-name" className="network-name-modal-label">
              Nombre de la red:
            </label>
            <input
              id="network-name"
              type="text"
              value={networkName}
              onChange={(e) => setNetworkName(e.target.value)}
              onKeyDown={handleKeyPress}
              className="network-name-modal-input"
              placeholder="Ej. Mi Red de Prueba"
              disabled={isLoading}
              autoFocus
            />
          </div>
        </div>
        
        <div className="network-name-modal-footer">
          <button 
            className="network-name-modal-button network-name-modal-button-cancel"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button 
            className="network-name-modal-button network-name-modal-button-save"
            onClick={handleSave}
            disabled={isLoading || !networkName.trim()}
          >
            {isLoading ? 'Guardando...' : 'Guardar Red'}
          </button>
        </div>
      </div>
    </div>
  );
}

NetworkNameModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  networkType: PropTypes.string.isRequired,
};
