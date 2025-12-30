import PropTypes from 'prop-types';
import PropagationResult from './PropagationResult';
import RWSIRPropagationResult from './RWSIRPropagationResult';
import RWSISPropagationResult from './RWSISPropagationResult';
import BaSIRPropagationResult from './BaSIRPropagationResult';
import BaSISPropagationResult from './BaSISPropagationResult';
import HkSISPropagationResult from './HkSISPropagationResult';
import CentralityModal from './CentralityModal';
import './PropagationHistory.css';

export default function PropagationHistory({ 
  propagationLog, 
  title = "Historial de Propagación",
  viewMode,
  selectedUser,
  onClose,
  emotionVector,
  showBaSIRPropagationResult,
  showBaSISPropagationResult,
  showHkSIRPropagationResult,
  showHkSISPropagationResult,
  onCloseBaSIRPropagationResult,
  onCloseBaSISPropagationResult,
  onCloseHkSIRPropagationResult,
  onCloseHkSISPropagationResult,
  // Props para el modal de centralidad
  isCentralityModalOpen,
  setIsCentralityModalOpen,
  modalNode
}) {

  let customTitle = title;
  if (viewMode === 'barabasi-albert' || viewMode === 'barabasi-si' || viewMode === 'barabasi-sis' || viewMode === 'barabasi-behavior') {
    customTitle = "Historial de propagación en red BA";
  } else if (viewMode === 'holme-kim' || viewMode === 'holme-kim-si' || viewMode === 'holme-kim-sis' || viewMode === 'holme-kim-behavior') {
    customTitle = "Historial de propagación en red HK";
  } else if (viewMode === 'simulation' || viewMode === 'real-world') {
    customTitle = "Historial de propagación en red HR";
  }

  // Determinar qué componente mostrar según el modo de vista
  const renderContent = () => {
    switch (viewMode) {
      case 'simulation':
      case 'barabasi-behavior':
      case 'holme-kim-behavior':
        return propagationLog.length > 0 ? (
          <PropagationResult
            propagationLog={propagationLog}
            selectedUser={selectedUser}
            onClose={onClose}
            emotionVector={emotionVector}
          />
        ) : (
          <div className="no-propagation">
            <p>No hay eventos de propagación aún</p>
            <p className="no-propagation-hint">Inicia una propagación para ver el historial</p>
          </div>
        );
      
      case 'real-world-sir':
        return propagationLog.length > 0 ? (
          <RWSIRPropagationResult
            propagationLog={propagationLog}
            selectedUser={selectedUser}
            onClose={onClose}
          />
        ) : (
          <div className="no-propagation">
            <p>No hay eventos de propagación aún</p>
            <p className="no-propagation-hint">Inicia una propagación para ver el historial</p>
          </div>
        );
      
      case 'real-world-sis':
        return propagationLog.length > 0 ? (
          <RWSISPropagationResult
            propagationLog={propagationLog}
            selectedUser={selectedUser}
            onClose={onClose}
          />
        ) : (
          <div className="no-propagation">
            <p>No hay eventos de propagación aún</p>
            <p className="no-propagation-hint">Inicia una propagación para ver el historial</p>
          </div>
        );
      
      case 'barabasi-si':
        return showBaSIRPropagationResult ? (
          <BaSIRPropagationResult
            selectedUser={selectedUser}
            onClose={onCloseBaSIRPropagationResult}
          />
        ) : (
          <div className="no-propagation">
            <p>No hay eventos de propagación aún</p>
            <p className="no-propagation-hint">Inicia una propagación para ver el historial</p>
          </div>
        );
      
      case 'barabasi-sis':
        return showBaSISPropagationResult ? (
          <BaSISPropagationResult
            selectedUser={selectedUser}
            onClose={onCloseBaSISPropagationResult}
            model="barabasi-albert"
          />
        ) : (
          <div className="no-propagation">
            <p>No hay eventos de propagación aún</p>
            <p className="no-propagation-hint">Inicia una propagación para ver el historial</p>
          </div>
        );
      
      case 'holme-kim-si':
        return showHkSIRPropagationResult ? (
          <BaSIRPropagationResult
            selectedUser={selectedUser}
            onClose={onCloseHkSIRPropagationResult}
            model="holme-kim"
          />
        ) : (
          <div className="no-propagation">
            <p>No hay eventos de propagación aún</p>
            <p className="no-propagation-hint">Inicia una propagación para ver el historial</p>
          </div>
        );
      
      case 'holme-kim-sis':
        return showHkSISPropagationResult ? (
          <HkSISPropagationResult
            selectedUser={selectedUser}
            onClose={onCloseHkSISPropagationResult}
          />
        ) : (
          <div className="no-propagation">
            <p>No hay eventos de propagación aún</p>
            <p className="no-propagation-hint">Inicia una propagación para ver el historial</p>
          </div>
        );
      
      // Modos que muestran el historial tradicional o el modal de centralidad
      case 'real-world':
      case 'barabasi-albert':
      case 'holme-kim':
      default:
        // Si el modal de centralidad está abierto, mostrarlo
        if (isCentralityModalOpen && modalNode) {
          return (
            <CentralityModal
              isOpen={isCentralityModalOpen}
              setIsOpen={setIsCentralityModalOpen}
              modalNode={modalNode}
            />
          );
        }
        
        // Si no, mostrar el historial tradicional
        return propagationLog.length > 0 ? (
          <ul className="propagation-list">
            {propagationLog.map((entry, index) => (
              <li key={index} className="propagation-entry">
                <span className="propagation-arrow">→</span>
                <span className="propagation-text">
                  {entry.sender && entry.receiver 
                    ? `Nodo ${entry.sender} → Nodo ${entry.receiver}`
                    : entry.message || `Evento ${index + 1}`
                  }
                </span>
                {entry.t !== undefined && (
                  <span className="propagation-time">t={entry.t}</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="no-propagation">
            <p>No hay eventos de propagación aún</p>
            <p className="no-propagation-hint">Inicia una propagación para ver el historial</p>
          </div>
        );
    }
  };

  return (
    <div className="propagation-history">
      <h3 className="propagation-history-title">{customTitle}</h3>
      <div className="propagation-log">
        {renderContent()}
      </div>
    </div>
  );
}

PropagationHistory.propTypes = {
  propagationLog: PropTypes.array.isRequired,
  title: PropTypes.string,
  viewMode: PropTypes.string,
  selectedUser: PropTypes.string,
  onClose: PropTypes.func,
  emotionVector: PropTypes.object,
  showBaSIRPropagationResult: PropTypes.bool,
  showBaSISPropagationResult: PropTypes.bool,
  showHkSIRPropagationResult: PropTypes.bool,
  showHkSISPropagationResult: PropTypes.bool,
  onCloseBaSIRPropagationResult: PropTypes.func,
  onCloseBaSISPropagationResult: PropTypes.func,
  onCloseHkSIRPropagationResult: PropTypes.func,
  onCloseHkSISPropagationResult: PropTypes.func,
  // Props para el modal de centralidad
  isCentralityModalOpen: PropTypes.bool,
  setIsCentralityModalOpen: PropTypes.func,
  modalNode: PropTypes.object,
};