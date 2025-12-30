import PropTypes from 'prop-types';
import BarabasiAlbertInput from './BarabasiAlbertInput';
import BarabasiSIRInput from './BarabasiSIRInput';
import BarabasiSISInput from './BarabasiSISInput';
import HolmeKimInput from './HolmeKimInput';
import HolmeKimSIRInput from './HolmeKimSIRInput';
import HolmeKimSISInput from './HolmeKimSISInput';
import VectorsInput from './VectorsInput';
import Navbar from './Navbar';
import RealWorldNavbar from './RealWorldNavbar';
import RealWorldSIRInput from './RealWorldSIRInput';
import RealWorldSISInput from './RealWorldSISInput';
import SearchPanel from './SearchPanel';
import './NetworkControls.css';

export default function NetworkControls({ 
  currentViewMode, 
  currentNetworkType,
  // Barabási-Albert props
  onGenerateBaNetwork,
  onLoadBaNetwork,
  baGraphData,
  baNodesWithCentrality,
  // Holme-Kim props
  onGenerateHkNetwork,
  onLoadHkNetwork,
  hkGraphData,
  hkNodesWithCentrality,
  // Real World props
  csvFile, setCsvFile, xlsxFile, setXlsxFile,
  networkList, selectedNet, setSelectedNet,
  nodesCsvFile, setNodesCsvFile, linksCsvFile, setLinksCsvFile,
  realWorldNetworkList, realWorldSelectedNet, setRealWorldSelectedNet,
  realWorldGraphData,
  realWorldNodesWithCentrality,
  // Search props
  searchText, setSearchText, highlightId, setHighlightId,
  status, realWorldStatus, baStatus, hkStatus,
  handleResetView,
  // Propagation props
  onStartBaSIRPropagation, onStartBaSISPropagation, onStartHkSIRPropagation, onStartHkSISPropagation, onStartRwSIRPropagation, onStartRwSISPropagation,
  setIsPropagationModalOpen, setIsNodeStatesModalOpen,
  propagationLog, baSIRPropagationLog, baSISPropagationLog, hkSIRPropagationLog, hkSISPropagationLog,
  nodeVectors, onGenerateVectors
}) {
  
  const renderBarabasiControls = () => {
    if (currentViewMode === 'barabasi-albert') {
      return (
        <div className="network-form-section">
          <BarabasiAlbertInput 
            onGenerateNetwork={onGenerateBaNetwork} 
            onLoadNetwork={onLoadBaNetwork}
          />
        </div>
      );
    } else if (currentViewMode === 'barabasi-si') {
      return (
        <div className="network-form-section">
          <BarabasiSIRInput
            onGenerateNetwork={onGenerateBaNetwork}
            nodes={baNodesWithCentrality}
            onStartPropagation={onStartBaSIRPropagation}
          />
        </div>
      );
    } else if (currentViewMode === 'barabasi-sis') {
      return (
        <div className="network-form-section">
          <BarabasiSISInput
            nodes={baNodesWithCentrality}
            onStartPropagation={onStartBaSISPropagation}
          />
        </div>
      );
    } else if (currentViewMode === 'barabasi-behavior') {
      return (
        <div className="network-form-section">
          <VectorsInput
            onGenerateVectors={onGenerateVectors}
            numNodes={baGraphData.nodes.length}
          />
        </div>
      );
    }
    return null;
  };

  const renderHolmeKimControls = () => {
    if (currentViewMode === 'holme-kim') {
      return (
        <div className="network-form-section">
          <HolmeKimInput 
            onGenerateNetwork={onGenerateHkNetwork} 
            onLoadNetwork={onLoadHkNetwork}
          />
        </div>
      );
    } else if (currentViewMode === 'holme-kim-si') {
      return (
        <div className="network-form-section">
          <HolmeKimSIRInput
            nodes={hkNodesWithCentrality}
            onStartPropagation={onStartHkSIRPropagation}
          />
        </div>
      );
    } else if (currentViewMode === 'holme-kim-sis') {
      return (
        <div className="network-form-section">
          <HolmeKimSISInput
            nodes={hkNodesWithCentrality}
            onStartPropagation={onStartHkSISPropagation}
          />
        </div>
      );
    } else if (currentViewMode === 'holme-kim-behavior') {
      return (
        <div className="network-form-section">
          <VectorsInput
            onGenerateVectors={onGenerateVectors}
            numNodes={hkGraphData.nodes.length}
          />
        </div>
      );
    }
    return null;
  };

  const renderRealWorldControls = () => {
    if (currentViewMode === 'real-world') {
      return (
        <div className="network-form-section">
          <RealWorldNavbar
            nodesCsvFile={nodesCsvFile}
            setNodesCsvFile={setNodesCsvFile}
            linksCsvFile={linksCsvFile}
            setLinksCsvFile={setLinksCsvFile}
            networkList={realWorldNetworkList}
            selectedNet={realWorldSelectedNet}
            setSelectedNet={setRealWorldSelectedNet}
            viewMode={currentViewMode}
            setCsvFile={setCsvFile}
          />
             
                                

          </div>
      );
    } else if (currentViewMode === 'real-world-sir') {
      return (
        <div className="network-form-section">
          <RealWorldNavbar
            nodesCsvFile={nodesCsvFile}
            setNodesCsvFile={setNodesCsvFile}
            linksCsvFile={linksCsvFile}
            setLinksCsvFile={setLinksCsvFile}
            networkList={realWorldNetworkList}
            selectedNet={realWorldSelectedNet}
            setSelectedNet={setRealWorldSelectedNet}
            viewMode={currentViewMode}
            setCsvFile={setCsvFile}
          />
          <RealWorldSIRInput
            nodes={realWorldNodesWithCentrality || []}
            onStartPropagation={onStartRwSIRPropagation}
          />
        </div>
      );
    } else if (currentViewMode === 'real-world-sis') {
      return (
        <div className="network-form-section">
          <RealWorldNavbar
            nodesCsvFile={nodesCsvFile}
            setNodesCsvFile={setNodesCsvFile}
            linksCsvFile={linksCsvFile}
            setLinksCsvFile={setLinksCsvFile}
            networkList={realWorldNetworkList}
            selectedNet={realWorldSelectedNet}
            setSelectedNet={setRealWorldSelectedNet}
            viewMode={currentViewMode}
            setCsvFile={setCsvFile}
          />
          <RealWorldSISInput
            nodes={realWorldNodesWithCentrality || []}
            onStartPropagation={onStartRwSISPropagation}
          />
        </div>
      );
    } else if (currentViewMode === 'simulation') {
      return (
        <div className="network-form-section">
          <RealWorldNavbar
            nodesCsvFile={nodesCsvFile}
            setNodesCsvFile={setNodesCsvFile}
            linksCsvFile={linksCsvFile}
            setLinksCsvFile={setLinksCsvFile}
            networkList={realWorldNetworkList}
            selectedNet={realWorldSelectedNet}
            setSelectedNet={setRealWorldSelectedNet}
            viewMode={currentViewMode}
            setCsvFile={setCsvFile}
            xlsxFile={xlsxFile}
            setXlsxFile={setXlsxFile}
          />

          
        </div>
      );
    }
    return null;
  };

  const renderActionButtons = () => {
    if (currentViewMode === 'barabasi-behavior' || currentViewMode === 'holme-kim-behavior' || currentViewMode === 'simulation') {
      return (
        <div className="action-buttons-section">
          <button
            onClick={() => setIsPropagationModalOpen(true)}
            className="button"
          >
            Iniciar Propagación
          </button>
        </div>
      );
    }
    return null;
  };


   const renderActionButtonsRip = () => {
    // No se necesita botón para real-world-sir ya que RealWorldSIRInput maneja la propagación
    return null;
  };


  return (
    <div className="network-controls">
      <div className="controls-left">
        {renderBarabasiControls()}
        {renderHolmeKimControls()}
        {renderRealWorldControls()}
        {renderActionButtons()}
        {renderActionButtonsRip()}
      </div>
      
      <div className="controls-right">
        
      </div>
    </div>
  );
}

NetworkControls.propTypes = {
  currentViewMode: PropTypes.string.isRequired,
  currentNetworkType: PropTypes.string.isRequired,
  onGenerateBaNetwork: PropTypes.func.isRequired,
  baGraphData: PropTypes.object.isRequired,
  onGenerateHkNetwork: PropTypes.func.isRequired,
  hkGraphData: PropTypes.object.isRequired,
  csvFile: PropTypes.object,
  setCsvFile: PropTypes.func.isRequired,
  xlsxFile: PropTypes.object,
  setXlsxFile: PropTypes.func.isRequired,
  networkList: PropTypes.array.isRequired,
  selectedNet: PropTypes.string.isRequired,
  setSelectedNet: PropTypes.func.isRequired,
  nodesCsvFile: PropTypes.object,
  setNodesCsvFile: PropTypes.func.isRequired,
  linksCsvFile: PropTypes.object,
  setLinksCsvFile: PropTypes.func.isRequired,
  realWorldNetworkList: PropTypes.array.isRequired,
  realWorldSelectedNet: PropTypes.string.isRequired,
  setRealWorldSelectedNet: PropTypes.func.isRequired,
  realWorldGraphData: PropTypes.object,
  searchText: PropTypes.string.isRequired,
  setSearchText: PropTypes.func.isRequired,
  highlightId: PropTypes.string.isRequired,
  setHighlightId: PropTypes.func.isRequired,
  status: PropTypes.string.isRequired,
  realWorldStatus: PropTypes.string.isRequired,
  baStatus: PropTypes.string.isRequired,
  hkStatus: PropTypes.string.isRequired,
  handleResetView: PropTypes.func.isRequired,
  onStartBaSIRPropagation: PropTypes.func.isRequired,
  onStartBaSISPropagation: PropTypes.func.isRequired,
  onStartHkSIRPropagation: PropTypes.func.isRequired,
  onStartHkSISPropagation: PropTypes.func.isRequired,
  onStartRwSIRPropagation: PropTypes.func.isRequired,
  onStartRwSISPropagation: PropTypes.func.isRequired,
  setIsPropagationModalOpen: PropTypes.func.isRequired,
  setIsNodeStatesModalOpen: PropTypes.func.isRequired,
  propagationLog: PropTypes.array.isRequired,
  baSIRPropagationLog: PropTypes.array.isRequired,
  baSISPropagationLog: PropTypes.array.isRequired,
  hkSIRPropagationLog: PropTypes.array.isRequired,
  hkSISPropagationLog: PropTypes.array.isRequired,
  nodeVectors: PropTypes.array.isRequired,
  onGenerateVectors: PropTypes.func.isRequired,
};
