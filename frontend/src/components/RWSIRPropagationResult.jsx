import PropTypes from 'prop-types';
import { useState, useEffect, useRef } from 'react';
import './BaSIRPropagationResult.css';

export default function RWSIRPropagationResult({ selectedUser, onClose }) {
  const [logEntries, setLogEntries] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1); // Start with -1 to show nothing until first event
  const [isPropagationFinished, setIsPropagationFinished] = useState(false); // Estado para finalización
  const logTableRef = useRef(null);
  const isUserScrolling = useRef(false);

  // Handle scroll to detect user interaction
  useEffect(() => {
    const handleScroll = () => {
      if (logTableRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = logTableRef.current;
        isUserScrolling.current = scrollTop + clientHeight < scrollHeight - 10;
        if (scrollTop + clientHeight >= scrollHeight - 10) {
          isUserScrolling.current = false;
        }
      }
    };

    const table = logTableRef.current;
    if (table) {
      table.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (table) {
        table.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Handle propagation events and completion
  useEffect(() => {
    const handlePropagationStart = () => {
      setLogEntries([]);
      setCurrentIndex(-1);
      setIsPropagationFinished(false);
    };

    const handlePropagationUpdate = (event) => {
      const { t, sender, receiver, state } = event.detail;
      const newEntry = { t, sender, receiver, state };
      setLogEntries((prev) => [...prev, newEntry]);
      setCurrentIndex((prev) => prev + 1);

      // Auto-scroll to bottom if user isn't scrolling manually
      if (logTableRef.current && !isUserScrolling.current) {
        requestAnimationFrame(() => {
          if (logTableRef.current) {
            logTableRef.current.scrollTo({
              top: logTableRef.current.scrollHeight,
              behavior: 'smooth',
            });
          }
        });
      }
    };

    const handlePropagationFinished = () => {
      setIsPropagationFinished(true);
    };

    window.addEventListener('rwSIRPropagationStart', handlePropagationStart);
    window.addEventListener('rwSIRPropagationUpdate', handlePropagationUpdate);
    window.addEventListener('rwSIRPropagationFinished', handlePropagationFinished);

    return () => {
      window.removeEventListener('rwSIRPropagationStart', handlePropagationStart);
      window.removeEventListener('rwSIRPropagationUpdate', handlePropagationUpdate);
      window.removeEventListener('rwSIRPropagationFinished', handlePropagationFinished);
    };
  }, []);

  // Handle close button to clear history
  const handleClose = () => {
    setLogEntries([]);
    setCurrentIndex(-1);
    setIsPropagationFinished(false);
    onClose();
  };

  // Handle manual navigation to previous entries
  const handleRowClick = (index) => {
    setCurrentIndex(index);
    isUserScrolling.current = true;
  };

  if (logEntries.length === 0 || currentIndex < 0) {
    return (
      <div className="ba-sir-propagation-result">
        <div className="propagation-result-content" ref={logTableRef}>
          <div className="header">
            <h2 className="title">Propagación SIR</h2>
          </div>
          <div className="summary">
            <p>
              <strong>Usuario Origen:</strong> {selectedUser}
            </p>
          </div>
          <div className="log-table">
            <div className="log-header">
              <span>Emisor</span>
              <span>Receptor</span>
              <span>Estado</span>
            </div>
            <div className="log-row empty">
              <span>Esperando propagación...</span>
              <span>-</span>
              <span>-</span>
            </div>
          </div>
          {isPropagationFinished && (
            <div className="propagation-finished">
              <p>Propagación Finalizada</p>
            </div>
          )}
          <button className="close-button-bottom" onClick={handleClose}>
            Cerrar Informe
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ba-sir-propagation-result">
      <div className="propagation-result-content" ref={logTableRef}>
        <div className="header">
          <h2 className="title">Propagación SIR</h2>
        </div>
        <div className="summary">
          <p>
            <strong>Usuario Origen:</strong> {selectedUser}
          </p>
        </div>
        <div className="log-table">
          <div className="log-header">
            <span>Emisor</span>
            <span>Receptor</span>
            <span>Estado</span>
          </div>
          {logEntries.map((entry, index) => (
            <div
              key={`${entry.sender}-${entry.receiver}-${index}`}
              className={`log-row ${index === currentIndex ? 'latest-entry' : ''}`}
              onClick={() => handleRowClick(index)}
              style={{ display: index <= currentIndex ? 'grid' : 'none' }}
            >
              <span>{entry.sender}</span>
              <span>{entry.receiver}</span>
              <span>{entry.state === 'infected' ? 'Infectado' : 'Recuperado'}</span>
            </div>
          ))}
        </div>
        {isPropagationFinished && (
          <div className="propagation-finished">
            <p>Propagación Finalizada</p>
          </div>
        )}
        <button className="close-button-bottom" onClick={handleClose}>
          Cerrar Informe
        </button>
      </div>
    </div>
  );
}

RWSIRPropagationResult.propTypes = {
  selectedUser: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};