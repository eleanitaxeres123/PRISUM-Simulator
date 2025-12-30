import PropTypes from 'prop-types';
import { useState } from 'react';
import axios from 'axios';
import ThresholdsModal from './ThresholdsModal';
import MessagesDatasetModal from './MessagesDatasetModal';
import EmotionVectorModal from './EmotionVectorModal';
import PolicySeedingInput from './PolicySeedingInput';
import './PropagationModal.css';

export default function PropagationModal({
  isOpen,
  setIsOpen,
  selectedUser,
  setSelectedUser,
  message,
  setMessage,
  nodes,
  handlePropagation,
  propagationStatus,
  method,
  setMethod,
  thresholds,
  setThresholds,
  csvFile,
  xlsxFile,
  setEmotionVector,
  isBehaviorMode, // New prop to indicate behavior mode
  networkType = 'barabasi', // New prop to indicate network type: 'barabasi', 'holme-kim', 'real-world'
  isDirected = false, // New prop to indicate if the network is directed
}) {
  const defaultVector = {
    subjectivity: 0,
    polarity: 0,
    fear: 0,
    anger: 0,
    anticipation: 0,
    trust: 0,
    surprise: 0,
    sadness: 0,
    disgust: 0,
    joy: 0,
  };

  const [isThresholdsModalOpen, setIsThresholdsModalOpen] = useState(false);
  const [isMessagesDatasetModalOpen, setIsMessagesDatasetModalOpen] = useState(false);
  const [isEmotionVectorModalOpen, setIsEmotionVectorModalOpen] = useState(false);
  const [localEmotionVector, setLocalEmotionVector] = useState(defaultVector);
  const [analyzeStatus, setAnalyzeStatus] = useState('');
  const [messageSource, setMessageSource] = useState('write'); // 'write' or 'dataset'
  const [selectedDatasetMessage, setSelectedDatasetMessage] = useState(''); // Store dataset message separately
  const [selectedUsers, setSelectedUsers] = useState([]); // For policy seeding
  const [k, setK] = useState(nodes.length); // For K value
  const [policy, setPolicy] = useState('P0_aleatorio'); // For policy selection
  const [clusterFilter, setClusterFilter] = useState('todos'); // For cluster filtering
  const [propagationName, setPropagationName] = useState(''); // For propagation name

  const handleAnalyze = async (msg = message) => {
    if (!msg.trim()) {
      setAnalyzeStatus('Por favor, escribe un mensaje o selecciona uno del dataset.');
      return;
    }
    setAnalyzeStatus('Analizando mensaje...');
    try {
      const formData = new FormData();
      formData.append('message', msg);
      const response = await axios.post('http://localhost:8000/analyze-message', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newVector = response.data.vector;
      setLocalEmotionVector(newVector);
      setEmotionVector(newVector); // Update parent state
      setAnalyzeStatus('Análisis completado.');
      setIsEmotionVectorModalOpen(true); // Open the modal only after analysis
    } catch (error) {
      console.error('Analyze error:', error.response || error);
      setAnalyzeStatus(`Error: ${error.response?.data?.detail || error.message}`);
      setLocalEmotionVector(defaultVector);
      setEmotionVector(defaultVector); // Reset parent state
    }
  };

  const handleUpdateVector = async (updatedVector) => {
    setLocalEmotionVector(updatedVector);
    setEmotionVector(updatedVector); // Update parent state
    setAnalyzeStatus('Vector emocional actualizado.');
  };

  const handleMessageSourceChange = (source) => {
    setMessageSource(source);
    if (source === 'write') {
      setMessage(''); // Clear message when switching to write
      setLocalEmotionVector(defaultVector);
      setEmotionVector(defaultVector);
      setAnalyzeStatus('');
    }
  };

  const handleUsersChange = (users) => {
    setSelectedUsers(users);
    if (users.length > 0) {
      setSelectedUser(users[0].id);
    }
  };


  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={() => setIsOpen(false)} />
      <div className="modal">
        <h3 className="modal-title">Iniciar Propagación</h3>
        
        {/* Propagation Name Section */}
        <div className="propagation-name-container">
          <input
            id="propagation-name"
            type="text"
            value={propagationName}
            onChange={(e) => setPropagationName(e.target.value)}
            className="propagation-name-input"
            placeholder="Ej. Propagación PRISUM Test"
            maxLength="100"
          />
        </div>
        
        {/* Policy Seeding Section */}
        <div className="policy-seeding-container">
          <PolicySeedingInput
            nodes={nodes}
            selectedUsers={selectedUsers}
            onUsersChange={handleUsersChange}
            onKChange={setK}
            onPolicyChange={setPolicy}
            onClusterFilterChange={setClusterFilter}
            className="policy-seeding"
            labelClassName="policy-seeding-label"
            inputClassName="policy-seeding-input"
            selectClassName="policy-seeding-select"
            isDirected={isDirected}
            networkType={networkType}
            isBehaviorMode={isBehaviorMode}
          />
        </div>
        <div className="message-source-container">
          <div className="message-source-options">
            <label className="message-source-option">
              <input
                type="radio"
                name="messageSource"
                value="write"
                checked={messageSource === 'write'}
                onChange={() => handleMessageSourceChange('write')}
              />
              <span className="option-content">
                <span className="option-icon">✍️</span>
                <span className="option-text">Escribir Mensaje</span>
              </span>
            </label>
            <label className="message-source-option">
              <input
                type="radio"
                name="messageSource"
                value="dataset"
                checked={messageSource === 'dataset'}
                onChange={() => handleMessageSourceChange('dataset')}
              />
              <span className="option-content">
                <span className="option-icon">📊</span>
                <span className="option-text">Elegir del Dataset</span>
              </span>
            </label>
          </div>
        </div>
        {messageSource === 'write' && (
          <div className="textarea-container">
            <textarea
              placeholder="Escribe el mensaje a propagar..."
              value={message}
              onChange={e => {
                setMessage(e.target.value);
                setLocalEmotionVector(defaultVector);
                setEmotionVector(defaultVector);
                setAnalyzeStatus('');
              }}
              className="modal-textarea"
            />
            <button
              onClick={() => handleAnalyze(message)}
              disabled={!message.trim()}
              className={message.trim() ? 'button analyze-button' : 'button-disabled'}
            >
              Analizar Mensaje
            </button>
          </div>
        )}
        {messageSource === 'dataset' && (
          <div className="dataset-container">
            <button
              onClick={() => setIsMessagesDatasetModalOpen(true)}
              className="button dataset-button"
            >
              Seleccionar Mensaje del Dataset
            </button>
            {selectedDatasetMessage && (
              <button
                onClick={() => handleAnalyze(selectedDatasetMessage)}
                disabled={!selectedDatasetMessage.trim()}
                className={selectedDatasetMessage.trim() ? 'button analyze-button' : 'button-disabled'}
              >
                Analizar Mensaje
              </button>
            )}
            {selectedDatasetMessage && (
              <span className="modal-status">
                Mensaje seleccionado: {selectedDatasetMessage}
              </span>
            )}
          </div>
        )}
        {/* Botón de Modificar Vector */}
        {localEmotionVector && Object.values(localEmotionVector).some(val => val !== 0) && (
          <div className="vector-section">
            <button
              onClick={() => setIsEmotionVectorModalOpen(true)}
              className="button modify-vector-button"
            >
              Modificar Vector
            </button>
          </div>
        )}
        
        {/* Estado del Análisis */}
        {analyzeStatus && (
          <span className={analyzeStatus.startsWith('Error') ? 'modal-status-error' : 'modal-status'}>
            {analyzeStatus}
          </span>
        )}

        {/* Configuración */}
        <div className="configuration-section">
          <div className="configuration-content">
            <div className="method-selection">
              <span className="method-label">Tipo de Media Móvil</span>
              <select
                value={method}
                onChange={e => setMethod(e.target.value)}
                className="modal-select"
              >
                <option value="ema">Media Móvil Exponencial (EMA)</option>
                <option value="sma">Media Móvil Simple (SMA)</option>
              </select>
            </div>
            <button
              onClick={() => setIsThresholdsModalOpen(true)}
              className="button thresholds-button"
            >
              Configurar Umbrales
            </button>
          </div>
        </div>
        <button
          onClick={() => {
            if (!propagationName.trim()) {
              alert('Por favor, ingrese un nombre para la propagación.');
              return;
            }
            handlePropagation({
              selectedUser,
              message: messageSource === 'dataset' ? selectedDatasetMessage : message,
              method,
              thresholds,
              csvFile,
              xlsxFile,
              emotionVector: localEmotionVector,
              k,
              policy,
              clusterFiltering: clusterFilter,
              propagationName: propagationName.trim(),
            });
          }}
          disabled={!selectedUser || (!message.trim() && !selectedDatasetMessage.trim()) || (isBehaviorMode ? false : (!csvFile || !xlsxFile)) || !propagationName.trim()}
          className={selectedUser && (message.trim() || selectedDatasetMessage.trim()) && (isBehaviorMode || (csvFile && xlsxFile)) && propagationName.trim() ? 'button propagate-button' : 'button-disabled'}
        >
          Propagar Mensaje
        </button>
        {propagationStatus && (
          <span className={propagationStatus.startsWith('Error') ? 'modal-status-error' : 'modal-status'}>
            {propagationStatus}
          </span>
        )}
        <button
          onClick={() => setIsOpen(false)}
          className="modal-close-button"
        >
          Cerrar
        </button>
        <ThresholdsModal
          isOpen={isThresholdsModalOpen}
          setIsOpen={setIsThresholdsModalOpen}
          thresholds={thresholds}
          setThresholds={setThresholds}
        />
        <MessagesDatasetModal
          isOpen={isMessagesDatasetModalOpen}
          setIsOpen={setIsMessagesDatasetModalOpen}
          setMessage={setSelectedDatasetMessage}
          onMessageSelect={() => {}}
        />
        <EmotionVectorModal
          isOpen={isEmotionVectorModalOpen}
          setIsOpen={setIsEmotionVectorModalOpen}
          vector={localEmotionVector}
          setVector={handleUpdateVector}
        />
      </div>
    </>
  );
}

PropagationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  selectedUser: PropTypes.string.isRequired,
  setSelectedUser: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
  setMessage: PropTypes.func.isRequired,
  nodes: PropTypes.arrayOf(PropTypes.object).isRequired,
  handlePropagation: PropTypes.func.isRequired,
  propagationStatus: PropTypes.string.isRequired,
  method: PropTypes.string.isRequired,
  setMethod: PropTypes.func.isRequired,
  thresholds: PropTypes.object.isRequired,
  setThresholds: PropTypes.func.isRequired,
  csvFile: PropTypes.any,
  xlsxFile: PropTypes.any,
  setEmotionVector: PropTypes.func.isRequired,
  isBehaviorMode: PropTypes.bool, // New prop
  networkType: PropTypes.string, // New prop for network type
  isDirected: PropTypes.bool, // New prop for directed networks
};

PropagationModal.defaultProps = {
  isBehaviorMode: false,
  networkType: 'barabasi',
  isDirected: false,
};