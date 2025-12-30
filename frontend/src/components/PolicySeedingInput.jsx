import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

const PolicySeedingInput = ({ 
  nodes, 
  selectedUsers, 
  onUsersChange, 
  onKChange,
  onPolicyChange,
  onClusterFilterChange,
  className = '',
  labelClassName = '',
  inputClassName = '',
  selectClassName = '',
  isDirected = false, // Recibir explícitamente el tipo de grafo
  networkType = 'barabasi', // Tipo de red para determinar si mostrar filtro de clusters
  isBehaviorMode = false // Modo de comportamiento (RIP DNS)
}) => {
  const [k, setK] = useState(nodes.length);
  const [policy, setPolicy] = useState('P0_aleatorio');
  const [clusterFilter, setClusterFilter] = useState('todos');

  // Políticas disponibles
  const policies = [
    {
      id: 'P0_aleatorio',
      name: 'P0 - Aleatorio',
      description: 'Selecciona k nodos al azar con semilla fija (42)'
    },
    {
      id: 'P1_nodos_centrales',
      name: 'P1 - Nodos Centrales (Centrality)',
      description: isDirected 
        ? 'Selecciona los k nodos con mayor centralidad de grado de salida (dirigido)'
        : 'Selecciona los k nodos con mayor centralidad de grado total (no dirigido)'
    },
    {
      id: 'P2_influencia',
      name: 'P2 - Influencia (Eigenvector - PageRank)',
      description: isDirected 
        ? 'Selecciona los k nodos con mayor PageRank (dirigido)'
        : 'Selecciona los k nodos con mayor centralidad de eigenvector (no dirigido)'
    },
    {
      id: 'P3_puentes',
      name: 'P3 - Puentes (Betweenness)',
      description: 'Selecciona los k nodos con mayor centralidad de intermediación'
    }
  ];

  // Función para obtener la métrica correspondiente a la política
  const getMetricValue = (node, policyId) => {
    let metricValue;
    switch (policyId) {
      case 'P1_nodos_centrales':
        metricValue = isDirected ? node.degreeCentralityOut : node.degreeCentrality;
        break;
      case 'P2_influencia':
        metricValue = isDirected ? node.pagerankCentrality : node.eigenvectorCentrality;
        break;
      case 'P3_puentes':
        metricValue = node.betweennessCentrality;
        break;
      default:
        metricValue = 0;
    }
    
    // Debug temporal para verificar métricas
    if (policyId === 'P1_nodos_centrales' || policyId === 'P2_influencia') {
      // Debug information removed
    }
    
    return metricValue;
  };

  // Función para obtener el nombre de la métrica
  const getMetricName = (policyId) => {
    switch (policyId) {
      case 'P1_nodos_centrales':
        return isDirected ? 'Centralidad de Grado (Salida)' : 'Centralidad de Grado (Total)';
      case 'P2_influencia':
        return isDirected ? 'PageRank' : 'Centralidad de Eigenvector';
      case 'P3_puentes':
        return 'Centralidad de Intermediación';
      default:
        return 'Aleatorio';
    }
  };

  // Filtrar nodos por cluster (solo para RIP DNS)
  const filteredNodes = useMemo(() => {
    // Solo aplicar filtro de cluster para RIP DNS (isBehaviorMode = true)
    if (isBehaviorMode) {
      if (clusterFilter === 'todos') {
        return nodes;
      }
      
      const clusterNumber = parseInt(clusterFilter);
      return nodes.filter(node => {
        // Para Barabasi y HolmeKim, el cluster está en el vector generado
        if (networkType === 'barabasi' || networkType === 'holme-kim') {
          return node.cluster === clusterNumber;
        }
        // Para RealWorld, el cluster está en el archivo de vectores subido
        if (networkType === 'real-world') {
          return node.cluster === clusterNumber;
        }
        return true;
      });
    }
    
    // Para SIS y SIR, no aplicar filtro de cluster
    return nodes;
  }, [nodes, clusterFilter, networkType, isBehaviorMode]);

  // Actualizar K cuando cambien los nodos o el filtro de cluster
  useEffect(() => {
    setK(filteredNodes.length);
  }, [filteredNodes.length]);

  // Notificar cambios de K al componente padre
  useEffect(() => {
    if (onKChange) {
      onKChange(k);
    }
  }, [k, onKChange]);

  // Notificar cambios de Policy al componente padre
  useEffect(() => {
    if (onPolicyChange) {
      onPolicyChange(policy);
    }
  }, [policy, onPolicyChange]);

  // Notificar cambios de Cluster Filter al componente padre
  useEffect(() => {
    if (onClusterFilterChange) {
      onClusterFilterChange(clusterFilter);
    }
  }, [clusterFilter, onClusterFilterChange]);

  // Nodos ordenados según la política seleccionada
  const sortedNodes = useMemo(() => {
    if (policy === 'P0_aleatorio') {
      // Para aleatorio, usar semilla fija para reproducibilidad
      const seed = 42;
      const seededRandom = (seed) => {
        let x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
      };
      
      const seededShuffle = [...filteredNodes];
      for (let i = seededShuffle.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom(seed + i) * (i + 1));
        [seededShuffle[i], seededShuffle[j]] = [seededShuffle[j], seededShuffle[i]];
      }
      return seededShuffle;
    }

    // Para políticas basadas en centralidad, ordenar de mayor a menor
    return [...filteredNodes].sort((a, b) => {
      const metricA = getMetricValue(a, policy);
      const metricB = getMetricValue(b, policy);
      return metricB - metricA;
    });
  }, [filteredNodes, policy, isDirected]);

  // Nodos seleccionados según k y política
  const selectedNodes = useMemo(() => {
    return sortedNodes.slice(0, Math.min(k, filteredNodes.length));
  }, [sortedNodes, k, filteredNodes.length]);

  // Actualizar usuarios seleccionados cuando cambien k, política o nodos
  useEffect(() => {
    // Siempre asegurar que hay al menos un nodo seleccionado
    if (selectedNodes.length > 0) {
      // Si no hay selección previa, seleccionar el primer nodo automáticamente
      if (selectedUsers.length === 0 || !selectedUsers[0]) {
        onUsersChange([selectedNodes[0]]);
      } else {
        // Verificar si el nodo seleccionado actualmente sigue estando disponible
        const currentSelected = selectedUsers[0];
        const isStillAvailable = selectedNodes.some(node => node.id === currentSelected.id);
        
        if (!isStillAvailable) {
          // Si el nodo seleccionado ya no está disponible, seleccionar el primero
          onUsersChange([selectedNodes[0]]);
        }
      }
    }
  }, [selectedNodes, onUsersChange, selectedUsers]);

  // Validar k
  const maxK = filteredNodes.length;
  const validK = Math.max(1, Math.min(k, maxK));

  return (
    <>
      {/* Filtro de Cluster y Política (solo para RIP DNS) */}
      {isBehaviorMode && (
        <div className="policy-seeding-row">
          <div className={`${className}-input-container`}>
            <label htmlFor="cluster-filter" className={labelClassName}>
              Filtro de Cluster
            </label>
            <select
              id="cluster-filter"
              value={clusterFilter}
              onChange={(e) => setClusterFilter(e.target.value)}
              className={selectClassName}
            >
              <option value="todos">Todos los Clusters</option>
              <option value="0">Cluster 0</option>
              <option value="1">Cluster 1</option>
              <option value="2">Cluster 2</option>
              <option value="3">Cluster 3</option>
            </select>
          </div>

          {/* Select para Política */}
          <div className={`${className}-input-container`}>
            <label htmlFor="policy-select" className={labelClassName}>
              Política
            </label>
            <select
              id="policy-select"
              value={policy}
              onChange={(e) => setPolicy(e.target.value)}
              className={selectClassName}
            >
              {policies.map(pol => (
                <option key={pol.id} value={pol.id} title={pol.description}>
                  {pol.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* K y Nodo Inicial (solo para RIP DNS) */}
      {isBehaviorMode && (
        <div className="policy-seeding-row">
          {/* Input para K */}
          <div className={`${className}-input-container`}>
            <label htmlFor="k-value" className={labelClassName}>
              K
            </label>
            <input
              id="k-value"
              type="number"
              min="1"
              max={maxK}
              value={validK}
              onChange={(e) => setK(parseInt(e.target.value) || 1)}
              className={inputClassName}
              placeholder="Ej. 5"
            />
          </div>

          <div className={`${className}-input-container`}>
            <label htmlFor="selected-user" className={labelClassName}>
              Nodo Inicial
            </label>
            <select
              id="selected-user"
              value={selectedUsers[0]?.id || ''}
              onChange={(e) => {
                if (e.target.value === '') {
                  onUsersChange([]);
                } else {
                  const selectedNode = selectedNodes.find(node => node.id === e.target.value);
                  if (selectedNode) {
                    onUsersChange([selectedNode]);
                  }
                }
              }}
              className={selectClassName}
            >
              <option value="">Selecciona un nodo</option>
              {selectedNodes.map((node, index) => {
                const metricValue = getMetricValue(node, policy);
                const metricName = getMetricName(policy);
                return (
                  <option key={node.id} value={node.id}>
                    {node.id} {policy !== 'P0_aleatorio' && `(${metricValue?.toFixed(3) || 'N/A'})`}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      )}

      {/* Primera fila: K y Política (solo para SIS/SIR) */}
      {!isBehaviorMode && (
        <div className="policy-seeding-row">
          {/* Input para K */}
          <div className={`${className}-input-container`}>
            <label htmlFor="k-value" className={labelClassName}>
              K
            </label>
            <input
              id="k-value"
              type="number"
              min="1"
              max={maxK}
              value={validK}
              onChange={(e) => setK(parseInt(e.target.value) || 1)}
              className={inputClassName}
              placeholder="Ej. 5"
            />
          </div>

          {/* Select para Política */}
          <div className={`${className}-input-container`}>
            <label htmlFor="policy-select" className={labelClassName}>
              Política
            </label>
            <select
              id="policy-select"
              value={policy}
              onChange={(e) => setPolicy(e.target.value)}
              className={selectClassName}
            >
              {policies.map(pol => (
                <option key={pol.id} value={pol.id} title={pol.description}>
                  {pol.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Segunda fila: Usuario (solo para SIS/SIR) */}
      {!isBehaviorMode && (
        <div className="policy-seeding-row">
          {/* Select para Usuarios (permite selección de un solo nodo) */}
          <div className={`${className}-input-container`}>
            <label htmlFor="selected-user" className={labelClassName}>
              Nodo Inicial
            </label>
            <select
              id="selected-user"
              value={selectedUsers[0]?.id || ''}
              onChange={(e) => {
                if (e.target.value === '') {
                  onUsersChange([]);
                } else {
                  const selectedNode = selectedNodes.find(node => node.id === e.target.value);
                  if (selectedNode) {
                    onUsersChange([selectedNode]);
                  }
                }
              }}
              className={selectClassName}
            >
              <option value="">Selecciona un nodo</option>
              {selectedNodes.map((node, index) => {
                const metricValue = getMetricValue(node, policy);
                const metricName = getMetricName(policy);
                return (
                  <option key={node.id} value={node.id}>
                    {node.id} {policy !== 'P0_aleatorio' && `(${metricValue?.toFixed(3) || 'N/A'})`}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      )}
    </>
  );
};

PolicySeedingInput.propTypes = {
  nodes: PropTypes.array.isRequired,
  selectedUsers: PropTypes.array,
  onUsersChange: PropTypes.func.isRequired,
  onKChange: PropTypes.func,
  onPolicyChange: PropTypes.func,
  onClusterFilterChange: PropTypes.func,
  className: PropTypes.string,
  labelClassName: PropTypes.string,
  inputClassName: PropTypes.string,
  selectClassName: PropTypes.string,
  isDirected: PropTypes.bool,
  networkType: PropTypes.string,
  isBehaviorMode: PropTypes.bool,
};

export default PolicySeedingInput;
