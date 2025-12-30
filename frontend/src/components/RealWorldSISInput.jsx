import { useState } from 'react';
import PropTypes from 'prop-types';
import PolicySeedingInput from './PolicySeedingInput';
import './RealWorldSISInput.css';
import './PolicySeedingInput.css';

export default function RealWorldSISInput({ nodes, onStartPropagation }) {
  const [beta, setBeta] = useState('');
  const [gamma, setGamma] = useState('');
  const [propagationName, setPropagationName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [k, setK] = useState(nodes.length);
  const [policy, setPolicy] = useState('P0_aleatorio');

  const handlePropagation = () => {
    const betaVal = parseFloat(beta);
    const gammaVal = parseFloat(gamma);
    if (!nodes.length) {
      alert('Por favor, genere una red en la sección Real World primero.');
      return;
    }
    if (!selectedUsers.length) {
      alert('Por favor, seleccione al menos un nodo inicial.');
      return;
    }
    if (isNaN(betaVal) || betaVal < 0 || betaVal > 1) {
      alert('Por favor, ingrese un valor válido para β (entre 0 y 1).');
      return;
    }
    if (isNaN(gammaVal) || gammaVal < 0 || gammaVal > 1) {
      alert('Por favor, ingrese un valor válido para γ (entre 0 y 1).');
      return;
    }
    if (!propagationName.trim()) {
      alert('Por favor, ingrese un nombre para la propagación.');
      return;
    }
    onStartPropagation({ 
      beta: betaVal, 
      gamma: gammaVal, 
      propagationName: propagationName.trim(),
      k: k, 
      policy: policy, 
      selectedUser: selectedUsers[0]?.id 
    });
  };

  return (
    <div className="sis-navbar">
      <div className="sis-navbar-controls">
        <div className="sis-input-container">
          <label htmlFor="beta" className="sis-label">Tasa de Infección (β)</label>
          <input
            id="beta"
            type="number"
            step="0.01"
            value={beta}
            onChange={(e) => setBeta(e.target.value)}
            className="sis-input"
            placeholder="Ej. 0.3"
            min="0"
            max="1"
          />
        </div>
        <div className="sis-input-container">
          <label htmlFor="gamma" className="sis-label">Tasa de Recuperación (γ)</label>
          <input
            id="gamma"
            type="number"
            step="0.01"
            value={gamma}
            onChange={(e) => setGamma(e.target.value)}
            className="sis-input"
            placeholder="Ej. 0.1"
            min="0"
            max="1"
          />
        </div>

        <PolicySeedingInput
          nodes={nodes}
          selectedUsers={selectedUsers}
          onUsersChange={setSelectedUsers}
          onKChange={setK}
          onPolicyChange={setPolicy}
          className="sis"
          labelClassName="sis-label"
          inputClassName="sis-input"
          selectClassName="sis-input"
          isDirected={true}
        />

      <div className="sis-input-container">
          <label htmlFor="rw-sis-propagation-name" className="sis-label">Nombre de Propagación</label>
          <input
            id="rw-sis-propagation-name"
            type="text"
            value={propagationName}
            onChange={(e) => setPropagationName(e.target.value)}
            className="sis-input"
            placeholder="Ej. Propagación SIS HR"
            maxLength="100"
          />
        </div>
        <div className="sis-button-container">
          <button onClick={handlePropagation} className="sis-button">
            Iniciar Propagación
          </button>
        </div>
      </div>
    </div>
  );
}

RealWorldSISInput.propTypes = {
  nodes: PropTypes.array.isRequired,
  onStartPropagation: PropTypes.func.isRequired,
};