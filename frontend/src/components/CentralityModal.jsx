// src/components/CentralityModal.jsx
import PropTypes from 'prop-types';
import './PropagationHistory.css';

export default function CentralityModal({ isOpen, setIsOpen, modalNode }) {
  if (!isOpen || !modalNode) return null;

  return (
    <div className="centrality-modal-container">
      <h3 className="centrality-modal-title">Métricas de Centralidad: {modalNode.id}</h3>
      <div className="centrality-content">
        <div className="centrality-section">
          <div className="centrality-metrics">
            <div className="centrality-metric">
              <span className="metric-label">Centralidad de Grado (Entrada)</span>
              <span className="metric-value">{modalNode.degreeCentralityIn?.toFixed(3) ?? 'N/A'}</span>
            </div>
            <div className="centrality-metric">
              <span className="metric-label">Centralidad de Grado (Salida)</span>
              <span className="metric-value">{modalNode.degreeCentralityOut?.toFixed(3) ?? 'N/A'}</span>
            </div>
            <div className="centrality-metric">
              <span className="metric-label">Centralidad de Grado (Total)</span>
              <span className="metric-value">{modalNode.degreeCentrality?.toFixed(3) ?? 'N/A'}</span>
            </div>
            <div className="centrality-metric">
              <span className="metric-label">Centralidad de Intermediación</span>
              <span className="metric-value">{modalNode.betweennessCentrality?.toFixed(3) ?? 'N/A'}</span>
            </div>
            <div className="centrality-metric">
              <span className="metric-label">Centralidad de Cercanía</span>
              <span className="metric-value">{modalNode.closenessCentrality?.toFixed(3) ?? 'N/A'}</span>
            </div>
            <div className="centrality-metric">
              <span className="metric-label">Centralidad de Eigenvector</span>
              <span className="metric-value">{modalNode.eigenvectorCentrality?.toFixed(3) ?? 'N/A'}</span>
            </div>
            <div className="centrality-metric">
              <span className="metric-label">PageRank</span>
              <span className="metric-value">{modalNode.pagerankCentrality?.toFixed(3) ?? 'N/A'}</span>
            </div>
          </div>
        </div>
        <div className="centrality-footer">
          <button
            onClick={() => setIsOpen(false)}
            className="centrality-close-button"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

CentralityModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  modalNode: PropTypes.shape({
    id: PropTypes.string,
    degreeCentralityIn: PropTypes.number,
    degreeCentralityOut: PropTypes.number,
    degreeCentrality: PropTypes.number,
    betweennessCentrality: PropTypes.number,
    closenessCentrality: PropTypes.number,
    eigenvectorCentrality: PropTypes.number,
    pagerankCentrality: PropTypes.number,
  }),
};