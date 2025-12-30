import { useState } from 'react';
import PropTypes from 'prop-types';
import './ControlPanel.css';

export default function ControlPanel({ onMenuSelect, currentViewMode, setCurrentNetworkType }) {
  const [selectedNetworkType, setSelectedNetworkType] = useState('barabasi-albert');

  const handleNetworkTypeChange = (networkType) => {
    setSelectedNetworkType(networkType);
    setCurrentNetworkType(networkType);
    
    // Cambiar al modo de visualización por defecto
    if (networkType === 'barabasi-albert') {
      onMenuSelect('barabasi-albert');
    } else if (networkType === 'holme-kim') {
      onMenuSelect('holme-kim');
    } else if (networkType === 'real-world') {
      onMenuSelect('real-world');
    } else if (networkType === 'reports') {
      onMenuSelect('reports');
    }
  };

  const getCurrentNetworkType = () => {
    if (currentViewMode === 'barabasi-albert' || currentViewMode === 'barabasi-si' || currentViewMode === 'barabasi-sis' || currentViewMode === 'barabasi-behavior') {
      return 'barabasi-albert';
    } else if (currentViewMode === 'holme-kim' || currentViewMode === 'holme-kim-si' || currentViewMode === 'holme-kim-sis' || currentViewMode === 'holme-kim-behavior') {
      return 'holme-kim';
    } else if (currentViewMode === 'real-world' || currentViewMode === 'real-world-sir' || currentViewMode === 'real-world-sis' || currentViewMode === 'simulation') {
      return 'real-world';
    } else if (currentViewMode === 'reports') {
      return 'reports';
    } else {
      return selectedNetworkType;
    }
  };




const getActiveModule = () => {
  if (
    currentViewMode === 'barabasi-albert' ||
    currentViewMode === 'holme-kim' ||
    currentViewMode === 'real-world'
  ) {
    return 'visualize';
  } else if (
    currentViewMode === 'barabasi-si' ||
    currentViewMode === 'barabasi-sis' ||
    currentViewMode === 'holme-kim-si' ||
    currentViewMode === 'holme-kim-sis' ||
    currentViewMode === 'real-world-sir' ||
    currentViewMode === 'real-world-sis'
  ) {
    return 'propagate';
  } else if (
    currentViewMode === 'barabasi-behavior' ||
    currentViewMode === 'holme-kim-behavior' ||
    currentViewMode === 'simulation'
  ) {
    return 'behavior';
  }
  return 'visualize';
};

// En ControlPanel.jsx, modifica handleModuleSelect:
const handleModuleSelect = (module) => {
  const networkType = getCurrentNetworkType();
  
  if (module === 'visualize') {
    if (networkType === 'barabasi-albert') {
      onMenuSelect('barabasi-albert');
    } else if (networkType === 'holme-kim') {
      onMenuSelect('holme-kim');
    } else {
      onMenuSelect('real-world');
    }
  } else if (module === 'propagate') {
    if (networkType === 'barabasi-albert') {
      onMenuSelect('barabasi-si');
    } else if (networkType === 'holme-kim') {
      onMenuSelect('holme-kim-si');
    } else {
      onMenuSelect('real-world-sir');
    }
  } else if (module === 'behavior') {
    if (networkType === 'barabasi-albert') {
      onMenuSelect('barabasi-behavior');
    } else if (networkType === 'holme-kim') {
      onMenuSelect('holme-kim-behavior');
    } else {
      onMenuSelect('simulation'); // ← Esto debería ser 'simulation' para redes del mundo real
    }
  }
};

// Nueva función para manejar la selección específica de módulos de propagación
const handlePropagationModuleSelect = (propagationType) => {
  const networkType = getCurrentNetworkType();
  
  if (networkType === 'barabasi-albert') {
    if (propagationType === 'sir') {
      onMenuSelect('barabasi-si');
    } else if (propagationType === 'sis') {
      onMenuSelect('barabasi-sis');
    }
  } else if (networkType === 'holme-kim') {
    if (propagationType === 'sir') {
      onMenuSelect('holme-kim-si');
    } else if (propagationType === 'sis') {
      onMenuSelect('holme-kim-sis'); // Asumiendo que existe este módulo
    }
  } else if (networkType === 'real-world') {
    if (propagationType === 'sir') {
      onMenuSelect('real-world-sir');
    } else if (propagationType === 'sis') {
      onMenuSelect('real-world-sis');
    }
  }
};

// Función para determinar si un botón de propagación está activo
const isPropagationButtonActive = (propagationType) => {
  const networkType = getCurrentNetworkType();
  
  if (networkType === 'barabasi-albert') {
    if (propagationType === 'sir') {
      return currentViewMode === 'barabasi-si';
    } else if (propagationType === 'sis') {
      return currentViewMode === 'barabasi-sis';
    }
  } else if (networkType === 'holme-kim') {
    if (propagationType === 'sir') {
      return currentViewMode === 'holme-kim-si';
    } else if (propagationType === 'sis') {
      return currentViewMode === 'holme-kim-sis';
    }
  } else if (networkType === 'real-world') {
    if (propagationType === 'sir') {
      return currentViewMode === 'real-world-sir';
    } else if (propagationType === 'sis') {
      return currentViewMode === 'real-world-sis';
    }
  }
  return false;
};

  return (
    <div>
      <div className="titulo">
        <h1 className="control-panel-title">
          PRISUM-Simulator
        </h1>
      </div>
      <div className="control-panel">
        <div className="network-type-selection">
          <h3>Selecciona el tipo de red:</h3>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="networkType"
                value="barabasi-albert"
                checked={getCurrentNetworkType() === 'barabasi-albert'}
                onChange={() => handleNetworkTypeChange('barabasi-albert')}
              />
              <span>Redes Barabási–Albert (BA)</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="networkType"
                value="holme-kim"
                checked={getCurrentNetworkType() === 'holme-kim'}
                onChange={() => handleNetworkTypeChange('holme-kim')}
              />
              <span>Redes Holme–Kim (HK)</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="networkType"
                value="real-world"
                checked={getCurrentNetworkType() === 'real-world'}
                onChange={() => handleNetworkTypeChange('real-world')}
              />
              <span>Redes Híbridas Reales (HR)</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="networkType"
                value="reports"
                checked={getCurrentNetworkType() === 'reports'}
                onChange={() => handleNetworkTypeChange('reports')}
              />
              <span>Reportes</span>
            </label>
          </div>
        </div>
        {getCurrentNetworkType() !== 'reports' && (
          <div className="module-buttons">
            <button
              className={`module-button ${getActiveModule() === 'visualize' ? 'active' : ''}`}
              onClick={() => handleModuleSelect('visualize')}
            >
              Visualizar Red
            </button>
            <button
              className={`module-button ${isPropagationButtonActive('sir') ? 'active' : ''}`}
              onClick={() => handlePropagationModuleSelect('sir')}
            >
              Propagar información con SIR
            </button>
            <button
              className={`module-button ${isPropagationButtonActive('sis') ? 'active' : ''}`}
              onClick={() => handlePropagationModuleSelect('sis')}
            >
              Propagar información con SIS
            </button>
            <button
              className={`module-button ${getActiveModule() === 'behavior' ? 'active' : ''}`}
              onClick={() => handleModuleSelect('behavior')}
            >
              Propagar información con PRISUM-Model
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

ControlPanel.propTypes = {
  onMenuSelect: PropTypes.func.isRequired,
  currentViewMode: PropTypes.string.isRequired,
};
