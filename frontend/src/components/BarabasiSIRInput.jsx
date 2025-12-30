import { useState } from 'react';
import PropTypes from 'prop-types';
import PolicySeedingInput from './PolicySeedingInput';
import './BarabasiSIRInput.css';
import './PolicySeedingInput.css';

export default function BarabasiSIRInput({ nodes, onStartPropagation }) {
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
      alert('Por favor, genere una red en la sección Barabási-Albert primero.');
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
    <div className="sir-navbar">
      <div className="sir-navbar-controls">
        <div className="sir-input-container">
          <label htmlFor="beta" className="sir-label">Tasa de Infección (β)</label>
          <input
            id="beta"
            type="number"
            step="0.01"
            value={beta}
            onChange={(e) => setBeta(e.target.value)}
            className="sir-input"
            placeholder="Ej. 0.3"
            min="0"
            max="1"
          />
        </div>
        <div className="sir-input-container">
          <label htmlFor="gamma" className="sir-label">Tasa de Recuperación (γ)</label>
          <input
            id="gamma"
            type="number"
            step="0.01"
            value={gamma}
            onChange={(e) => setGamma(e.target.value)}
            className="sir-input"
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
          className="sir"
          labelClassName="sir-label"
          inputClassName="sir-input"
          selectClassName="sir-input"
          isDirected={false}
        />

        <div className="sir-input-container">
          <label htmlFor="sir-propagation-name" className="sir-label">Nombre de Propagación</label>
          <input
            id="sir-propagation-name"
            type="text"
            value={propagationName}
            onChange={(e) => setPropagationName(e.target.value)}
            className="sir-input"
            placeholder="Ej. Propagación SIR Test"
            maxLength="100"
          />
        </div>
        <div className="sir-button-container">
          <button onClick={handlePropagation} className="sir-button">
            Iniciar Propagación
          </button>
        </div>
      </div>
    </div>
  );
}

BarabasiSIRInput.propTypes = {
  nodes: PropTypes.array.isRequired,
  onStartPropagation: PropTypes.func.isRequired,
};