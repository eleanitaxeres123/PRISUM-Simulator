import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import RealWorldNavbar from './components/RealWorldNavbar';
import SearchPanel from './components/SearchPanel';
import PropagationModal from './components/PropagationModal';
import NodeModal from './components/NodeModal';
import NodeStatesModal from './components/NodeStatesModal';
import PropagationResult from './components/PropagationResult';
import Graph3D from './components/Graph3D';
import RealWorldGraph3D from './components/RealWorldGraph3D';
import RealWorldSIRGraph3D from './components/RealWorldSIRGraph3D';
import RealWorldSIRInput from './components/RealWorldSIRInput';
import RWSIRPropagationResult from './components/RWSIRPropagationResult';
import RealWorldSISGraph3D from './components/RealWorldSISGraph3D';
import RealWorldSISInput from './components/RealWorldSISInput';
import RWSISPropagationResult from './components/RWSISPropagationResult';
import BarabasiAlbertInput from './components/BarabasiAlbertInput';
import BarabasiAlbertGraph3D from './components/BarabasiAlbertGraph3D';
import BarabasiSIRInput from './components/BarabasiSIRInput';
import BarabasiSIRGraph3D from './components/BarabasiSIRGraph3D';
import BarabasiSISInput from './components/BarabasiSISInput';
import BarabasiSISGraph3D from './components/BarabasiSISGraph3D';
import BaSISPropagationResult from './components/BaSISPropagationResult';
import HolmeKimInput from './components/HolmeKimInput';
import HolmeKimGraph3D from './components/HolmeKimGraph3D';
import HolmeKimSIRInput from './components/HolmeKimSIRInput';
import HolmeKimSIRGraph3D from './components/HolmeKimSIRGraph3D';
import HolmeKimSISInput from './components/HolmeKimSISInput';
import HolmeKimSISGraph3D from './components/HolmeKimSISGraph3D';
import HkSISPropagationResult from './components/HkSISPropagationResult';
import ControlPanel from './components/ControlPanel';
import NetworkControls from './components/NetworkControls';
import PropagationHistory from './components/PropagationHistory';
import BaSIRPropagationResult from './components/BaSIRPropagationResult';
import { readCsv, readXlsx, buildGraph, buildRealWorldGraph } from './utils/loadFiles';
import { generateBarabasiAlbert } from './utils/BarabasiAlbert';
import { generateHolmeKim } from './utils/HolmeKim';
import BarabasiBehaviorGraph3D from './components/BarabasiBehaviorGraph3D';
import HolmeKimBehaviorGraph3D from './components/HolmeKimBehaviorGraph3D';
import ReportsDashboard from './components/ReportsDashboard';
import axios from 'axios';
import './App.css';
import { calculateCentralityMetrics } from './utils/centrality';
import VectorsInput from './components/VectorsInput';
import { useSISPropagation } from './hooks/useSISPropagation';
import { useSIRPropagation } from './hooks/useSIRPropagation';
import { useHkSISPropagation } from './hooks/useHkSISPropagation';
import { useHkSIRPropagation } from './hooks/useHkSIRPropagation';
import { useRWSIRPropagation } from './hooks/useRWSIRPropagation';
import { useRWSISPropagation } from './hooks/useRWSISPropagation';
import redImage from './assets/prisum-logo.png';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export default function App() {
  // State declarations (unchanged from original)
  const [csvFile, setCsvFile] = useState(null);
  const [xlsxFile, setXlsxFile] = useState(null);
  const [linksAll, setLinksAll] = useState([]);
  const [attrsAll, setAttrsAll] = useState([]);
  const [networkList, setNetworkList] = useState([]);
  const [selectedNet, setSelectedNet] = useState('');
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [status, setStatus] = useState('Sube el CSV y el XLSX…');
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [highlightId, setHighlightId] = useState('');
  const [message, setMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
  const [modalNode, setModalNode] = useState(null);
  const [isPropagationModalOpen, setIsPropagationModalOpen] = useState(false);
  const [propagationStatus, setPropagationStatus] = useState('');
  const [propagationResult, setPropagationResult] = useState(null);
  const [highlightedLinks, setHighlightedLinks] = useState([]);
  const [propagationLog, setPropagationLog] = useState([]);
  const [nodesCsvFile, setNodesCsvFile] = useState(null);
  const [linksCsvFile, setLinksCsvFile] = useState(null);
  const [realWorldNodesAll, setRealWorldNodesAll] = useState([]);
  const [realWorldLinksAll, setRealWorldLinksAll] = useState([]);
  const [realWorldNetworkList, setRealWorldNetworkList] = useState([]);
  const [realWorldSelectedNet, setRealWorldSelectedNet] = useState('');
  const [realWorldGraphData, setRealWorldGraphData] = useState({ nodes: [], links: [] });
  const [realWorldStatus, setRealWorldStatus] = useState('Sube los archivos CSV…');
  const [rwSIRPropagationStatus, setRwSIRPropagationStatus] = useState('');
  const [rwSIRPropagationResult, setRwSIRPropagationResult] = useState(null);
  const [rwSIRHighlightedLinks, setRwSIRHighlightedLinks] = useState([]);
  const [rwSIRPropagationLog, setRwSIRPropagationLog] = useState([]);
  const [rwSIRBeta, setRwSIRBeta] = useState(0.3);
  const [rwSIRGamma, setRwSIRGamma] = useState(0.1);
  const [rwSISPropagationStatus, setRwSISPropagationStatus] = useState('');
  const [rwSISPropagationResult, setRwSISPropagationResult] = useState(null);
  const [rwSISHighlightedLinks, setRwSISHighlightedLinks] = useState([]);
  const [rwSISPropagationLog, setRwSISPropagationLog] = useState([]);
  const [rwSISBeta, setRwSISBeta] = useState(0.3);
  const [rwSISGamma, setRwSISGamma] = useState(0.1);
  const [showRwSIRPropagationResult, setShowRwSIRPropagationResult] = useState(false);
  const [showRwSISPropagationResult, setShowRwSISPropagationResult] = useState(false);
  const [viewMode, setViewMode] = useState('welcome');
  const [isNodeStatesModalOpen, setIsNodeStatesModalOpen] = useState(false);
  const [nodesWithCentrality, setNodesWithCentrality] = useState([]);
  const [realWorldNodesWithCentrality, setRealWorldNodesWithCentrality] = useState([]);
  const [baGraphData, setBaGraphData] = useState({ nodes: [], links: [] });
  const [baStatus, setBaStatus] = useState('Ingrese el número de nodos y enlaces…');
  const [baNodesWithCentrality, setBaNodesWithCentrality] = useState([]);
  const [baSIRBeta, setBaSIRBeta] = useState(0.3);
  const [baSIRGamma, setBaSIRGamma] = useState(0.1);
  const [baSIRHighlightedLinks, setBaSIRHighlightedLinks] = useState([]);
  const [baSIRPropagationLog, setBaSIRPropagationLog] = useState([]);
  const [baSIRPropagationStatus, setBaSIRPropagationStatus] = useState('');
  const [showBaSIRPropagationResult, setShowBaSIRPropagationResult] = useState(false);
  const [baSISBeta, setBaSISBeta] = useState(0.3);
  const [baSISGamma, setBaSISGamma] = useState(0.1);
  const [baSISHighlightedLinks, setBaSISHighlightedLinks] = useState([]);
  const [baSISPropagationLog, setBaSISPropagationLog] = useState([]);
  const [baSISPropagationStatus, setBaSISPropagationStatus] = useState('');
  const [showBaSISPropagationResult, setShowBaSISPropagationResult] = useState(false);
  const [hkGraphData, setHkGraphData] = useState({ nodes: [], links: [] });
  const [hkStatus, setHkStatus] = useState('Ingrese el número de nodos, enlaces y probabilidad de triadas…');
  const [hkNodesWithCentrality, setHkNodesWithCentrality] = useState([]);
  const [hkSIRBeta, setHkSIRBeta] = useState(0.3);
  const [hkSIRGamma, setHkSIRGamma] = useState(0.1);
  const [hkSIRHighlightedLinks, setHkSIRHighlightedLinks] = useState([]);
  const [hkSIRPropagationLog, setHkSIRPropagationLog] = useState([]);
  const [hkSIRPropagationStatus, setHkSIRPropagationStatus] = useState('');
  const [showHkSIRPropagationResult, setShowHkSIRPropagationResult] = useState(false);
  const [hkSISBeta, setHkSISBeta] = useState(0.3);
  const [hkSISGamma, setHkSISGamma] = useState(0.1);
  const [hkSISHighlightedLinks, setHkSISHighlightedLinks] = useState([]);
  const [hkSISPropagationLog, setHkSISPropagationLog] = useState([]);
  const [hkSISPropagationStatus, setHkSISPropagationStatus] = useState('');
  const [showHkSISPropagationResult, setShowHkSISPropagationResult] = useState(false);
  const [method, setMethod] = useState('ema');
  const [thresholds, setThresholds] = useState({
    "High-Credibility Informant": { forward: 0.8, modify: 0.2, ignore: 0.05, alpha: 0.3 },
    "Emotionally-Driven Amplifier": { forward: 0.95, modify: 0.6, ignore: 0.1, alpha: 0.8 },
    "Mobilisation-Oriented Catalyst": { forward: 0.6, modify: 0.7, ignore: 0.3, alpha: 0.7 },
    "Emotionally Exposed Participant": { forward: 0.3, modify: 0.4, ignore: 0.7, alpha: 0.6 },
  });
  const [emotionVector, setEmotionVector] = useState(null);
  const [nodeVectors, setNodeVectors] = useState([]);
  const [currentNetworkType, setCurrentNetworkType] = useState('barabasi-albert');
  const [isCentralityModalOpen, setIsCentralityModalOpen] = useState(false);

  const emotionKeys = [
    'subjectivity', 'polarity', 'fear', 'anger', 'anticipation',
    'trust', 'surprise', 'sadness', 'disgust', 'joy'
  ];

  // Función para limpiar vectores (solo en memoria)
  const clearVectors = () => {
    setNodeVectors([]);
  };

  // Hook personalizado para propagación SIS
  const handleBaSISPropagation = useSISPropagation({
    baGraphData,
    setBaSISPropagationStatus,
    setBaSISBeta,
    setBaSISGamma,
    setSelectedUser,
    setShowBaSISPropagationResult,
    setBaSISPropagationLog,
    setBaSISHighlightedLinks,
    setHighlightId,
  });

  // Hook personalizado para propagación SIR
  const handleBaSIRPropagation = useSIRPropagation({
    baGraphData,
    setBaSIRPropagationStatus,
    setBaSIRBeta,
    setBaSIRGamma,
    setSelectedUser,
    setShowBaSIRPropagationResult,
    setBaSIRPropagationLog,
    setBaSIRHighlightedLinks,
    setHighlightId,
  });

  // Hook personalizado para propagación SIS Holme-Kim
  const handleHkSISPropagation = useHkSISPropagation({
    hkGraphData,
    setHkSISBeta,
    setHkSISGamma,
    setSelectedUser,
    setHkSISHighlightedLinks,
    setHkSISPropagationLog,
    setHkSISPropagationStatus,
    setShowHkSISPropagationResult,
    setHighlightId,
  });

  const handleHkSIRPropagation = useHkSIRPropagation({
    hkGraphData,
    setHkSIRBeta,
    setHkSIRGamma,
    setSelectedUser,
    setHkSIRHighlightedLinks,
    setHkSIRPropagationLog,
    setHkSIRPropagationStatus,
    setShowHkSIRPropagationResult,
    setHighlightId,
  });

  const handleMenuSelect = (key) => {
    if (key === 'real-world') {
      setViewMode('real-world');
      if (!nodesCsvFile || !linksCsvFile) {
        setRealWorldStatus('Sube los archivos CSV…');
      }
    } else if (key === 'real-world-sir') {
      setViewMode('real-world-sir');
    } else if (key === 'real-world-sis') {
      setViewMode('real-world-sis');
      if (!nodesCsvFile || !linksCsvFile) {
        setRealWorldStatus('Sube los archivos CSV…');
      }
    } else if (key === 'simulation') {
      setViewMode('simulation');
      setCsvFile(linksCsvFile);
      if (!linksCsvFile) {
        setStatus('Sube el archivo CSV de relaciones en "Redes HR" primero…');
      } else if (linksAll.length > 0) {
        setStatus(`Red ${selectedNet}: ${graphData.nodes.length} nodos · ${graphData.links.length} enlaces`);
      } else {
        setStatus('CSV listo. Construyendo red básica…');
      }
    } else if (key === 'barabasi-albert') {
      setViewMode('barabasi-albert');
      if (baGraphData.nodes.length > 0 && baNodesWithCentrality.length > 0) {
        setBaStatus(`Red BA: ${baGraphData.nodes.length} nodos · ${baGraphData.links.length} enlaces`);
      } else {
        setBaStatus('Ingrese el número de nodos y enlaces…');
        setBaNodesWithCentrality([]);
      }
    } else if (key === 'barabasi-si') {
      setViewMode('barabasi-si');
      if (baGraphData.nodes.length > 0) {
        setBaStatus(`Red BA (SIR): ${baGraphData.nodes.length} nodos · ${baGraphData.links.length} enlaces`);
      } else {
        setBaStatus('Genere una red Barabási-Albert primero…');
      }
    } else if (key === 'barabasi-sis') {
      setViewMode('barabasi-sis');
      if (baGraphData.nodes.length > 0) {
        setBaStatus(`Red BA (SIS): ${baGraphData.nodes.length} nodos · ${baGraphData.links.length} enlaces`);
      } else {
        setBaStatus('Genere una red BA primero…');
      }
    } else if (key === 'holme-kim') {
      setViewMode('holme-kim');
      if (hkGraphData.nodes.length > 0 && hkNodesWithCentrality.length > 0) {
        setHkStatus(`Red Hk: ${hkGraphData.nodes.length} nodos · ${hkGraphData.links.length} enlaces`);
      } else {
        setHkStatus('Ingrese el número de nodos, enlaces y probabilidad de triadas…');
        setHkNodesWithCentrality([]);
      }
    } else if (key === 'holme-kim-si') {
      setViewMode('holme-kim-si');
      if (hkGraphData.nodes.length > 0) {
        setHkStatus(`Red HK (SIR): ${hkGraphData.nodes.length} nodos · ${hkGraphData.links.length} enlaces`);
      } else {
        setHkStatus('Genere una red HK primero…');
      }
    } else if (key === 'holme-kim-sis') {
      setViewMode('holme-kim-sis');
      if (hkGraphData.nodes.length > 0) {
        setHkStatus(`Red HK (SIS): ${hkGraphData.nodes.length} nodos · ${hkGraphData.links.length} enlaces`);
      } else {
        setHkStatus('Genere una red HK primero…');
      }
    } else if (key === 'barabasi-behavior') {
      setViewMode('barabasi-behavior');
      if (baGraphData.nodes.length > 0 && baNodesWithCentrality.length > 0) {
        setBaStatus(`Red BA (Comportamiento): ${baGraphData.nodes.length} nodos · ${baGraphData.links.length} enlaces`);
      } else {
        setBaStatus('Genere una red BA primero…');
        setBaNodesWithCentrality([]);
      }
    } else if (key === 'holme-kim-behavior') {
      setViewMode('holme-kim-behavior');
      if (hkGraphData.nodes.length > 0 && hkNodesWithCentrality.length > 0) {
        setHkStatus(`Red HK (Comportamiento): ${hkGraphData.nodes.length} nodos · ${hkGraphData.links.length} enlaces`);
      } else {
        setHkStatus('Genere una red HK primero…');
        setHkNodesWithCentrality([]);
      }
    } else if (key === 'reports') {
      setViewMode('reports');
    } else {
      setViewMode('simulation');
      setStatus('Sube el CSV y el XLSX…');
      setCsvFile(null);
      setXlsxFile(null);
      setLinksAll([]);
      setAttrsAll([]);
      setNetworkList([]);
      setSelectedNet('');
      setGraphData({ nodes: [], links: [] });
    }
    setSearchText('');
    setHighlightId('');
    setMessage('');
    setSelectedUser('');
    setPropagationStatus('');
    setPropagationResult(null);
    setHighlightedLinks([]);
    setPropagationLog([]);
    setRwSIRPropagationStatus('');
    setRwSIRPropagationResult(null);
    setRwSIRHighlightedLinks([]);
    setRwSIRPropagationLog([]);
    setBaSIRPropagationStatus('');
    setBaSIRHighlightedLinks([]);
    setBaSIRPropagationLog([]);
    setHkSIRPropagationStatus('');
    setHkSIRHighlightedLinks([]);
    setHkSIRPropagationLog([]);
    setIsNodeModalOpen(false);
    setIsPropagationModalOpen(false);
    setIsNodeStatesModalOpen(false);
    setModalNode(null);
    setMethod('ema');
    setThresholds({
      "High-Credibility Informant": { forward: 0.8, modify: 0.2, ignore: 0.05, alpha: 0.3 },
      "Emotionally-Driven Amplifier": { forward: 0.95, modify: 0.6, ignore: 0.1, alpha: 0.8 },
      "Mobilisation-Oriented Catalyst": { forward: 0.6, modify: 0.7, ignore: 0.3, alpha: 0.7 },
      "Emotionally Exposed Participant": { forward: 0.3, modify: 0.4, ignore: 0.7, alpha: 0.6 },
    });
    setEmotionVector(null);
    // No limpiar nodeVectors para mantener persistencia
    // setNodeVectors([]);
  };


  // useEffect hooks (unchanged from original)
  useEffect(() => {
    async function loadCsv() {
      if (!csvFile) return;
      setStatus('Leyendo CSV…');
      const links = await readCsv(csvFile);
      setLinksAll(links);
      const ids = [...new Set(
        links.map(l => String(l.network_id ?? l.networkId))
      )].filter(id => id);
      setNetworkList(ids);
      setSelectedNet(ids[0] ?? '');
      setStatus('CSV listo. Construyendo red básica…');
    }
    loadCsv();
  }, [csvFile]);

  useEffect(() => {
    async function loadXlsx() {
      if (!xlsxFile) return;
      setStatus('Leyendo XLSX…');
      const attrs = await readXlsx(xlsxFile);
      setAttrsAll(attrs);
      setStatus('XLSX listo.');
    }
    loadXlsx();
  }, [xlsxFile]);

  useEffect(() => {
    if (!selectedNet || linksAll.length === 0) {
      setGraphData({ nodes: [], links: [] });
      setNodesWithCentrality([]);
      return;
    }
    setStatus('Filtrando y construyendo la red…');
    const linksFiltered = linksAll.filter(
      l => String(l.network_id ?? l.networkId) === selectedNet
    );
    const data = buildGraph(linksFiltered, attrsAll.length > 0 ? attrsAll : []);
    setGraphData(data);
    const nodesWithMetrics = calculateCentralityMetrics(data.nodes, data.links);
    setNodesWithCentrality(nodesWithMetrics);
    setStatus(
      `Red ${selectedNet}: ${data.nodes.length} nodos · ${data.links.length} enlaces`
    );
    setSelectedUser('');
    setHighlightId('');
  }, [selectedNet, linksAll, attrsAll]);

  useEffect(() => {
    async function loadNodesCsv() {
      if (!nodesCsvFile) return;
      setRealWorldStatus('Leyendo CSV de nodos…');
      const nodes = await readCsv(nodesCsvFile);
      setRealWorldNodesAll(nodes);
      const ids = [...new Set(nodes.map(n => String(n.network_id)))].filter(id => id);
      setRealWorldNetworkList(ids);
      setRealWorldSelectedNet(ids[0] ?? '');
      setRealWorldStatus('CSV de nodos listo. Ahora sube el CSV de relaciones…');
    }
    loadNodesCsv();
  }, [nodesCsvFile]);

  useEffect(() => {
    async function loadLinksCsv() {
      if (!linksCsvFile) return;
      setRealWorldStatus('Leyendo CSV de relaciones…');
      const links = await readCsv(linksCsvFile);
      setRealWorldLinksAll(links);
      setRealWorldStatus('CSV de relaciones listo.');
      setCsvFile(linksCsvFile);
    }
    loadLinksCsv();
  }, [linksCsvFile]);

  useEffect(() => {
    if (!realWorldSelectedNet || realWorldNodesAll.length === 0 || realWorldLinksAll.length === 0) {
      setRealWorldGraphData({ nodes: [], links: [] });
      setRealWorldNodesWithCentrality([]);
      return;
    }
    setRealWorldStatus('Filtrando y construyendo la red…');
    const linksFiltered = realWorldLinksAll.filter(l => String(l.network_id) === realWorldSelectedNet);
    const nodesFiltered = realWorldNodesAll.filter(n => String(n.network_id) === realWorldSelectedNet);
    const data = buildRealWorldGraph(linksFiltered, nodesFiltered, attrsAll.length > 0 ? attrsAll : []);
    setRealWorldGraphData(data);
    const nodesWithMetrics = calculateCentralityMetrics(data.nodes, data.links);
    setRealWorldNodesWithCentrality(nodesWithMetrics);
    setRealWorldStatus(
      `Red ${realWorldSelectedNet}: ${data.nodes.length} nodos · ${data.links.length} enlaces`
    );
  }, [realWorldSelectedNet, realWorldNodesAll, realWorldLinksAll, attrsAll]);

  const handleGenerateVectors = async (numNodes) => {
  if (numNodes === 0) {
    setBaStatus('No hay nodos en la red para generar vectores.');
    setHkStatus('No hay nodos en la red para generar vectores.');
    return;
  }
  try {
    const response = await axios.post('http://localhost:8000/generate-vectors', { num_vectors: numNodes }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const vectors = response.data.vectors || [];

    const shuffledVectors = [...vectors].sort(() => Math.random() - 0.5);

    // Update Barabási-Albert nodes SIN crear nuevos objetos para preservar posiciones
    baGraphData.nodes.forEach((node, index) => {
      // Preservar posiciones originales si no están definidas
      if (!node.originalPosition) {
        node.originalPosition = {
          x: node.x || 0,
          y: node.y || 0,
          z: node.z || 0,
          fx: node.fx,
          fy: node.fy,
          fz: node.fz
        };
      }
      
      const vector = shuffledVectors[index % shuffledVectors.length];
      
      // Solo actualizar los vectores emocionales sin tocar las posiciones
      node.emotional_vector_in = {
        subjectivity: vector.in_subjectivity || 0,
        polarity: vector.in_polarity || 0,
        fear: vector.in_fear || 0,
        anger: vector.in_anger || 0,
        anticipation: vector.in_anticip || 0,
        trust: vector.in_trust || 0,
        surprise: vector.in_surprise || 0,
        sadness: vector.in_sadness || 0,
        disgust: vector.in_disgust || 0,
        joy: vector.in_joy || 0,
      };
      node.emotional_vector_out = {
        subjectivity: vector.out_subjectivity || 0,
        polarity: vector.out_polarity || 0,
        fear: vector.out_fear || 0,
        anger: vector.out_anger || 0,
        anticipation: vector.out_anticip || 0,
        trust: vector.out_trust || 0,
        surprise: vector.out_surprise || 0,
        sadness: vector.out_sadness || 0,
        disgust: vector.out_disgust || 0,
        joy: vector.out_joy || 0,
      };
      node.cluster = vector.cluster || 0;
    });

    // Update Holme-Kim nodes SIN crear nuevos objetos para preservar posiciones
    hkGraphData.nodes.forEach((node, index) => {
      // Preservar posiciones originales si no están definidas
      if (!node.originalPosition) {
        node.originalPosition = {
          x: node.x || 0,
          y: node.y || 0,
          z: node.z || 0,
          fx: node.fx,
          fy: node.fy,
          fz: node.fz
        };
      }
      
      const vector = shuffledVectors[index % shuffledVectors.length];
      
      // Solo actualizar los vectores emocionales sin tocar las posiciones
      node.emotional_vector_in = {
        subjectivity: vector.in_subjectivity || 0,
        polarity: vector.in_polarity || 0,
        fear: vector.in_fear || 0,
        anger: vector.in_anger || 0,
        anticipation: vector.in_anticip || 0,
        trust: vector.in_trust || 0,
        surprise: vector.in_surprise || 0,
        sadness: vector.in_sadness || 0,
        disgust: vector.in_disgust || 0,
        joy: vector.in_joy || 0,
      };
      node.emotional_vector_out = {
        subjectivity: vector.out_subjectivity || 0,
        polarity: vector.out_polarity || 0,
        fear: vector.out_fear || 0,
        anger: vector.out_anger || 0,
        anticipation: vector.out_anticip || 0,
        trust: vector.out_trust || 0,
        surprise: vector.out_surprise || 0,
        sadness: vector.out_sadness || 0,
        disgust: vector.out_disgust || 0,
        joy: vector.out_joy || 0,
      };
      node.cluster = vector.cluster || 0;
    });

    // Actualizar los estados sin crear nuevos objetos de nodos
    setBaGraphData({ ...baGraphData });
    setHkGraphData({ ...hkGraphData });
    setNodeVectors(vectors);

    // MANTENER las métricas existentes en lugar de recalcularlas
    // Solo actualizar si no existen métricas previas
    if (baNodesWithCentrality.length === 0) {
      const baNodesWithMetrics = calculateCentralityMetrics(baGraphData.nodes, baGraphData.links);
      setBaNodesWithCentrality(baNodesWithMetrics);
    } else {
      // Actualizar los nodos existentes con las métricas preservadas
      const updatedBaNodesWithMetrics = baNodesWithCentrality.map(nodeWithMetrics => {
        const updatedNode = baGraphData.nodes.find(n => n.id === nodeWithMetrics.id);
        if (updatedNode) {
          // Preservar todas las métricas existentes y solo agregar los nuevos vectores
          return {
            ...nodeWithMetrics,
            emotional_vector_in: updatedNode.emotional_vector_in,
            emotional_vector_out: updatedNode.emotional_vector_out,
            cluster: updatedNode.cluster
          };
        }
        return nodeWithMetrics;
      });
      setBaNodesWithCentrality(updatedBaNodesWithMetrics);
    }

    if (hkNodesWithCentrality.length === 0) {
      const hkNodesWithMetrics = calculateCentralityMetrics(hkGraphData.nodes, hkGraphData.links);
      setHkNodesWithCentrality(hkNodesWithMetrics);
    } else {
      // Actualizar los nodos existentes con las métricas preservadas
      const updatedHkNodesWithMetrics = hkNodesWithCentrality.map(nodeWithMetrics => {
        const updatedNode = hkGraphData.nodes.find(n => n.id === nodeWithMetrics.id);
        if (updatedNode) {
          // Preservar todas las métricas existentes y solo agregar los nuevos vectores
          return {
            ...nodeWithMetrics,
            emotional_vector_in: updatedNode.emotional_vector_in,
            emotional_vector_out: updatedNode.emotional_vector_out,
            cluster: updatedNode.cluster
          };
        }
        return nodeWithMetrics;
      });
      setHkNodesWithCentrality(updatedHkNodesWithMetrics);
    }

    setBaStatus(`Red Barabási-Albert: ${baGraphData.nodes.length} nodos · ${baGraphData.links.length} enlaces con vectores generados`);
    setHkStatus(`Red Holme-Kim: ${hkGraphData.nodes.length} nodos · ${hkGraphData.links.length} enlaces con vectores generados`);
  } catch (error) {
    console.error('Error generating vectors:', error);
    setBaStatus(`Error: ${error.response?.data?.detail || error.message}`);
    setHkStatus(`Error: ${error.response?.data?.detail || error.message}`);
  }
};

const handleGenerateBaNetwork = (numNodes, numEdges) => {
  setBaStatus('Generando red Barabási-Albert…');
  const data = generateBarabasiAlbert(numNodes, numEdges);
  
  // Limpiar vectores anteriores al generar nueva red
  clearVectors();
  
  // Inicializar posiciones originales para todos los nodos
  const nodesWithOriginalPositions = data.nodes.map(node => ({
    ...node,
    originalPosition: {
      x: node.x || 0,
      y: node.y || 0,
      z: node.z || 0,
      fx: node.fx,
      fy: node.fy,
      fz: node.fz
    }
  }));
  
  const finalData = { ...data, nodes: nodesWithOriginalPositions };
  setBaGraphData(finalData);
  const nodesWithMetrics = calculateCentralityMetrics(nodesWithOriginalPositions, data.links);
  setBaNodesWithCentrality(nodesWithMetrics);
  setBaStatus(`Red Barabási-Albert: ${data.nodes.length} nodos · ${data.links.length} enlaces`);
  
  // Retornar los datos para el guardado
  return finalData;
};

const handleGenerateHkNetwork = (numNodes, numEdges, triadProb) => {
  setHkStatus('Generando red Holme-Kim…');
  const data = generateHolmeKim(numNodes, numEdges, triadProb);
  
  // Limpiar vectores anteriores al generar nueva red
  clearVectors();
  
  // Inicializar posiciones originales para todos los nodos
  const nodesWithOriginalPositions = data.nodes.map(node => ({
    ...node,
    originalPosition: {
      x: node.x || 0,
      y: node.y || 0,
      z: node.z || 0,
      fx: node.fx,
      fy: node.fy,
      fz: node.fz
    }
  }));
  
  const finalData = { ...data, nodes: nodesWithOriginalPositions };
  setHkGraphData(finalData);
  const nodesWithMetrics = calculateCentralityMetrics(nodesWithOriginalPositions, data.links);
  setHkNodesWithCentrality(nodesWithMetrics);
  setHkStatus(`Red Holme-Kim: ${data.nodes.length} nodos · ${data.links.length} enlaces`);
  
  // Retornar los datos para el guardado
  return finalData;
};

// Funciones para cargar redes guardadas
const handleLoadBaNetwork = (networkData) => {
  setBaStatus('Cargando red Barabási-Albert guardada…');
  
  // Limpiar vectores anteriores al cargar red
  clearVectors();
  
  // Inicializar posiciones originales para todos los nodos
  const nodesWithOriginalPositions = networkData.nodes.map(node => ({
    ...node,
    originalPosition: {
      x: node.x || 0,
      y: node.y || 0,
      z: node.z || 0,
      fx: node.fx,
      fy: node.fy,
      fz: node.fz
    }
  }));
  
  setBaGraphData({ ...networkData, nodes: nodesWithOriginalPositions });
  const nodesWithMetrics = calculateCentralityMetrics(nodesWithOriginalPositions, networkData.links);
  setBaNodesWithCentrality(nodesWithMetrics);
  setBaStatus(`Red Barabási-Albert cargada: ${networkData.nodes.length} nodos · ${networkData.links.length} enlaces`);
};

const handleLoadHkNetwork = (networkData) => {
  setHkStatus('Cargando red Holme-Kim guardada…');
  
  // Limpiar vectores anteriores al cargar red
  clearVectors();
  
  // Inicializar posiciones originales para todos los nodos
  const nodesWithOriginalPositions = networkData.nodes.map(node => ({
    ...node,
    originalPosition: {
      x: node.x || 0,
      y: node.y || 0,
      z: node.z || 0,
      fx: node.fx,
      fy: node.fy,
      fz: node.fz
    }
  }));
  
  setHkGraphData({ ...networkData, nodes: nodesWithOriginalPositions });
  const nodesWithMetrics = calculateCentralityMetrics(nodesWithOriginalPositions, networkData.links);
  setHkNodesWithCentrality(nodesWithMetrics);
  setHkStatus(`Red Holme-Kim cargada: ${networkData.nodes.length} nodos · ${networkData.links.length} enlaces`);
};




  const handleCloseBaSIRPropagationResult = () => {
    setShowBaSIRPropagationResult(false);
    setBaSIRPropagationStatus('');
    setBaSIRHighlightedLinks([]);
    setBaSIRPropagationLog([]);
    setHighlightId('');
    setSelectedUser('');
  };

  const handleCloseBaSISPropagationResult = () => {
    setShowBaSISPropagationResult(false);
    setBaSISPropagationStatus('');
    setBaSISHighlightedLinks([]);
    setBaSISPropagationLog([]);
    setHighlightId('');
    setSelectedUser('');
  };

  const handleCloseHkSIRPropagationResult = () => {
    setShowHkSIRPropagationResult(false);
    setHkSIRPropagationStatus('');
    setHkSIRHighlightedLinks([]);
    setHkSIRPropagationLog([]);
    setHighlightId('');
    setSelectedUser('');
  };

  const handleCloseHkSISPropagationResult = () => {
    setShowHkSISPropagationResult(false);
    setHkSISPropagationStatus('');
    setHkSISHighlightedLinks([]);
    setHkSISPropagationLog([]);
    setHighlightId('');
    setSelectedUser('');
  };

  const handleNodeClick = (node) => {
    if (viewMode === 'simulation') {
      const nodeWithCentrality = realWorldNodesWithCentrality.find(n => n.id === node.id) || node;
      const nodeHistory = propagationLog
        .filter(entry => entry.receiver === node.id);
      const sortedHistory = nodeHistory.sort((a, b) => b.t - a.t);
      const latestState = sortedHistory.length > 0 ? sortedHistory[0].state_in_after : null;
      const emotional_vector_in = latestState
        ? {
            subjectivity: latestState[0] ?? 'N/A',
            polarity: latestState[1] ?? 'N/A',
            fear: latestState[2] ?? 'N/A',
            anger: latestState[3] ?? 'N/A',
            anticipation: latestState[4] ?? 'N/A',
            trust: latestState[5] ?? 'N/A',
            surprise: latestState[6] ?? 'N/A',
            sadness: latestState[7] ?? 'N/A',
            disgust: latestState[8] ?? 'N/A',
            joy: latestState[9] ?? 'N/A',
          }
        : {
            subjectivity: node.in_subjectivity ?? 'N/A',
            polarity: node.in_polarity ?? 'N/A',
            fear: node.in_fear ?? 'N/A',
            anger: node.in_anger ?? 'N/A',
            anticipation: node.in_anticip ?? 'N/A',
            trust: node.in_trust ?? 'N/A',
            surprise: node.in_surprise ?? 'N/A',
            sadness: node.in_sadness ?? 'N/A',
            disgust: node.in_disgust ?? 'N/A',
            joy: node.in_joy ?? 'N/A',
          };
      const emotional_vector_out = {
        subjectivity: node.out_subjectivity ?? 'N/A',
        polarity: node.out_polarity ?? 'N/A',
        fear: node.out_fear ?? 'N/A',
        anger: node.out_anger ?? 'N/A',
        anticipation: node.out_anticip ?? 'N/A',
        trust: node.out_trust ?? 'N/A',
        surprise: node.out_surprise ?? 'N/A',
        sadness: node.out_sadness ?? 'N/A',
        disgust: node.out_disgust ?? 'N/A',
        joy: node.out_joy ?? 'N/A',
      };
      const nodeWithVectors = {
        ...nodeWithCentrality,
        emotional_vector_in,
        emotional_vector_out,
      };
      setModalNode(nodeWithVectors);
      setIsNodeModalOpen(true);
      setSelectedNode(node);
    } else if (viewMode === 'real-world') {
      const nodeWithCentrality = realWorldNodesWithCentrality.find(n => n.id === node.id) || node;
      setModalNode(nodeWithCentrality);
      setSelectedNode(nodeWithCentrality);
      setIsCentralityModalOpen(true);
    } else if (viewMode === 'barabasi-albert') {
      const nodeWithCentrality = baNodesWithCentrality.find(n => n.id === node.id) || node;
      setModalNode(nodeWithCentrality);
      setSelectedNode(nodeWithCentrality);
      setIsCentralityModalOpen(true);
    } else if (viewMode === 'holme-kim') {
      const nodeWithCentrality = hkNodesWithCentrality.find(n => n.id === node.id) || node;
      setModalNode(nodeWithCentrality);
      setSelectedNode(nodeWithCentrality);
      setIsCentralityModalOpen(true);
    } else if (viewMode === 'barabasi-si') {
      const nodeWithCentrality = baNodesWithCentrality.find(n => n.id === node.id) || node;
      setModalNode(nodeWithCentrality);
      setSelectedNode(nodeWithCentrality);
    } else if (viewMode === 'holme-kim-si' || viewMode === 'holme-kim-sis') {
      const nodeWithCentrality = hkNodesWithCentrality.find(n => n.id === node.id) || node;
      setModalNode(nodeWithCentrality);
      setSelectedNode(nodeWithCentrality);
    } else if (viewMode === 'real-world-sir') {
      setSelectedUser(node.id);
    } else if (viewMode === 'real-world-sis') {
      setSelectedUser(node.id);
    }
  };

const handleVectorPropagation = async ({ selectedUser, message, method, thresholds, emotionVector, k, policy, clusterFiltering, propagationName }) => {
  
  // Verificar si hay vectores disponibles en los nodos del grafo o en nodeVectors
  const currentGraphData = viewMode === 'barabasi-behavior' ? baGraphData : hkGraphData;
  
  // Determinar el tipo de red basado en el viewMode
  const networkType = viewMode === 'barabasi-behavior' ? 'barabasi-albert' : 'holme-kim';
  const hasVectorsInNodes = currentGraphData.nodes.some(node => 
    node.emotional_vector_in && node.emotional_vector_out
  );
  
  if (!selectedUser || !message.trim() || (!nodeVectors.length && !hasVectorsInNodes)) {
    setPropagationStatus('Por favor selecciona un usuario, escribe un mensaje y genera vectores.');
    return;
  }

  if (!propagationName || !propagationName.trim()) {
    setPropagationStatus('Por favor ingresa un nombre para la propagación.');
    return;
  }

  setPropagationStatus('Iniciando propagación con vectores aleatorios…');
  try {
    const formData = new FormData();
    formData.append('seed_user', String(selectedUser));
    formData.append('message', message);
    formData.append('max_steps', '4');
    formData.append('method', method);
    formData.append('thresholds', JSON.stringify(thresholds));
    formData.append('k', k.toString());
    formData.append('policy', policy);
    formData.append('cluster_filtering', clusterFiltering);
    formData.append('propagation_name', propagationName);
    formData.append('tipo_red', networkType);  // Tipo de red explícito
    formData.append('metodo', 'RIP-DSN');  // Método de propagación explícito
    
    if (emotionVector && Object.values(emotionVector).some(val => val !== 0)) {
      formData.append('custom_vector', JSON.stringify(emotionVector));
    }

    const currentGraphData = viewMode === 'barabasi-behavior' ? baGraphData : hkGraphData;
    
    // Preparar archivo CSV de enlaces
    const linksCsvContent = currentGraphData.links.map(link => ({
      source: String(link.source.id || link.source),
      target: String(link.target.id || link.target),
    }));
    
    // Depurar los enlaces generados
    
    const linksCsvBlob = new Blob([Papa.unparse(linksCsvContent)], { type: 'text/csv' });
    const linksCsvFile = new File([linksCsvBlob], 'links.csv', { type: 'text/csv' });

    // Preparar archivo XLSX de estados
    const statesXlsxContent = currentGraphData.nodes.map(node => ({
      user_name: String(node.id),
      cluster: node.cluster || 0,
      in_subjectivity: node.emotional_vector_in?.subjectivity || 0,
      in_polarity: node.emotional_vector_in?.polarity || 0,
      in_fear: node.emotional_vector_in?.fear || 0,
      in_anger: node.emotional_vector_in?.anger || 0,
      in_anticip: node.emotional_vector_in?.anticipation || 0,
      in_trust: node.emotional_vector_in?.trust || 0,
      in_surprise: node.emotional_vector_in?.surprise || 0,
      in_sadness: node.emotional_vector_in?.sadness || 0,
      in_disgust: node.emotional_vector_in?.disgust || 0,
      in_joy: node.emotional_vector_in?.joy || 0,
      out_subjectivity: node.emotional_vector_out?.subjectivity || 0,
      out_polarity: node.emotional_vector_out?.polarity || 0,
      out_fear: node.emotional_vector_out?.fear || 0,
      out_anger: node.emotional_vector_out?.anger || 0,
      out_anticip: node.emotional_vector_out?.anticipation || 0,
      out_trust: node.emotional_vector_out?.trust || 0,
      out_surprise: node.emotional_vector_out?.surprise || 0,
      out_sadness: node.emotional_vector_out?.sadness || 0,
      out_disgust: node.emotional_vector_out?.disgust || 0,
      out_joy: node.emotional_vector_out?.joy || 0,
    }));
    
    // Depurar los estados generados
    
    // Verificar si seed_user está en los nodos
    const seedUserInNodes = statesXlsxContent.some(node => node.user_name === String(selectedUser));
    if (!seedUserInNodes) {
      setPropagationStatus('Error: El usuario seleccionado no existe en la red.');
      return;
    }
    
    const ws = XLSX.utils.json_to_sheet(statesXlsxContent);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'States');
    const xlsxArray = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const xlsxBlob = new Blob([xlsxArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const xlsxFile = new File([xlsxBlob], 'states.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    formData.append('csv_file', linksCsvFile);
    formData.append('xlsx_file', xlsxFile);

    // Log para debugging
    console.log('Enviando datos de propagación:', {
      seed_user: selectedUser,
      message: message,
      method: method,
      thresholds: thresholds,
      k: k,
      policy: policy,
      cluster_filtering: clusterFiltering,
      propagation_name: propagationName,
      nodes_count: statesXlsxContent.length,
      links_count: linksCsvContent.length
    });

    const response = await axios.post('http://localhost:8000/propagate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setPropagationResult(response.data);
    setPropagationStatus(`Propagación completada con método ${method.toUpperCase()}.`);
    const propagationLog = response.data.log || [];
    setPropagationLog(propagationLog);

    // Actualizar solo los vectores emocionales SIN crear nuevos objetos de nodos
    currentGraphData.nodes.forEach(node => {
      const lastEntry = propagationLog
        .filter(entry => entry.receiver === String(node.id))
        .sort((a, b) => b.t - a.t)[0];
      if (lastEntry && lastEntry.state_in_after && lastEntry.state_out_after) {
        // Solo actualizar los vectores emocionales sin tocar las posiciones
        node.emotional_vector_in = {
          subjectivity: lastEntry.state_in_after[0] || node.emotional_vector_in?.subjectivity || 0,
          polarity: lastEntry.state_in_after[1] || node.emotional_vector_in?.polarity || 0,
          fear: lastEntry.state_in_after[2] || node.emotional_vector_in?.fear || 0,
          anger: lastEntry.state_in_after[3] || node.emotional_vector_in?.anger || 0,
          anticipation: lastEntry.state_in_after[4] || node.emotional_vector_in?.anticipation || 0,
          trust: lastEntry.state_in_after[5] || node.emotional_vector_in?.trust || 0,
          surprise: lastEntry.state_in_after[6] || node.emotional_vector_in?.surprise || 0,
          sadness: lastEntry.state_in_after[7] || node.emotional_vector_in?.sadness || 0,
          disgust: lastEntry.state_in_after[8] || node.emotional_vector_in?.disgust || 0,
          joy: lastEntry.state_in_after[9] || node.emotional_vector_in?.joy || 0,
        };
        node.emotional_vector_out = {
          subjectivity: lastEntry.state_out_after[0] || node.emotional_vector_out?.subjectivity || 0,
          polarity: lastEntry.state_out_after[1] || node.emotional_vector_out?.polarity || 0,
          fear: lastEntry.state_out_after[2] || node.emotional_vector_out?.fear || 0,
          anger: lastEntry.state_out_after[3] || node.emotional_vector_out?.anger || 0,
          anticipation: lastEntry.state_out_after[4] || node.emotional_vector_out?.anticipation || 0,
          trust: lastEntry.state_out_after[5] || node.emotional_vector_out?.trust || 0,
          surprise: lastEntry.state_out_after[6] || node.emotional_vector_out?.surprise || 0,
          sadness: lastEntry.state_out_after[7] || node.emotional_vector_out?.sadness || 0,
          disgust: lastEntry.state_out_after[8] || node.emotional_vector_out?.disgust || 0,
          joy: lastEntry.state_out_after[9] || node.emotional_vector_out?.joy || 0,
        };
      }
    });

    // Actualizar el estado sin crear nuevos objetos de nodos
    if (viewMode === 'barabasi-behavior') {
      setBaGraphData({ ...baGraphData });
    } else {
      setHkGraphData({ ...hkGraphData });
    }

    setEmotionVector(emotionVector);
    const linksToHighlight = propagationLog
      .filter(entry => entry.sender && entry.receiver && entry.t !== undefined)
      .sort((a, b) => a.t - b.t)
      .map((entry, index) => ({
        source: String(entry.sender),
        target: String(entry.receiver),
        timeStep: entry.t,
        animationDelay: index * 4000,
        vector: entry.state_in_after,
        action: entry.action, // Incluir la acción del log de propagación
      }));
    setHighlightedLinks(linksToHighlight);
    setHighlightId(String(selectedUser));
    setIsPropagationModalOpen(false);
    setIsNodeStatesModalOpen(false);
  } catch (error) {
    console.error('Propagation error:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    let errorMessage = 'Error desconocido';
    if (error.response?.status === 422) {
      errorMessage = `Error de validación (422): ${error.response?.data?.detail || 'Datos inválidos enviados al servidor'}`;
    } else if (error.response?.data?.detail) {
      errorMessage = `Error: ${error.response.data.detail}`;
    } else if (error.message) {
      errorMessage = `Error: ${error.message}`;
    }
    
    setPropagationStatus(errorMessage);
    setPropagationResult(null);
  }
};

  const handlePropagation = async ({ selectedUser, message, method, thresholds, csvFile, xlsxFile, emotionVector, k, policy, clusterFiltering, propagationName }) => {
    if (!selectedUser || !message.trim() || !csvFile || !xlsxFile) {
      setPropagationStatus('Por favor selecciona un usuario, escribe un mensaje y sube ambos archivos.');
      return;
    }
    setPropagationStatus('Iniciando propagación…');
    try {
      const formData = new FormData();
      formData.append('seed_user', selectedUser);
      formData.append('message', message);
      formData.append('csv_file', csvFile);
      formData.append('xlsx_file', xlsxFile);
      formData.append('max_steps', 4);
      formData.append('method', method);
      formData.append('thresholds', JSON.stringify(thresholds));
      formData.append('k', k.toString());
      formData.append('policy', policy);
      formData.append('cluster_filtering', clusterFiltering);
      formData.append('propagation_name', propagationName);
      formData.append('tipo_red', 'real-world');  // Tipo de red explícito para modo simulation
      formData.append('metodo', 'RIP-DSN');  // Método de propagación explícito
      formData.append('network_id', realWorldSelectedNet);  // ID de red seleccionada
      if (nodesCsvFile) {
        formData.append('nodes_file', nodesCsvFile);  // Archivo de nodos
      }
      if (emotionVector && Object.values(emotionVector).some(val => val !== 0)) {
        formData.append('custom_vector', JSON.stringify(emotionVector));
      }
      const response = await axios.post('http://localhost:8000/propagate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPropagationResult(response.data);
      setPropagationStatus(`Propagación completada con método ${method.toUpperCase()}.`);
      const propagationLog = response.data.log || [];
      setPropagationLog(propagationLog);
      setEmotionVector(emotionVector);
      const linksToHighlight = propagationLog
        .filter(entry => entry.sender && entry.receiver && entry.t !== undefined)
        .sort((a, b) => a.t - b.t)
        .map((entry, index) => {
          const link = {
            source: String(entry.sender),
            target: String(entry.receiver),
            timeStep: entry.t,
            animationDelay: index * 4000,
            vector: entry.state_in_after,
            action: entry.action, // Incluir la acción del log de propagación
          };
          return link;
        });
      setHighlightedLinks(linksToHighlight);
      setHighlightId(selectedUser);
      setIsPropagationModalOpen(false);
      setIsNodeStatesModalOpen(false);
    } catch (error) {
      console.error('Propagation error:', error);
      setPropagationStatus(`Error: ${error.response?.data?.detail || error.message}`);
      setPropagationResult(null);
    }
  };

  // Hook personalizado para propagación Real World SIR
  const handleRwSIRPropagation = useRWSIRPropagation({
    realWorldGraphData,
    setRwSIRPropagationStatus,
    setRwSIRBeta,
    setRwSIRGamma,
    setSelectedUser,
    setShowRwSIRPropagationResult,
    setRwSIRPropagationLog,
    setRwSIRHighlightedLinks,
    setHighlightId,
  });

  // Hook personalizado para propagación Real World SIS
  const handleRwSISPropagation = useRWSISPropagation({
    realWorldGraphData,
    setRwSISPropagationStatus,
    setRwSISBeta,
    setRwSISGamma,
    setSelectedUser,
    setShowRwSISPropagationResult,
    setRwSISPropagationLog,
    setRwSISHighlightedLinks,
    setHighlightId,
  });

  // Limpiar estados de propagación cuando cambie el viewMode
  useEffect(() => {
    // Limpiar todos los estados de propagación al cambiar de módulo
    setHighlightId('');
    setSelectedUser('');
    
    // Limpiar estados de Barabási-Albert
    setBaSIRPropagationStatus('');
    setBaSIRHighlightedLinks([]);
    setBaSIRPropagationLog([]);
    setShowBaSIRPropagationResult(false);
    setBaSISPropagationStatus('');
    setBaSISHighlightedLinks([]);
    setBaSISPropagationLog([]);
    setShowBaSISPropagationResult(false);
    
    // Limpiar estados de Holme-Kim
    setHkSIRPropagationStatus('');
    setHkSIRHighlightedLinks([]);
    setHkSIRPropagationLog([]);
    setShowHkSIRPropagationResult(false);
    setHkSISPropagationStatus('');
    setHkSISHighlightedLinks([]);
    setHkSISPropagationLog([]);
    setShowHkSISPropagationResult(false);
    
    // Limpiar estados de Real World SIR
    setRwSIRPropagationStatus('');
    setRwSIRPropagationResult(null);
    setRwSIRHighlightedLinks([]);
    setRwSIRPropagationLog([]);
    
    // Limpiar estados de simulación
    setPropagationStatus('');
    setPropagationResult(null);
    setHighlightedLinks([]);
    setPropagationLog([]);
    
    // Cerrar modales
    setIsNodeModalOpen(false);
    setIsPropagationModalOpen(false);
    setIsNodeStatesModalOpen(false);
    setIsCentralityModalOpen(false);
    setModalNode(null);
  }, [viewMode]);

  const handleResetView = () => {
    setHighlightId('');
    setSearchText('');
    setIsCentralityModalOpen(false);
    if (viewMode === 'simulation') {
      setMessage('');
      setSelectedUser('');
      setPropagationStatus('');
      setPropagationResult(null);
      setHighlightedLinks([]);
      setPropagationLog([]);
      setIsNodeModalOpen(false);
      setIsPropagationModalOpen(false);
      setIsNodeStatesModalOpen(false);
      setModalNode(null);
      setMethod('ema');
      setThresholds({
        "High-Credibility Informant": { forward: 0.8, modify: 0.2, ignore: 0.05, alpha: 0.3 },
        "Emotionally-Driven Amplifier": { forward: 0.95, modify: 0.6, ignore: 0.1, alpha: 0.8 },
        "Mobilisation-Oriented Catalyst": { forward: 0.6, modify: 0.7, ignore: 0.3, alpha: 0.7 },
        "Emotionally Exposed Participant": { forward: 0.3, modify: 0.4, ignore: 0.7, alpha: 0.6 },
      });
      setEmotionVector(null);
    } else if (viewMode === 'real-world-sir') {
      setSelectedUser('');
      setRwSIRPropagationStatus('');
      setRwSIRPropagationResult(null);
      setRwSIRHighlightedLinks([]);
      setRwSIRPropagationLog([]);
      setShowRwSIRPropagationResult(false);
    } else if (viewMode === 'real-world-sis') {
      setSelectedUser('');
      setRwSISPropagationStatus('');
      setRwSISPropagationResult(null);
      setRwSISHighlightedLinks([]);
      setRwSISPropagationLog([]);
      setShowRwSISPropagationResult(false);
    } else if (viewMode === 'barabasi-si') {
      setSelectedUser('');
      setBaSIRPropagationStatus('');
      setBaSIRHighlightedLinks([]);
      setBaSIRPropagationLog([]);
      setShowBaSIRPropagationResult(false);
      setShowBaSISPropagationResult(false);
    } else if (viewMode === 'holme-kim-si') {
      setSelectedUser('');
      setHkSIRPropagationStatus('');
      setHkSIRHighlightedLinks([]);
      setHkSIRPropagationLog([]);
      setShowHkSIRPropagationResult(false);
    } else if (viewMode === 'holme-kim-sis') {
      setSelectedUser('');
      setHkSISPropagationStatus('');
      setHkSISHighlightedLinks([]);
      setHkSISPropagationLog([]);
      setShowHkSISPropagationResult(false);
    }
  };

  const getInvolvedNodes = () => {
    const nodeIds = new Set();
    let currentLog = propagationLog;
    let currentGraphData = graphData;
    
    // Determinar qué log usar según el viewMode
    if (viewMode === 'barabasi-si') {
      currentLog = baSIRPropagationLog;
      currentGraphData = baGraphData;
    } else if (viewMode === 'barabasi-sis') {
      currentLog = baSISPropagationLog;
      currentGraphData = baGraphData;
    } else if (viewMode === 'holme-kim-si') {
      currentLog = hkSIRPropagationLog;
      currentGraphData = hkGraphData;
    } else if (viewMode === 'holme-kim-sis') {
      currentLog = hkSISPropagationLog;
      currentGraphData = hkGraphData;
    }
    
    currentLog.forEach(entry => {
      if (entry.sender) nodeIds.add(entry.sender);
      if (entry.receiver) nodeIds.add(entry.receiver);
    });

    return Array.from(nodeIds).map(id => {
      const node = currentGraphData.nodes.find(node => node.id === id);
      const nodeHistory = currentLog
        .filter(entry => entry.receiver === id)
        .sort((a, b) => a.t - b.t);
      let initialState = nodeHistory.length > 0 && nodeHistory[0].state_in_before
        ? nodeHistory[0].state_in_before
        : null;
      if (!initialState && node) {
        initialState = emotionKeys.map(key => {
          const attrKey = `in_${key}`;
          return node[attrKey] != null ? Number(node[attrKey]) : 0;
        });
      }
      initialState = initialState && Array.isArray(initialState) && initialState.length === 10
        ? initialState.map(Number)
        : Array(10).fill(0);
      const finalState = nodeHistory.length > 0
        ? nodeHistory[nodeHistory.length - 1].state_in_after
        : null;
      const validFinalState = finalState && Array.isArray(finalState) && finalState.length === 10
        ? finalState.map(Number)
        : Array(10).fill(0);
      return {
        id,
        initialState,
        finalState: validFinalState,
      };
    });
  };

  return (
    <div className="app-container">
      <div className="main-content">
        <ControlPanel onMenuSelect={handleMenuSelect} currentViewMode={viewMode} setCurrentNetworkType={setCurrentNetworkType} />
        
        {viewMode === 'welcome' && (
          <div className="welcome-message" style={{ textAlign: 'center' }}>
            <img src={redImage} alt="Red Social" style={{ maxWidth: '100%', maxHeight: '250px', opacity: 0.4 }} />
            <p>Seleccione un tipo de red y un módulo para comenzar.</p>
          </div>
        )}
        {viewMode === 'reports' && (
          <ReportsDashboard />
        )}
        {viewMode === 'simulation' && (
          <>
            <NetworkControls
              currentViewMode={viewMode}
              currentNetworkType={currentNetworkType}
              onGenerateBaNetwork={handleGenerateBaNetwork}
              onLoadBaNetwork={handleLoadBaNetwork}
              baGraphData={baGraphData}
              baNodesWithCentrality={baNodesWithCentrality}
              onGenerateHkNetwork={handleGenerateHkNetwork}
              onLoadHkNetwork={handleLoadHkNetwork}
              hkGraphData={hkGraphData}
              hkNodesWithCentrality={hkNodesWithCentrality}
              csvFile={csvFile}
              setCsvFile={setCsvFile}
              xlsxFile={xlsxFile}
              setXlsxFile={setXlsxFile}
              networkList={networkList}
              selectedNet={selectedNet}
              setSelectedNet={setSelectedNet}
              nodesCsvFile={nodesCsvFile}
              setNodesCsvFile={setNodesCsvFile}
              linksCsvFile={linksCsvFile}
              setLinksCsvFile={setLinksCsvFile}
              realWorldNetworkList={realWorldNetworkList}
              realWorldSelectedNet={realWorldSelectedNet}
              setRealWorldSelectedNet={setRealWorldSelectedNet}
              searchText={searchText}
              setSearchText={setSearchText}
              highlightId={highlightId}
              setHighlightId={setHighlightId}
              status={status}
              realWorldStatus={realWorldStatus}
              baStatus={baStatus}
              hkStatus={hkStatus}
              handleResetView={handleResetView}
              onStartBaSIRPropagation={handleBaSIRPropagation}
              onStartBaSISPropagation={handleBaSISPropagation}
              onStartHkSIRPropagation={handleHkSIRPropagation}
              setIsPropagationModalOpen={setIsPropagationModalOpen}
              setIsNodeStatesModalOpen={setIsNodeStatesModalOpen}
              propagationLog={propagationLog}
              baSIRPropagationLog={baSIRPropagationLog}
              hkSIRPropagationLog={hkSIRPropagationLog}
              nodeVectors={nodeVectors}
              onGenerateVectors={handleGenerateVectors}
            />
            
            <div className="simulation-layout">
              <div className="left-panel">
                <PropagationHistory 
                  propagationLog={propagationLog}
                  viewMode={viewMode}
                  selectedUser={selectedUser}
                  onClose={() => {
                    setPropagationResult(null);
                    setPropagationLog([]);
                    setHighlightedLinks([]);
                    setEmotionVector(null);
                  }}
                  emotionVector={emotionVector}
                  isCentralityModalOpen={isCentralityModalOpen}
                  setIsCentralityModalOpen={setIsCentralityModalOpen}
                  modalNode={modalNode}
                />
              </div>
              <div className="right-panel">
           
                <div className="graph-container">
                  <Graph3D
                    data={realWorldGraphData}
                    nodesWithCentrality={realWorldNodesWithCentrality}
                    onNodeInfo={handleNodeClick}
                    highlightId={highlightId}
                    highlightedLinks={highlightedLinks}
                    onResetView={handleResetView}
                    currentViewMode={viewMode}
                  />
                </div>
              </div>
            </div>
            <PropagationModal
              isOpen={isPropagationModalOpen}
              setIsOpen={setIsPropagationModalOpen}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              message={message}
              setMessage={setMessage}
              nodes={realWorldNodesWithCentrality}
              handlePropagation={handlePropagation}
              propagationStatus={propagationStatus}
              method={method}
              setMethod={setMethod}
              thresholds={thresholds}
              setThresholds={setThresholds}
              csvFile={linksCsvFile}
              xlsxFile={xlsxFile}
              setEmotionVector={setEmotionVector}
              isBehaviorMode={true}
              networkType="real-world"
              isDirected={true}
            />
            <NodeModal
              isOpen={isNodeModalOpen}
              setIsOpen={setIsNodeModalOpen}
              modalNode={modalNode}
              propagationLog={propagationLog}
            />
            <NodeStatesModal
              isOpen={isNodeStatesModalOpen}
              setIsOpen={setIsNodeStatesModalOpen}
              involvedNodes={getInvolvedNodes()}
              propagationLog={propagationLog}
            />
            <PropagationResult
              propagationLog={propagationLog}
              selectedUser={selectedUser}
              onClose={() => {
                setPropagationResult(null);
                setPropagationLog([]);
                setHighlightedLinks([]);
                setEmotionVector(null);
              }}
              emotionVector={emotionVector}
            />
          </>
        )}
        {viewMode === 'real-world' && (
          <>
            <NetworkControls
              currentViewMode={viewMode}
              currentNetworkType={currentNetworkType}
              onGenerateBaNetwork={handleGenerateBaNetwork}
              onLoadBaNetwork={handleLoadBaNetwork}
              baGraphData={baGraphData}
              baNodesWithCentrality={baNodesWithCentrality}
              onGenerateHkNetwork={handleGenerateHkNetwork}
              onLoadHkNetwork={handleLoadHkNetwork}
              hkGraphData={hkGraphData}
              hkNodesWithCentrality={hkNodesWithCentrality}
              csvFile={csvFile}
              setCsvFile={setCsvFile}
              xlsxFile={xlsxFile}
              setXlsxFile={setXlsxFile}
              networkList={networkList}
              selectedNet={selectedNet}
              setSelectedNet={setSelectedNet}
              nodesCsvFile={nodesCsvFile}
              setNodesCsvFile={setNodesCsvFile}
              linksCsvFile={linksCsvFile}
              setLinksCsvFile={setLinksCsvFile}
              realWorldNetworkList={realWorldNetworkList}
              realWorldSelectedNet={realWorldSelectedNet}
              setRealWorldSelectedNet={setRealWorldSelectedNet}
              searchText={searchText}
              setSearchText={setSearchText}
              highlightId={highlightId}
              setHighlightId={setHighlightId}
              status={status}
              realWorldStatus={realWorldStatus}
              baStatus={baStatus}
              hkStatus={hkStatus}
              handleResetView={handleResetView}
              onStartBaSIRPropagation={handleBaSIRPropagation}
              onStartBaSISPropagation={handleBaSISPropagation}
              onStartHkSIRPropagation={handleHkSIRPropagation}
              setIsPropagationModalOpen={setIsPropagationModalOpen}
              setIsNodeStatesModalOpen={setIsNodeStatesModalOpen}
              propagationLog={propagationLog}
              baSIRPropagationLog={baSIRPropagationLog}
              hkSIRPropagationLog={hkSIRPropagationLog}
              nodeVectors={nodeVectors}
              onGenerateVectors={handleGenerateVectors}
            />
            
            <div className="simulation-layout">
              <div className="left-panel">
                <PropagationHistory 
                  propagationLog={[]} 
                  title="Red HR"
                  viewMode={viewMode}
                  isCentralityModalOpen={isCentralityModalOpen}
                  setIsCentralityModalOpen={setIsCentralityModalOpen}
                  modalNode={modalNode}
                />
              </div>
              <div className="right-panel">
                <div className="graph-container">
                  <RealWorldGraph3D
                    data={realWorldGraphData}
                    nodesWithCentrality={realWorldNodesWithCentrality}
                    onNodeInfo={handleNodeClick}
                    highlightId={highlightId}
                    onResetView={handleResetView}
                    currentViewMode={viewMode}
                  />
                </div>
              </div>
            </div>
          </>
        )}
        {viewMode === 'real-world-sir' && (
          <>
            <NetworkControls
              currentViewMode={viewMode}
              currentNetworkType={currentNetworkType}
              onGenerateBaNetwork={handleGenerateBaNetwork}
              onLoadBaNetwork={handleLoadBaNetwork}
              baGraphData={baGraphData}
              baNodesWithCentrality={baNodesWithCentrality}
              onGenerateHkNetwork={handleGenerateHkNetwork}
              onLoadHkNetwork={handleLoadHkNetwork}
              hkGraphData={hkGraphData}
              hkNodesWithCentrality={hkNodesWithCentrality}
              csvFile={csvFile}
              setCsvFile={setCsvFile}
              xlsxFile={xlsxFile}
              setXlsxFile={setXlsxFile}
              networkList={networkList}
              selectedNet={selectedNet}
              setSelectedNet={setSelectedNet}
              nodesCsvFile={nodesCsvFile}
              setNodesCsvFile={setNodesCsvFile}
              linksCsvFile={linksCsvFile}
              setLinksCsvFile={setLinksCsvFile}
              realWorldNetworkList={realWorldNetworkList}
              realWorldSelectedNet={realWorldSelectedNet}
              setRealWorldSelectedNet={setRealWorldSelectedNet}
              realWorldGraphData={realWorldGraphData}
              realWorldNodesWithCentrality={realWorldNodesWithCentrality}
              searchText={searchText}
              setSearchText={setSearchText}
              highlightId={highlightId}
              setHighlightId={setHighlightId}
              status={status}
              realWorldStatus={realWorldStatus}
              baStatus={baStatus}
              hkStatus={hkStatus}
              handleResetView={handleResetView}
              onStartBaSIRPropagation={handleBaSIRPropagation}
              onStartBaSISPropagation={handleBaSISPropagation}
              onStartHkSIRPropagation={handleHkSIRPropagation}
              onStartRwSIRPropagation={handleRwSIRPropagation}
              setIsPropagationModalOpen={setIsPropagationModalOpen}
              setIsNodeStatesModalOpen={setIsNodeStatesModalOpen}
              propagationLog={propagationLog}
              baSIRPropagationLog={baSIRPropagationLog}
              hkSIRPropagationLog={hkSIRPropagationLog}
              nodeVectors={nodeVectors}
              onGenerateVectors={handleGenerateVectors}
            />
            
            <div className="simulation-layout">
              <div className="left-panel">
                <PropagationHistory 
                  propagationLog={rwSIRPropagationLog} 
                  title="Historial de propagación en red HR"
                  viewMode={viewMode}
                  selectedUser={selectedUser}
                  onClose={() => {
                    setRwSIRPropagationResult(null);
                    setRwSIRPropagationLog([]);
                    setRwSIRHighlightedLinks([]);
                  }}
                  isCentralityModalOpen={isCentralityModalOpen}
                  setIsCentralityModalOpen={setIsCentralityModalOpen}
                  modalNode={modalNode}
                />
              </div>
              <div className="right-panel">
                <div className="graph-container">
                  <RealWorldSIRGraph3D
                    data={realWorldGraphData}
                    nodesWithCentrality={realWorldNodesWithCentrality}
                    onNodeInfo={handleNodeClick}
                    highlightId={highlightId}
                    highlightedLinks={rwSIRHighlightedLinks}
                    onResetView={handleResetView}
                    currentViewMode={viewMode}
                    selectedUser={selectedUser}
                  />
                </div>
              </div>
            </div>
            <NodeModal
              isOpen={isNodeModalOpen}
              setIsOpen={setIsNodeModalOpen}
              modalNode={modalNode}
              propagationLog={rwSIRPropagationLog}
            />
          </>
        )}
        {viewMode === 'real-world-sis' && (
          <>
            <NetworkControls
              currentViewMode={viewMode}
              currentNetworkType={currentNetworkType}
              onGenerateBaNetwork={handleGenerateBaNetwork}
              onLoadBaNetwork={handleLoadBaNetwork}
              baGraphData={baGraphData}
              baNodesWithCentrality={baNodesWithCentrality}
              onGenerateHkNetwork={handleGenerateHkNetwork}
              onLoadHkNetwork={handleLoadHkNetwork}
              hkGraphData={hkGraphData}
              hkNodesWithCentrality={hkNodesWithCentrality}
              csvFile={csvFile}
              setCsvFile={setCsvFile}
              xlsxFile={xlsxFile}
              setXlsxFile={setXlsxFile}
              networkList={networkList}
              selectedNet={selectedNet}
              setSelectedNet={setSelectedNet}
              nodesCsvFile={nodesCsvFile}
              setNodesCsvFile={setNodesCsvFile}
              linksCsvFile={linksCsvFile}
              setLinksCsvFile={setLinksCsvFile}
              realWorldNetworkList={realWorldNetworkList}
              realWorldSelectedNet={realWorldSelectedNet}
              setRealWorldSelectedNet={setRealWorldSelectedNet}
              realWorldGraphData={realWorldGraphData}
              realWorldNodesWithCentrality={realWorldNodesWithCentrality}
              searchText={searchText}
              setSearchText={setSearchText}
              highlightId={highlightId}
              setHighlightId={setHighlightId}
              status={status}
              realWorldStatus={realWorldStatus}
              baStatus={baStatus}
              hkStatus={hkStatus}
              handleResetView={handleResetView}
              onStartBaSIRPropagation={handleBaSIRPropagation}
              onStartBaSISPropagation={handleBaSISPropagation}
              onStartHkSIRPropagation={handleHkSIRPropagation}
              onStartRwSIRPropagation={handleRwSIRPropagation}
              onStartRwSISPropagation={handleRwSISPropagation}
              setIsPropagationModalOpen={setIsPropagationModalOpen}
              setIsNodeStatesModalOpen={setIsNodeStatesModalOpen}
              propagationLog={propagationLog}
              baSIRPropagationLog={baSIRPropagationLog}
              hkSIRPropagationLog={hkSIRPropagationLog}
              nodeVectors={nodeVectors}
              onGenerateVectors={handleGenerateVectors}
            />
            
            <div className="simulation-layout">
              <div className="left-panel">
                <PropagationHistory 
                  propagationLog={rwSISPropagationLog} 
                  title="Historial de propagación en red HR"
                  viewMode={viewMode}
                  selectedUser={selectedUser}
                  onClose={() => {
                    setRwSISPropagationResult(null);
                    setRwSISPropagationLog([]);
                    setRwSISHighlightedLinks([]);
                  }}
                  isCentralityModalOpen={isCentralityModalOpen}
                  setIsCentralityModalOpen={setIsCentralityModalOpen}
                  modalNode={modalNode}
                />
              </div>
              <div className="right-panel">
                <div className="graph-container">
                  <RealWorldSISGraph3D
                    data={realWorldGraphData}
                    nodesWithCentrality={realWorldNodesWithCentrality}
                    onNodeInfo={handleNodeClick}
                    highlightId={highlightId}
                    highlightedLinks={rwSISHighlightedLinks}
                    onResetView={handleResetView}
                    currentViewMode={viewMode}
                    selectedUser={selectedUser}
                  />
                </div>
              </div>
            </div>
            <NodeModal
              isOpen={isNodeModalOpen}
              setIsOpen={setIsNodeModalOpen}
              modalNode={modalNode}
              propagationLog={rwSISPropagationLog}
            />
          </>
        )}
        {viewMode === 'barabasi-albert' && (
          <>
            <NetworkControls
              currentViewMode={viewMode}
              currentNetworkType={currentNetworkType}
              onGenerateBaNetwork={handleGenerateBaNetwork}
              onLoadBaNetwork={handleLoadBaNetwork}
              baGraphData={baGraphData}
              baNodesWithCentrality={baNodesWithCentrality}
              onGenerateHkNetwork={handleGenerateHkNetwork}
              onLoadHkNetwork={handleLoadHkNetwork}
              hkGraphData={hkGraphData}
              hkNodesWithCentrality={hkNodesWithCentrality}
              csvFile={csvFile}
              setCsvFile={setCsvFile}
              xlsxFile={xlsxFile}
              setXlsxFile={setXlsxFile}
              networkList={networkList}
              selectedNet={selectedNet}
              setSelectedNet={setSelectedNet}
              nodesCsvFile={nodesCsvFile}
              setNodesCsvFile={setNodesCsvFile}
              linksCsvFile={linksCsvFile}
              setLinksCsvFile={setLinksCsvFile}
              realWorldNetworkList={realWorldNetworkList}
              realWorldSelectedNet={realWorldSelectedNet}
              setRealWorldSelectedNet={setRealWorldSelectedNet}
              searchText={searchText}
              setSearchText={setSearchText}
              highlightId={highlightId}
              setHighlightId={setHighlightId}
              status={status}
              realWorldStatus={realWorldStatus}
              baStatus={baStatus}
              hkStatus={hkStatus}
              handleResetView={handleResetView}
              onStartBaSIRPropagation={handleBaSIRPropagation}
              onStartBaSISPropagation={handleBaSISPropagation}
              onStartHkSIRPropagation={handleHkSIRPropagation}
              setIsPropagationModalOpen={setIsPropagationModalOpen}
              setIsNodeStatesModalOpen={setIsNodeStatesModalOpen}
              propagationLog={propagationLog}
              baSIRPropagationLog={baSIRPropagationLog}
              hkSIRPropagationLog={hkSIRPropagationLog}
              nodeVectors={nodeVectors}
              onGenerateVectors={handleGenerateVectors}
            />
            
            <div className="simulation-layout">
              <div className="left-panel">
                <PropagationHistory 
                  propagationLog={[]} 
                  title="Red Barabási-Albert"
                  viewMode={viewMode}
                  isCentralityModalOpen={isCentralityModalOpen}
                  setIsCentralityModalOpen={setIsCentralityModalOpen}
                  modalNode={modalNode}
                />
              </div>
              <div className="right-panel">
                <div className="graph-container">
                  <BarabasiAlbertGraph3D
                    data={baGraphData}
                    nodesWithCentrality={baNodesWithCentrality}
                    onNodeInfo={handleNodeClick}
                    highlightId={highlightId}
                    onResetView={handleResetView}
                  />
                </div>
              </div>
            </div>
          </>
        )}
        {viewMode === 'barabasi-si' && (
          <>
            <NetworkControls
              currentViewMode={viewMode}
              currentNetworkType={currentNetworkType}
              onGenerateBaNetwork={handleGenerateBaNetwork}
              onLoadBaNetwork={handleLoadBaNetwork}
              baGraphData={baGraphData}
              baNodesWithCentrality={baNodesWithCentrality}
              onGenerateHkNetwork={handleGenerateHkNetwork}
              onLoadHkNetwork={handleLoadHkNetwork}
              hkGraphData={hkGraphData}
              hkNodesWithCentrality={hkNodesWithCentrality}
              csvFile={csvFile}
              setCsvFile={setCsvFile}
              xlsxFile={xlsxFile}
              setXlsxFile={setXlsxFile}
              networkList={networkList}
              selectedNet={selectedNet}
              setSelectedNet={setSelectedNet}
              nodesCsvFile={nodesCsvFile}
              setNodesCsvFile={setNodesCsvFile}
              linksCsvFile={linksCsvFile}
              setLinksCsvFile={setLinksCsvFile}
              realWorldNetworkList={realWorldNetworkList}
              realWorldSelectedNet={realWorldSelectedNet}
              setRealWorldSelectedNet={setRealWorldSelectedNet}
              searchText={searchText}
              setSearchText={setSearchText}
              highlightId={highlightId}
              setHighlightId={setHighlightId}
              status={status}
              realWorldStatus={realWorldStatus}
              baStatus={baStatus}
              hkStatus={hkStatus}
              handleResetView={handleResetView}
              onStartBaSIRPropagation={handleBaSIRPropagation}
              onStartBaSISPropagation={handleBaSISPropagation}
              onStartHkSIRPropagation={handleHkSIRPropagation}
              setIsPropagationModalOpen={setIsPropagationModalOpen}
              setIsNodeStatesModalOpen={setIsNodeStatesModalOpen}
              propagationLog={propagationLog}
              baSIRPropagationLog={baSIRPropagationLog}
              hkSIRPropagationLog={hkSIRPropagationLog}
              nodeVectors={nodeVectors}
              onGenerateVectors={handleGenerateVectors}
            />
            <div className="simulation-layout">
              <div className="left-panel">
                <PropagationHistory
                  propagationLog={baSIRPropagationLog}
                  viewMode={viewMode}
                  selectedUser={selectedUser}
                  onClose={() => {
                    setShowBaSIRPropagationResult(false);
                    setBaSIRPropagationLog([]);
                    setBaSIRHighlightedLinks([]);
                  }}
                  emotionVector={emotionVector}
                  showBaSIRPropagationResult={showBaSIRPropagationResult}
                  onCloseBaSIRPropagationResult={() => {
                    setShowBaSIRPropagationResult(false);
                    setBaSIRPropagationLog([]);
                    setBaSIRHighlightedLinks([]);
                  }}
                  isCentralityModalOpen={isCentralityModalOpen}
                  setIsCentralityModalOpen={setIsCentralityModalOpen}
                  modalNode={modalNode}
                />
              </div>
              <div className="right-panel">
                <div className="graph-container">
                  <BarabasiSIRGraph3D
                    data={baGraphData}
                    nodesWithCentrality={baNodesWithCentrality}
                    onNodeInfo={handleNodeClick}
                    highlightedLinks={baSIRHighlightedLinks}
                    highlightId={highlightId}
                    onResetView={handleResetView}
                    beta={baSIRBeta}
                    gamma={baSIRGamma}
                    selectedUser={showBaSIRPropagationResult ? selectedUser : ''}
                  />
                </div>
              </div>
            </div>
            <PropagationModal
              isOpen={isPropagationModalOpen}
              setIsOpen={setIsPropagationModalOpen}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              message={message}
              setMessage={setMessage}
              nodes={baNodesWithCentrality}
              handlePropagation={handleBaSIRPropagation}
              propagationStatus={baSIRPropagationStatus}
              method={method}
              setMethod={setMethod}
              thresholds={thresholds}
              setThresholds={setThresholds}
              csvFile={null}
              xlsxFile={null}
              setEmotionVector={setEmotionVector}
              isBehaviorMode={false}
              networkType="barabasi"
              isDirected={false}
            />
            <NodeModal
              isOpen={isNodeModalOpen}
              setIsOpen={setIsNodeModalOpen}
              modalNode={modalNode}
              propagationLog={baSIRPropagationLog}
            />
            <NodeStatesModal
              isOpen={isNodeStatesModalOpen}
              setIsOpen={setIsNodeStatesModalOpen}
              involvedNodes={getInvolvedNodes()}
              propagationLog={baSIRPropagationLog}
            />
          </>
        )}
        {viewMode === 'barabasi-sis' && (
          <>
            <NetworkControls
              currentViewMode={viewMode}
              currentNetworkType={currentNetworkType}
              onGenerateBaNetwork={handleGenerateBaNetwork}
              onLoadBaNetwork={handleLoadBaNetwork}
              baGraphData={baGraphData}
              baNodesWithCentrality={baNodesWithCentrality}
              onGenerateHkNetwork={handleGenerateHkNetwork}
              onLoadHkNetwork={handleLoadHkNetwork}
              hkGraphData={hkGraphData}
              hkNodesWithCentrality={hkNodesWithCentrality}
              csvFile={csvFile}
              setCsvFile={setCsvFile}
              xlsxFile={xlsxFile}
              setXlsxFile={setXlsxFile}
              networkList={networkList}
              selectedNet={selectedNet}
              setSelectedNet={setSelectedNet}
              nodesCsvFile={nodesCsvFile}
              setNodesCsvFile={setNodesCsvFile}
              linksCsvFile={linksCsvFile}
              setLinksCsvFile={setLinksCsvFile}
              realWorldNetworkList={realWorldNetworkList}
              realWorldSelectedNet={realWorldSelectedNet}
              setRealWorldSelectedNet={setRealWorldSelectedNet}
              searchText={searchText}
              setSearchText={setSearchText}
              highlightId={highlightId}
              setHighlightId={setHighlightId}
              status={status}
              realWorldStatus={realWorldStatus}
              baStatus={baStatus}
              hkStatus={hkStatus}
              handleResetView={handleResetView}
              onStartBaSIRPropagation={handleBaSIRPropagation}
              onStartBaSISPropagation={handleBaSISPropagation}
              onStartHkSIRPropagation={handleHkSIRPropagation}
              setIsPropagationModalOpen={setIsPropagationModalOpen}
              setIsNodeStatesModalOpen={setIsNodeStatesModalOpen}
              propagationLog={propagationLog}
              baSIRPropagationLog={baSIRPropagationLog}
              baSISPropagationLog={baSISPropagationLog}
              hkSIRPropagationLog={hkSIRPropagationLog}
              nodeVectors={nodeVectors}
              onGenerateVectors={handleGenerateVectors}
            />
            <div className="simulation-layout">
              <div className="left-panel">
                <PropagationHistory
                  propagationLog={baSISPropagationLog}
                  viewMode={viewMode}
                  selectedUser={selectedUser}
                  onClose={() => {
                    setShowBaSISPropagationResult(false);
                    setBaSISPropagationLog([]);
                    setBaSISHighlightedLinks([]);
                  }}
                  emotionVector={emotionVector}
                  showBaSISPropagationResult={showBaSISPropagationResult}
                  onCloseBaSISPropagationResult={() => {
                    setShowBaSISPropagationResult(false);
                    setBaSISPropagationLog([]);
                    setBaSISHighlightedLinks([]);
                  }}
                  isCentralityModalOpen={isCentralityModalOpen}
                  setIsCentralityModalOpen={setIsCentralityModalOpen}
                  modalNode={modalNode}
                />
              </div>
              <div className="right-panel">
                <div className="graph-container">
                  <BarabasiSISGraph3D
                    data={baGraphData}
                    nodesWithCentrality={baNodesWithCentrality}
                    onNodeInfo={handleNodeClick}
                    highlightedLinks={baSISHighlightedLinks}
                    highlightId={highlightId}
                    onResetView={handleResetView}
                    beta={baSISBeta}
                    gamma={baSISGamma}
                    selectedUser={showBaSISPropagationResult ? selectedUser : ''}
                  />
                </div>
              </div>
            </div>
            <PropagationModal
              isOpen={isPropagationModalOpen}
              setIsOpen={setIsPropagationModalOpen}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              message={message}
              setMessage={setMessage}
              nodes={baNodesWithCentrality}
              handlePropagation={handleBaSISPropagation}
              propagationStatus={baSISPropagationStatus}
              method={method}
              setMethod={setMethod}
              thresholds={thresholds}
              setThresholds={setThresholds}
              csvFile={null}
              xlsxFile={null}
              setEmotionVector={setEmotionVector}
              isBehaviorMode={false}
              networkType="barabasi"
              isDirected={false}
            />
            <NodeModal
              isOpen={isNodeModalOpen}
              setIsOpen={setIsNodeModalOpen}
              modalNode={modalNode}
              propagationLog={baSISPropagationLog}
            />
            <NodeStatesModal
              isOpen={isNodeStatesModalOpen}
              setIsOpen={setIsNodeStatesModalOpen}
              involvedNodes={getInvolvedNodes()}
              propagationLog={baSISPropagationLog}
            />
          </>
        )}
        {viewMode === 'holme-kim' && (
          <>
            <NetworkControls
              currentViewMode={viewMode}
              currentNetworkType={currentNetworkType}
              onGenerateBaNetwork={handleGenerateBaNetwork}
              onLoadBaNetwork={handleLoadBaNetwork}
              baGraphData={baGraphData}
              baNodesWithCentrality={baNodesWithCentrality}
              onGenerateHkNetwork={handleGenerateHkNetwork}
              onLoadHkNetwork={handleLoadHkNetwork}
              hkGraphData={hkGraphData}
              hkNodesWithCentrality={hkNodesWithCentrality}
              csvFile={csvFile}
              setCsvFile={setCsvFile}
              xlsxFile={xlsxFile}
              setXlsxFile={setXlsxFile}
              networkList={networkList}
              selectedNet={selectedNet}
              setSelectedNet={setSelectedNet}
              nodesCsvFile={nodesCsvFile}
              setNodesCsvFile={setNodesCsvFile}
              linksCsvFile={linksCsvFile}
              setLinksCsvFile={setLinksCsvFile}
              realWorldNetworkList={realWorldNetworkList}
              realWorldSelectedNet={realWorldSelectedNet}
              setRealWorldSelectedNet={setRealWorldSelectedNet}
              searchText={searchText}
              setSearchText={setSearchText}
              highlightId={highlightId}
              setHighlightId={setHighlightId}
              status={status}
              realWorldStatus={realWorldStatus}
              baStatus={baStatus}
              hkStatus={hkStatus}
              handleResetView={handleResetView}
              onStartBaSIRPropagation={handleBaSIRPropagation}
              onStartBaSISPropagation={handleBaSISPropagation}
              onStartHkSIRPropagation={handleHkSIRPropagation}
              setIsPropagationModalOpen={setIsPropagationModalOpen}
              setIsNodeStatesModalOpen={setIsNodeStatesModalOpen}
              propagationLog={propagationLog}
              baSIRPropagationLog={baSIRPropagationLog}
              hkSIRPropagationLog={hkSIRPropagationLog}
              nodeVectors={nodeVectors}
              onGenerateVectors={handleGenerateVectors}
            />
            
            <div className="simulation-layout">
              <div className="left-panel">
                <PropagationHistory 
                  propagationLog={[]} 
                  title="Red Holme-Kim"
                  viewMode={viewMode}
                  isCentralityModalOpen={isCentralityModalOpen}
                  setIsCentralityModalOpen={setIsCentralityModalOpen}
                  modalNode={modalNode}
                />
              </div>
              <div className="right-panel">
                <div className="graph-container">
                  <HolmeKimGraph3D
                    data={hkGraphData}
                    nodesWithCentrality={hkNodesWithCentrality}
                    onNodeInfo={handleNodeClick}
                    highlightId={highlightId}
                    onResetView={handleResetView}
                  />
                </div>
              </div>
            </div>
          </>
        )}
        {viewMode === 'holme-kim-si' && (
          <>
            <NetworkControls
              currentViewMode={viewMode}
              currentNetworkType={currentNetworkType}
              onGenerateBaNetwork={handleGenerateBaNetwork}
              onLoadBaNetwork={handleLoadBaNetwork}
              baGraphData={baGraphData}
              baNodesWithCentrality={baNodesWithCentrality}
              onGenerateHkNetwork={handleGenerateHkNetwork}
              onLoadHkNetwork={handleLoadHkNetwork}
              hkGraphData={hkGraphData}
              hkNodesWithCentrality={hkNodesWithCentrality}
              csvFile={csvFile}
              setCsvFile={setCsvFile}
              xlsxFile={xlsxFile}
              setXlsxFile={setXlsxFile}
              networkList={networkList}
              selectedNet={selectedNet}
              setSelectedNet={setSelectedNet}
              nodesCsvFile={nodesCsvFile}
              setNodesCsvFile={setNodesCsvFile}
              linksCsvFile={linksCsvFile}
              setLinksCsvFile={setLinksCsvFile}
              realWorldNetworkList={realWorldNetworkList}
              realWorldSelectedNet={realWorldSelectedNet}
              setRealWorldSelectedNet={setRealWorldSelectedNet}
              searchText={searchText}
              setSearchText={setSearchText}
              highlightId={highlightId}
              setHighlightId={setHighlightId}
              status={status}
              realWorldStatus={realWorldStatus}
              baStatus={baStatus}
              hkStatus={hkStatus}
              handleResetView={handleResetView}
              onStartBaSIRPropagation={handleBaSIRPropagation}
              onStartBaSISPropagation={handleBaSISPropagation}
              onStartHkSIRPropagation={handleHkSIRPropagation}
              setIsPropagationModalOpen={setIsPropagationModalOpen}
              setIsNodeStatesModalOpen={setIsNodeStatesModalOpen}
              propagationLog={propagationLog}
              baSIRPropagationLog={baSIRPropagationLog}
              hkSIRPropagationLog={hkSIRPropagationLog}
              nodeVectors={nodeVectors}
              onGenerateVectors={handleGenerateVectors}
            />
            <div className="simulation-layout">
              <div className="left-panel">
                <PropagationHistory
                  propagationLog={hkSIRPropagationLog}
                  viewMode={viewMode}
                  selectedUser={selectedUser}
                  onClose={handleCloseHkSIRPropagationResult}
                  showHkSIRPropagationResult={showHkSIRPropagationResult}
                  onCloseHkSIRPropagationResult={handleCloseHkSIRPropagationResult}
                  isCentralityModalOpen={isCentralityModalOpen}
                  setIsCentralityModalOpen={setIsCentralityModalOpen}
                  modalNode={modalNode}
                />
              </div>
              <div className="right-panel">
                <div className="graph-container">
                  <HolmeKimSIRGraph3D
                    data={hkGraphData}
                    nodesWithCentrality={hkNodesWithCentrality}
                    onNodeInfo={handleNodeClick}
                    highlightedLinks={hkSIRHighlightedLinks}
                    highlightId={highlightId}
                    onResetView={handleResetView}
                    beta={hkSIRBeta}
                    gamma={hkSIRGamma}
                    selectedUser={selectedUser}
                  />
                </div>
              </div>
            </div>
            <PropagationModal
              isOpen={isPropagationModalOpen}
              setIsOpen={setIsPropagationModalOpen}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              message={message}
              setMessage={setMessage}
              nodes={hkNodesWithCentrality}
              handlePropagation={handleHkSIRPropagation}
              propagationStatus={hkSIRPropagationStatus}
              method={method}
              setMethod={setMethod}
              thresholds={thresholds}
              setThresholds={setThresholds}
              csvFile={null}
              xlsxFile={null}
              setEmotionVector={setEmotionVector}
              isBehaviorMode={false}
              networkType="holme-kim"
              isDirected={true}
            />
            <NodeModal
              isOpen={isNodeModalOpen}
              setIsOpen={setIsNodeModalOpen}
              modalNode={modalNode}
              propagationLog={hkSIRPropagationLog}
            />
            <NodeStatesModal
              isOpen={isNodeStatesModalOpen}
              setIsOpen={setIsNodeStatesModalOpen}
              involvedNodes={getInvolvedNodes()}
              propagationLog={hkSIRPropagationLog}
            />
          </>
        )}
        {viewMode === 'holme-kim-sis' && (
          <>
            <NetworkControls
              currentViewMode={viewMode}
              currentNetworkType={currentNetworkType}
              onGenerateBaNetwork={handleGenerateBaNetwork}
              onLoadBaNetwork={handleLoadBaNetwork}
              baGraphData={baGraphData}
              baNodesWithCentrality={baNodesWithCentrality}
              onGenerateHkNetwork={handleGenerateHkNetwork}
              onLoadHkNetwork={handleLoadHkNetwork}
              hkGraphData={hkGraphData}
              hkNodesWithCentrality={hkNodesWithCentrality}
              csvFile={csvFile}
              setCsvFile={setCsvFile}
              xlsxFile={xlsxFile}
              setXlsxFile={setXlsxFile}
              networkList={networkList}
              selectedNet={selectedNet}
              setSelectedNet={setSelectedNet}
              nodesCsvFile={nodesCsvFile}
              setNodesCsvFile={setNodesCsvFile}
              linksCsvFile={linksCsvFile}
              setLinksCsvFile={setLinksCsvFile}
              realWorldNetworkList={realWorldNetworkList}
              realWorldSelectedNet={realWorldSelectedNet}
              setRealWorldSelectedNet={setRealWorldSelectedNet}
              searchText={searchText}
              setSearchText={setSearchText}
              highlightId={highlightId}
              setHighlightId={setHighlightId}
              status={status}
              realWorldStatus={realWorldStatus}
              baStatus={baStatus}
              hkStatus={hkStatus}
              handleResetView={handleResetView}
              onStartBaSIRPropagation={handleBaSIRPropagation}
              onStartBaSISPropagation={handleBaSISPropagation}
              onStartHkSIRPropagation={handleHkSIRPropagation}
              onStartHkSISPropagation={handleHkSISPropagation}
              setIsPropagationModalOpen={setIsPropagationModalOpen}
              setIsNodeStatesModalOpen={setIsNodeStatesModalOpen}
              propagationLog={propagationLog}
              baSIRPropagationLog={baSIRPropagationLog}
              baSISPropagationLog={baSISPropagationLog}
              hkSIRPropagationLog={hkSIRPropagationLog}
              hkSISPropagationLog={hkSISPropagationLog}
              nodeVectors={nodeVectors}
              onGenerateVectors={handleGenerateVectors}
            />
            <div className="simulation-layout">
              <div className="left-panel">
                <PropagationHistory
                  propagationLog={hkSISPropagationLog}
                  viewMode={viewMode}
                  selectedUser={selectedUser}
                  onClose={handleCloseHkSISPropagationResult}
                  showHkSISPropagationResult={showHkSISPropagationResult}
                  onCloseHkSISPropagationResult={handleCloseHkSISPropagationResult}
                  isCentralityModalOpen={isCentralityModalOpen}
                  setIsCentralityModalOpen={setIsCentralityModalOpen}
                  modalNode={modalNode}
                />
              </div>
              <div className="right-panel">
                <div className="graph-container">
                  <HolmeKimSISGraph3D
                    data={hkGraphData}
                    nodesWithCentrality={hkNodesWithCentrality}
                    onNodeInfo={handleNodeClick}
                    highlightedLinks={hkSISHighlightedLinks}
                    highlightId={highlightId}
                    onResetView={handleResetView}
                    beta={hkSISBeta}
                    gamma={hkSISGamma}
                    selectedUser={selectedUser}
                  />
                </div>
              </div>
            </div>
            <PropagationModal
              isOpen={isPropagationModalOpen}
              setIsOpen={setIsPropagationModalOpen}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              message={message}
              setMessage={setMessage}
              nodes={hkNodesWithCentrality}
              handlePropagation={handleHkSISPropagation}
              propagationStatus={hkSISPropagationStatus}
              method={method}
              setMethod={setMethod}
              thresholds={thresholds}
              setThresholds={setThresholds}
              csvFile={null}
              xlsxFile={null}
              setEmotionVector={setEmotionVector}
              isBehaviorMode={false}
              networkType="holme-kim"
              isDirected={true}
            />
            <NodeModal
              isOpen={isNodeModalOpen}
              setIsOpen={setIsNodeModalOpen}
              modalNode={modalNode}
              propagationLog={hkSISPropagationLog}
            />
            <NodeStatesModal
              isOpen={isNodeStatesModalOpen}
              setIsOpen={setIsNodeStatesModalOpen}
              involvedNodes={getInvolvedNodes()}
              propagationLog={hkSISPropagationLog}
            />
          </>
        )}
        {viewMode === 'barabasi-behavior' && (
          <>
            <NetworkControls
              currentViewMode={viewMode}
              currentNetworkType={currentNetworkType}
              onGenerateBaNetwork={handleGenerateBaNetwork}
              onLoadBaNetwork={handleLoadBaNetwork}
              baGraphData={baGraphData}
              baNodesWithCentrality={baNodesWithCentrality}
              onGenerateHkNetwork={handleGenerateHkNetwork}
              onLoadHkNetwork={handleLoadHkNetwork}
              hkGraphData={hkGraphData}
              hkNodesWithCentrality={hkNodesWithCentrality}
              csvFile={csvFile}
              setCsvFile={setCsvFile}
              xlsxFile={xlsxFile}
              setXlsxFile={setXlsxFile}
              networkList={networkList}
              selectedNet={selectedNet}
              setSelectedNet={setSelectedNet}
              nodesCsvFile={nodesCsvFile}
              setNodesCsvFile={setNodesCsvFile}
              linksCsvFile={linksCsvFile}
              setLinksCsvFile={setLinksCsvFile}
              realWorldNetworkList={realWorldNetworkList}
              realWorldSelectedNet={realWorldSelectedNet}
              setRealWorldSelectedNet={setRealWorldSelectedNet}
              searchText={searchText}
              setSearchText={setSearchText}
              highlightId={highlightId}
              setHighlightId={setHighlightId}
              status={status}
              realWorldStatus={realWorldStatus}
              baStatus={baStatus}
              hkStatus={hkStatus}
              handleResetView={handleResetView}
              onStartBaSIRPropagation={handleBaSIRPropagation}
              onStartBaSISPropagation={handleBaSISPropagation}
              onStartHkSIRPropagation={handleHkSIRPropagation}
              setIsPropagationModalOpen={setIsPropagationModalOpen}
              setIsNodeStatesModalOpen={setIsNodeStatesModalOpen}
              propagationLog={propagationLog}
              baSIRPropagationLog={baSIRPropagationLog}
              hkSIRPropagationLog={hkSIRPropagationLog}
              nodeVectors={nodeVectors}
              onGenerateVectors={handleGenerateVectors}
            />
            
            <div className="simulation-layout">
              <div className="left-panel">
                <PropagationHistory 
                    propagationLog={propagationLog}
                    viewMode={viewMode}
                    selectedUser={selectedUser}
                    onClose={() => {
                      setPropagationResult(null);
                      setPropagationLog([]);
                      setHighlightedLinks([]);
                      setEmotionVector(null);
                    }}
                    emotionVector={emotionVector}
                    isCentralityModalOpen={isCentralityModalOpen}
                    setIsCentralityModalOpen={setIsCentralityModalOpen}
                    modalNode={modalNode}
                  />
              </div>
              <div className="right-panel">
          
                <div className="graph-container">
                  <BarabasiBehaviorGraph3D
                    data={baGraphData}
                    nodesWithCentrality={baNodesWithCentrality}
                    onNodeInfo={handleNodeClick}
                    highlightId={highlightId}
                    highlightedLinks={highlightedLinks}
                    onResetView={handleResetView}
                    currentViewMode={viewMode}
                  />
                </div>
              </div>
            </div>
            <PropagationModal
              isOpen={isPropagationModalOpen}
              setIsOpen={setIsPropagationModalOpen}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              message={message}
              setMessage={setMessage}
              nodes={baNodesWithCentrality}
              handlePropagation={handleVectorPropagation}
              propagationStatus={propagationStatus}
              method={method}
              setMethod={setMethod}
              thresholds={thresholds}
              setThresholds={setThresholds}
              csvFile={null}
              xlsxFile={null}
              setEmotionVector={setEmotionVector}
              isBehaviorMode={true}
              networkType="barabasi"
              isDirected={false}
            />
            <NodeModal
              isOpen={isNodeModalOpen}
              setIsOpen={setIsNodeModalOpen}
              modalNode={modalNode}
              propagationLog={propagationLog}
            />
            <NodeStatesModal
              isOpen={isNodeStatesModalOpen}
              setIsOpen={setIsNodeStatesModalOpen}
              involvedNodes={getInvolvedNodes()}
              propagationLog={propagationLog}
            />
          </>
        )}
        {viewMode === 'holme-kim-behavior' && (
          <>
            <NetworkControls
              currentViewMode={viewMode}
              currentNetworkType={currentNetworkType}
              onGenerateBaNetwork={handleGenerateBaNetwork}
              onLoadBaNetwork={handleLoadBaNetwork}
              baGraphData={baGraphData}
              baNodesWithCentrality={baNodesWithCentrality}
              onGenerateHkNetwork={handleGenerateHkNetwork}
              onLoadHkNetwork={handleLoadHkNetwork}
              hkGraphData={hkGraphData}
              hkNodesWithCentrality={hkNodesWithCentrality}
              csvFile={csvFile}
              setCsvFile={setCsvFile}
              xlsxFile={xlsxFile}
              setXlsxFile={setXlsxFile}
              networkList={networkList}
              selectedNet={selectedNet}
              setSelectedNet={setSelectedNet}
              nodesCsvFile={nodesCsvFile}
              setNodesCsvFile={setNodesCsvFile}
              linksCsvFile={linksCsvFile}
              setLinksCsvFile={setLinksCsvFile}
              realWorldNetworkList={realWorldNetworkList}
              realWorldSelectedNet={realWorldSelectedNet}
              setRealWorldSelectedNet={setRealWorldSelectedNet}
              searchText={searchText}
              setSearchText={setSearchText}
              highlightId={highlightId}
              setHighlightId={setHighlightId}
              status={status}
              realWorldStatus={realWorldStatus}
              baStatus={baStatus}
              hkStatus={hkStatus}
              handleResetView={handleResetView}
              onStartBaSIRPropagation={handleBaSIRPropagation}
              onStartBaSISPropagation={handleBaSISPropagation}
              onStartHkSIRPropagation={handleHkSIRPropagation}
              setIsPropagationModalOpen={setIsPropagationModalOpen}
              setIsNodeStatesModalOpen={setIsNodeStatesModalOpen}
              propagationLog={propagationLog}
              baSIRPropagationLog={baSIRPropagationLog}
              hkSIRPropagationLog={hkSIRPropagationLog}
              nodeVectors={nodeVectors}
              onGenerateVectors={handleGenerateVectors}
            />
            
            <div className="simulation-layout">
              <div className="left-panel">
                <PropagationHistory 
                  propagationLog={propagationLog}
                  viewMode={viewMode}
                  selectedUser={selectedUser}
                  onClose={() => {
                    setPropagationResult(null);
                    setPropagationLog([]);
                    setHighlightedLinks([]);
                    setEmotionVector(null);
                  }}
                  emotionVector={emotionVector}
                  isCentralityModalOpen={isCentralityModalOpen}
                  setIsCentralityModalOpen={setIsCentralityModalOpen}
                  modalNode={modalNode}
                />
              </div>
              <div className="right-panel">
                <div className="graph-container">
                  <HolmeKimBehaviorGraph3D
                    data={hkGraphData}
                    nodesWithCentrality={hkNodesWithCentrality}
                    onNodeInfo={handleNodeClick}
                    highlightId={highlightId}
                    highlightedLinks={highlightedLinks}
                    onResetView={handleResetView}
                    currentViewMode={viewMode}
                  />
                </div>
              </div>
            </div>
            <PropagationModal
              isOpen={isPropagationModalOpen}
              setIsOpen={setIsPropagationModalOpen}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              message={message}
              setMessage={setMessage}
              nodes={hkNodesWithCentrality}
              handlePropagation={handleVectorPropagation}
              propagationStatus={propagationStatus}
              method={method}
              setMethod={setMethod}
              thresholds={thresholds}
              setThresholds={setThresholds}
              csvFile={null}
              xlsxFile={null}
              setEmotionVector={setEmotionVector}
              isBehaviorMode={true}
              networkType="holme-kim"
              isDirected={true}
            />
            <NodeModal
              isOpen={isNodeModalOpen}
              setIsOpen={setIsNodeModalOpen}
              modalNode={modalNode}
              propagationLog={propagationLog}
            />
            <NodeStatesModal
              isOpen={isNodeStatesModalOpen}
              setIsOpen={setIsNodeStatesModalOpen}
              involvedNodes={getInvolvedNodes()}
              propagationLog={propagationLog}
            />

          </>
        )}
      </div>
      
    </div>
  );
}