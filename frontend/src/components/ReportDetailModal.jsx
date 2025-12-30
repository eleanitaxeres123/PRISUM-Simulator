import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import './ReportDetailModal.css';
import BaSIRPropagationResult from './BaSIRPropagationResult';
import BaSISPropagationResult from './BaSISPropagationResult';
import PropagationResult from './PropagationResult';

// Register Chart.js components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function ReportDetailModal({ report, onClose }) {
  const [propagationLog, setPropagationLog] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  useEffect(() => {
    if (report && report.log) {
      setPropagationLog(report.log);
    }
  }, [report]);

  // Etiquetas de emociones en español (igual que PropagationResult)
  const emotionKeys = [
    'subjetividad', 'polaridad', 'miedo', 'ira', 'anticipación',
    'confianza', 'sorpresa', 'tristeza', 'disgusto', 'alegría'
  ];

  // Colores para emociones (igual que PropagationResult)
  const emotionColors = {
    subjetividad: '#6366f1',
    polaridad: '#8b5cf6',
    miedo: '#A100A1',
    ira: '#FF0000',
    anticipación: '#FF6200',
    confianza: '#00CED1',
    sorpresa: '#FF69B4',
    tristeza: '#4682B4',
    disgusto: '#00FF00',
    alegría: '#FFFF00'
  };

  // Función para formatear vectores como tabla de emociones (igual que PropagationResult)
  const formatVector = (vector) => {
    if (!vector || !Array.isArray(vector)) {
      return (
        <div className="vector-error">
          <span>Vector no disponible</span>
        </div>
      );
    }

    return (
      <div className="emotion-table-container">
        <table className="emotion-table">
          <thead>
            <tr>
              {emotionKeys.map((key) => (
                <th
                  key={key}
                  className="emotion-header"
                  style={{
                    backgroundColor: `${emotionColors[key]}20`,
                    borderColor: emotionColors[key]
                  }}
                >
                  <span className="emotion-label">{key.toUpperCase()}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {vector.map((value, i) => (
                <td
                  key={i}
                  className="emotion-value"
                  style={{
                    color: emotionColors[emotionKeys[i]] || '#374151',
                    backgroundColor: `${emotionColors[emotionKeys[i]] || '#374151'}15`
                  }}
                >
                  <span className="value-text">
                    {value?.toFixed(2) ?? 'N/A'}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  // Mapeo de acciones al español
  const actionTranslations = {
    'publish': 'Publicar',
    'forward': 'Reenviar',
    'modify': 'Modificar',
    'modificar': 'Modificar',
    'reenviar': 'Reenviar',
    'ignore': 'Ignorar',
    'reject': 'Rechazar',
    'rechazar': 'Rechazar',
    'recovered': 'Recuperado',
    'infected': 'Infectado',
    'susceptible': 'Susceptible',
    'forward (repeated)': 'Reenviar (repetido)'
  };

  // Mapeo de estados al español
  const stateTranslations = {
    'S': 'Susceptible',
    'I': 'Infectado',
    'R': 'Recuperado',
    'susceptible': 'Susceptible',
    'infected': 'Infectado',
    'recovered': 'Recuperado'
  };

  // Función para traducir acciones
  const translateAction = (action) => {
    if (!action) return 'N/A';
    return actionTranslations[action.toLowerCase()] || action;
  };

  // Función para traducir estados
  const translateState = (state) => {
    if (!state) return 'N/A';
    if (typeof state === 'object') {
      return JSON.stringify(state);
    }
    return stateTranslations[String(state).toLowerCase()] || String(state);
  };

  // Función helper para formatear estados simples
  const formatSimpleState = (data) => {
    if (!data) return 'N/A';
    
    if (typeof data === 'object') {
      return JSON.stringify(data);
    }
    
    return translateState(data);
  };

  // Función para extraer nodos involucrados del log de propagación
  const getInvolvedNodes = () => {
    if (!propagationLog || propagationLog.length === 0) return [];

    const nodeMap = new Map();

    propagationLog.forEach(entry => {
      const receiver = entry.receiver;
      const sender = entry.sender;

      // Procesar receptor
      if (receiver && !nodeMap.has(receiver)) {
        const initialState = entry.state_in_before && Array.isArray(entry.state_in_before) 
          ? entry.state_in_before.map(Number) 
          : Array(10).fill(0);
        
        const finalState = entry.state_in_after && Array.isArray(entry.state_in_after) 
          ? entry.state_in_after.map(Number) 
          : Array(10).fill(0);

        nodeMap.set(receiver, {
          id: receiver,
          initialState,
          finalState
        });
      } else if (receiver && nodeMap.has(receiver)) {
        // Actualizar estado final si es más reciente
        const finalState = entry.state_in_after && Array.isArray(entry.state_in_after) 
          ? entry.state_in_after.map(Number) 
          : Array(10).fill(0);
        
        const node = nodeMap.get(receiver);
        node.finalState = finalState;
      }

      // Procesar emisor si es diferente del receptor
      if (sender && sender !== receiver && !nodeMap.has(sender)) {
        const initialState = entry.state_out_before && Array.isArray(entry.state_out_before) 
          ? entry.state_out_before.map(Number) 
          : Array(10).fill(0);
        
        const finalState = entry.state_out_after && Array.isArray(entry.state_out_after) 
          ? entry.state_out_after.map(Number) 
          : Array(10).fill(0);

        nodeMap.set(sender, {
          id: sender,
          initialState,
          finalState
        });
      } else if (sender && sender !== receiver && nodeMap.has(sender)) {
        // Actualizar estado final si es más reciente
        const finalState = entry.state_out_after && Array.isArray(entry.state_out_after) 
          ? entry.state_out_after.map(Number) 
          : Array(10).fill(0);
        
        const node = nodeMap.get(sender);
        node.finalState = finalState;
      }
    });

    return Array.from(nodeMap.values());
  };

  // Spanish labels for display
  const emotionLabels = {
    subjetividad: 'Subjetividad',
    polaridad: 'Polaridad',
    miedo: 'Miedo',
    ira: 'Ira',
    anticipación: 'Anticipación',
    confianza: 'Confianza',
    sorpresa: 'Sorpresa',
    tristeza: 'Tristeza',
    disgusto: 'Disgusto',
    alegría: 'Alegría'
  };

  // Radar chart options
  const chartOptions = {
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(0, 0, 0, 0.3)',
          lineWidth: 1,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.2)',
          lineWidth: 1,
        },
        ticks: {
          display: true,
          backdropColor: 'transparent',
          color: '#000000',
          font: {
            size: 12,
            family: "'Inter', 'Roboto', sans-serif",
          },
          stepSize: 0.2,
        },
        pointLabels: {
          color: '#000000',
          font: {
            size: 14,
            family: "'Inter', 'Roboto', sans-serif",
            weight: 'normal',
          },
          padding: 10,
        },
        suggestedMin: 0,
        suggestedMax: 1,
      },
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#000000',
          font: {
            size: 14,
            family: "'Inter', 'Roboto', sans-serif",
            weight: 'normal',
          },
          boxWidth: 20,
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#000000',
        bodyColor: '#333333',
        padding: 12,
        cornerRadius: 6,
        borderColor: '#000000',
        borderWidth: 1,
      },
    },
    elements: {
      line: {
        borderWidth: 2,
        tension: 0.2,
      },
      point: {
        radius: 4,
        backgroundColor: '#ffffff',
        borderWidth: 2,
        borderColor: '#000000',
      },
    },
  };

  // Get selected node
  const selectedNode = getInvolvedNodes().find(node => node.id === selectedNodeId);

  // Get state_out_before and state_out_after from propagationLog
  const getOutStates = (nodeId) => {
    const nodeHistory = propagationLog
      .filter(entry => entry.receiver === nodeId || (entry.publisher === nodeId))
      .sort((a, b) => a.t - b.t);

    let stateOutBefore = null;
    let stateOutAfter = null;

    if (nodeHistory.length > 0) {
      const publishEntry = nodeHistory.find(entry => entry.action === 'publish' && entry.t === 0);
      if (publishEntry) {
        stateOutBefore = publishEntry.state_out_before;
        stateOutAfter = nodeHistory[nodeHistory.length - 1].state_out_after;
      } else {
        stateOutBefore = nodeHistory[0].state_out_before;
        stateOutAfter = nodeHistory[nodeHistory.length - 1].state_out_after;
      }
    }

    stateOutBefore = stateOutBefore && Array.isArray(stateOutBefore) && stateOutBefore.length === 10
      ? stateOutBefore.map(Number)
      : Array(10).fill(0);

    stateOutAfter = stateOutAfter && Array.isArray(stateOutAfter) && stateOutAfter.length === 10
      ? stateOutAfter.map(Number)
      : Array(10).fill(0);

    return { stateOutBefore, stateOutAfter };
  };

  // Función para verificar si hay datos válidos para state_in
  const hasValidStateInData = (node) => {
    if (!node) return false;
    
    // Verificar si el nodo es el usuario semilla
    const isSeedUser = report && report.user && node.id === report.user;
    
    // Si es el nodo semilla, no tiene datos de entrada
    if (isSeedUser) return false;
    
    // Verificar si hay datos válidos en initialState y finalState
    const hasInitialData = node.initialState && 
      Array.isArray(node.initialState) && 
      node.initialState.length === 10 && 
      node.initialState.some(val => val !== 0);
    
    const hasFinalData = node.finalState && 
      Array.isArray(node.finalState) && 
      node.finalState.length === 10 && 
      node.finalState.some(val => val !== 0);
    
    return hasInitialData || hasFinalData;
  };

  // Prepare radar chart data for state_in
  const chartDataIn = selectedNode && hasValidStateInData(selectedNode)
    ? {
        labels: emotionKeys.map(key => emotionLabels[key]),
        datasets: [
          {
            label: 'Estado Inicial',
            data: selectedNode.initialState,
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            borderColor: '#EF4444',
            borderWidth: 2,
            pointBackgroundColor: '#EF4444',
            pointBorderColor: '#ffffff',
            fill: true,
          },
          {
            label: 'Estado Final',
            data: selectedNode.finalState,
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: '#3B82F6',
            borderWidth: 2,
            pointBackgroundColor: '#3B82F6',
            pointBorderColor: '#ffffff',
            fill: true,
          },
        ],
      }
    : null;

  // Prepare radar chart data for state_out
  const chartDataOut = selectedNode
    ? (() => {
        const { stateOutBefore, stateOutAfter } = getOutStates(selectedNode.id);
        return {
          labels: emotionKeys.map(key => emotionLabels[key]),
          datasets: [
            {
              label: 'Estado Inicial',
              data: stateOutBefore,
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              borderColor: '#EF4444',
              borderWidth: 2,
              pointBackgroundColor: '#EF4444',
              pointBorderColor: '#ffffff',
              fill: true,
            },
            {
              label: 'Estado Final',
              data: stateOutAfter,
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              borderColor: '#3B82F6',
              borderWidth: 2,
              pointBackgroundColor: '#3B82F6',
              pointBorderColor: '#ffffff',
              fill: true,
            },
          ],
        };
      })()
    : null;

  const getPropagationMethod = () => {
    if (!report) return '';
    return report.metodo || report.propagationMethod || '';
  };

  const getNetworkType = () => {
    if (!report) return '';
    return report.tipo_red || report.networkType || '';
  };

  const getSeedUser = () => {
    if (!report) return '';
    return report.seed_user || report.user || '';
  };

  const getBetaGamma = () => {
    if (!report) return null;
    return {
      beta: report.beta,
      gamma: report.gamma
    };
  };

  const getThresholds = () => {
    if (!report) return null;
    return report.thresholds;
  };

  const getMethod = () => {
    if (!report) return '';
    return report.method || '';
  };

  const getPercentages = () => {
    if (!report) return null;
    return {
      pct_modificar: report.pct_modificar,
      pct_reenviar: report.pct_reenviar,
      pct_ignorar: report.pct_ignorar
    };
  };

  const renderPropagationHistory = () => {
    const method = getPropagationMethod().toLowerCase();

    // Si no hay log, mostrar mensaje
    if (!propagationLog || propagationLog.length === 0) {
      return (
        <div className="no-history">
          <p>No hay historial de propagación disponible para este reporte.</p>
        </div>
      );
    }

    // Mostrar historial completo de forma estática
    return (
      <div className="propagation-history-container">
        <div className="history-header">
          <h4>Historial de Propagación</h4>
          <span className="total-events">Total de eventos: {propagationLog.length}</span>
        </div>
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Paso</th>
                <th>Emisor</th>
                <th>Receptor</th>
                <th>Acción</th>
                {method === 'rip-dns' || method === 'rip-dsn' ? (
                  <>
                    <th>Vector Enviado</th>
                    <th>Estado Antes</th>
                    <th>Estado Después</th>
                  </>
                ) : (
                  <th>Estado</th>
                )}
              </tr>
            </thead>
            <tbody>
              {propagationLog.map((entry, index) => {
                // Caso especial: mismo usuario emisor y receptor con acción recovered
                const isSelfRecovery = entry.sender === entry.receiver && 
                                     entry.action && 
                                     entry.action.toLowerCase() === 'recovered';
                
                return (
                  <tr key={index} className="history-row">
                    <td className="step-cell">{entry.t !== undefined ? entry.t : index}</td>
                    <td className="sender-cell">{entry.sender || 'N/A'}</td>
                    <td className="receiver-cell">{entry.receiver || 'N/A'}</td>
                    <td className="action-cell">
                      {isSelfRecovery ? (
                        <span className="recovery-message">
                          El usuario {entry.sender} se ha recuperado
                        </span>
                      ) : (
                        <span className={`action-badge ${entry.action?.toLowerCase().replace(/\s+/g, '-')}`}>
                          {translateAction(entry.action)}
                        </span>
                      )}
                    </td>
                    {method === 'rip-dns' || method === 'rip-dsn' ? (
                      <>
                        <td className="vector-cell">
                          {formatVector(entry.vector_sent)}
                        </td>
                        <td className="state-cell">
                          {formatVector(entry.state_in_before)}
                        </td>
                        <td className="state-cell">
                          {formatVector(entry.state_in_after)}
                        </td>
                      </>
                    ) : (
                      <td className="state-cell">
                        <div className="state-display">
                          {formatSimpleState(entry.state)}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderMethodSpecificInfo = () => {
    const method = getPropagationMethod().toLowerCase();
    const betaGamma = getBetaGamma();
    const thresholds = getThresholds();
    const percentages = getPercentages();

    if (method === 'sir' || method === 'sis') {
      return (
        <div className="method-info-section">
          <h4>Parámetros del Modelo</h4>
          <div className="parameter-grid">
            <div className="parameter-item">
              <span className="parameter-label">Beta (β):</span>
              <span className="parameter-value">{betaGamma?.beta || 'N/A'}</span>
            </div>
            <div className="parameter-item">
              <span className="parameter-label">Gamma (γ):</span>
              <span className="parameter-value">{betaGamma?.gamma || 'N/A'}</span>
            </div>
          </div>
        </div>
      );
    } else if (method === 'rip-dns' || method === 'rip-dsn') {
      return (
        <div className="method-info-section">
          <h4>Parámetros del PRISUM-Model</h4>
          <div className="parameter-grid">
            <div className="parameter-item">
              <span className="parameter-label">Método:</span>
              <span className="parameter-value">{getMethod() || 'N/A'}</span>
            </div>
            {percentages && (
              <>
                <div className="parameter-item">
                  <span className="parameter-label">% Modificar:</span>
                  <span className="parameter-value">{percentages.pct_modificar || '0'}</span>
                </div>
                <div className="parameter-item">
                  <span className="parameter-label">% Reenviar:</span>
                  <span className="parameter-value">{percentages.pct_reenviar || '0'}</span>
                </div>
                <div className="parameter-item">
                  <span className="parameter-label">% Ignorar:</span>
                  <span className="parameter-value">{percentages.pct_ignorar || '0'}</span>
                </div>
              </>
            )}
          </div>
          {thresholds && (
            <div className="thresholds-section">
              <h5>Umbrales por Perfil</h5>
              <div className="thresholds-grid">
                {Object.entries(thresholds).map(([profile, values]) => (
                  <div key={profile} className="threshold-profile">
                    <h6>{profile}</h6>
                    {typeof values === 'object' && values !== null ? (
                      <div className="threshold-values">
                        {Object.entries(values).map(([key, value]) => (
                          <div key={key} className="threshold-item">
                            <span className="threshold-key">{key}:</span>
                            <span className="threshold-value">{value}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="threshold-value">{values}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  if (!report) return null;

  return (
    <div className="report-detail-container">
      <div className="detail-header">
        <button className="back-button" onClick={onClose}>
          ← Volver a la Tabla
        </button>
      </div>
      
      <div className="detail-content">
        <div className="detail-left-panel">
          <div className="report-info-section">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Nombre de la Propagación:</span>
                <span className="info-value">{report.propagation_name || report.propagationName || 'Sin nombre'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Tipo de Red:</span>
                <span className="info-value">{getNetworkType()}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Método de Propagación:</span>
                <span className="info-value">{getPropagationMethod()}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Usuario Semilla:</span>
                <span className="info-value">{getSeedUser()}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Num. Nodos:</span>
                <span className="info-value">{report.total_nodes || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Alcance Final:</span>
                <span className="info-value">{report.alcance_final || report.finalReach || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">T Pico:</span>
                <span className="info-value">
                  {typeof report.t_pico === 'object' 
                    ? JSON.stringify(report.t_pico) 
                    : (report.t_pico || 'N/A')
                  }
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">New T:</span>
                <span className="info-value">
                  {typeof report.new_t === 'object' 
                    ? JSON.stringify(report.new_t) 
                    : (report.new_t || 'N/A')
                  }
                </span>
              </div>
            </div>
          </div>

          {renderMethodSpecificInfo()}
        </div>

        <div className="detail-right-panel">
          <div className="history-section">
            {renderPropagationHistory()}
          </div>

          {/* Sección de Estados de Nodos - Solo para RIP-DSN */}
          {(() => {
            const method = getPropagationMethod().toLowerCase();
            const isRipDsn = method === 'rip-dsn' || method === 'rip-dns';
            
            if (!isRipDsn) return null;
            
            return (
              <div className="node-states-section">
                <h4>Estados de los Nodos</h4>
                <div className="node-states-content">
                  <div className="node-buttons">
                    {getInvolvedNodes().map((node) => (
                      <button
                        key={node.id}
                        className={`node-button ${selectedNodeId === node.id ? 'active' : ''}`}
                        onClick={() => setSelectedNodeId(node.id)}
                      >
                        {node.id}
                      </button>
                    ))}
                  </div>

                  {selectedNode && (
                    <div className="charts-container">
                      <div className="chart-section">
                        <h5>Estado de Entrada (State In)</h5>
                        <div className="chart-wrapper">
                          {hasValidStateInData(selectedNode) ? (
                            <Radar data={chartDataIn} options={chartOptions} />
                          ) : (
                            <div className="no-data-message">
                              <h6>Vector de Entrada</h6>
                              <p>No hay datos suficientes para mostrar el gráfico de entrada.</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="chart-section">
                        <h5>Estado de Salida (State Out)</h5>
                        <div className="chart-wrapper">
                          <Radar data={chartDataOut} options={chartOptions} />
                        </div>
                      </div>
                    </div>
                  )}

                  {!selectedNode && (
                    <div className="no-node-selected">
                      <p>Selecciona un nodo para ver sus estados emocionales</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

ReportDetailModal.propTypes = {
  report: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired
};
