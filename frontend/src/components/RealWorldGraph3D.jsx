import { useEffect, useRef, useState, memo } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import SpriteText from 'three-spritetext';
import SearchPanel from './SearchPanel';

function RealWorldGraph3D({ data, nodesWithCentrality, onNodeInfo, highlightId, onResetView }) {
  const fgRef = useRef();
  const isTransitioning = useRef(false);
  const [tempHighlightId, setTempHighlightId] = useState('');
  const [searchText, setSearchText] = useState('');
  const [internalHighlightId, setInternalHighlightId] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchTrigger, setSearchTrigger] = useState(0);

  // Colores
  const defaultNodeColor = '#7b8a84'; // Gris predeterminado
  const highlightNodeColor = '#FFFF00'; // Amarillo fosforescente para resaltado

  // Función para normalizar el highlightId
  const normalizeNodeId = (id) => {
    if (typeof id === 'string' && id.startsWith('user_')) {
      return id.replace('user_', '');
    }
    return id;
  };

  // Función para comparar IDs de nodos (maneja diferentes formatos)
  const compareNodeIds = (nodeId, highlightId) => {
    if (!nodeId || !highlightId) return false;
    
    // Comparación directa
    if (nodeId === highlightId) return true;
    
    // Normalizar ambos IDs y comparar
    const normalizedNodeId = normalizeNodeId(nodeId);
    const normalizedHighlightId = normalizeNodeId(highlightId);
    
    return normalizedNodeId === normalizedHighlightId;
  };

  // Centra la red al cargar o cambiar datos
  useEffect(() => {
    if (!isTransitioning.current && fgRef.current) {
      setTimeout(() => {
        if (fgRef.current) {
          fgRef.current.zoomToFit(400, 0);
        }
      }, 200);
    }
  }, [data.nodes, data.links]);

  // Función para manejar el highlight desde el SearchPanel
  const handleSetHighlightId = (id) => {
    const searchValue = id.trim();
    if (!searchValue) return;

    // Normalizar el ID de búsqueda
    const normalizedSearchId = normalizeNodeId(searchValue);
    
    // Buscar el nodo con diferentes variaciones del ID
    let node = data.nodes.find(n => n.id === searchValue); // Búsqueda exacta
    if (!node) {
      node = data.nodes.find(n => n.id === normalizedSearchId); // Búsqueda normalizada
    }
    if (!node) {
      node = data.nodes.find(n => n.id === `user_${searchValue}`); // Con prefijo user_
    }
    if (!node) {
      node = data.nodes.find(n => n.id === `user_${normalizedSearchId}`); // Normalizado con prefijo
    }
    
    if (!node) {
      console.warn('Nodo no encontrado. Buscando:', { searchValue, normalizedSearchId });
      console.log('IDs disponibles en la red:', data.nodes.slice(0, 10).map(n => n.id));
      alert(`Nodo "${searchValue}" no encontrado en la red`);
      return;
    }

    // Limpiar el resaltado temporal actual para forzar nueva animación
    setTempHighlightId('');
    
    // Establecer el highlight interno con el ID real del nodo
    setInternalHighlightId(node.id);
    setSelectedNode(node);
    
    // Incrementar el trigger para forzar nueva animación
    setSearchTrigger(prev => prev + 1);
  };

  // Función para resetear la vista
  const handleResetView = () => {
    setSearchText('');
    setInternalHighlightId('');
    setTempHighlightId('');
    setSelectedNode(null);
    if (onResetView) {
      onResetView();
    }
  };

  // Enfoca al nodo destacado y activa el resaltado temporal
  useEffect(() => {
    const currentHighlightId = internalHighlightId || highlightId;
    if (!currentHighlightId || !fgRef.current || !data.nodes.length || isTransitioning.current) return;

    // Activar resaltado temporal con el ID real
    setTempHighlightId(currentHighlightId);

    // Limpiar resaltado después de 5 segundos
    const timer = setTimeout(() => {
      setTempHighlightId('');
    }, 5000);

    // Buscar el nodo usando la misma lógica que en handleSetHighlightId
    let node = data.nodes.find(n => n.id === currentHighlightId);
    if (!node) {
      const normalizedId = normalizeNodeId(currentHighlightId);
      node = data.nodes.find(n => n.id === normalizedId);
    }
    if (!node) {
      node = data.nodes.find(n => n.id === `user_${currentHighlightId}`);
    }
    if (!node) {
      const normalizedId = normalizeNodeId(currentHighlightId);
      node = data.nodes.find(n => n.id === `user_${normalizedId}`);
    }
    
    if (!node) {
      console.warn('Nodo no encontrado para enfoque:', currentHighlightId);
      return;
    }

    const focusNode = () => {
      isTransitioning.current = true;
      const { x = 0, y = 0, z = 0 } = node;
      const bounds = calculateGraphBounds(data.nodes);
      const graphSize = Math.max(bounds.maxDistance, 10);
      const distance = graphSize * 1.5;

      fgRef.current.cameraPosition(
        { x: x + distance, y: y + distance * 0.5, z },
        { x, y, z },
        1500
      );

      setTimeout(() => {
        isTransitioning.current = false;
      }, 1600); // Esperar a que termine la animación
    };

    setTimeout(focusNode, 100);

    return () => clearTimeout(timer);
  }, [internalHighlightId, highlightId, data.nodes, searchTrigger]);

  // Resetea la vista
  useEffect(() => {
    if (!highlightId && !internalHighlightId && fgRef.current && !isTransitioning.current) {
      isTransitioning.current = true;
      fgRef.current.zoomToFit(400, 0);
      setTempHighlightId('');
      setTimeout(() => {
        isTransitioning.current = false;
      }, 500);
    }
  }, [highlightId, internalHighlightId]);

  // Calcular límites del grafo
  const calculateGraphBounds = (nodes) => {
    if (!nodes.length) return { maxDistance: 10 };

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const x = node.x || 0;
      const y = node.y || 0;
      const z = node.z || 0;

      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    }

    return {
      maxDistance: Math.max(maxX - minX, maxY - minY, maxZ - minZ)
    };
  };

  // Manejar clic en nodo
  const handleNodeClick = (node) => {
    setSelectedNode(node);
    onNodeInfo(node);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <ForceGraph3D
        ref={fgRef}
        graphData={data}
        backgroundColor="#111"
        linkOpacity={0.4}
        linkWidth={0.8}
        linkColor="#828282"
        linkDirectionalArrowLength={5}
        linkDirectionalArrowRelPos={1}
        linkDirectionalArrowColor="#FFFFFF"
        linkDirectionalArrowResolution={8}
        d3VelocityDecay={0.3}
        warmupTicks={100}
        cooldownTicks={100}
        onNodeClick={handleNodeClick}
        nodeThreeObject={node => {
          const group = new THREE.Group();

          const material = new THREE.MeshBasicMaterial({
            color: compareNodeIds(node.id, tempHighlightId) ? highlightNodeColor : defaultNodeColor,
            transparent: true,
            opacity: 1,
          });

          const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(6, 16, 16),
            material
          );
          group.add(sphere);

          const label = new SpriteText(String(node.id));
          label.color = 'white';
          label.textHeight = 3;
          label.material.depthWrite = false;
          label.material.depthTest = false;
          group.add(label);

          return group;
        }}
        width={window.innerWidth - 250}
        height={window.innerHeight - 120}
      />
      
      {/* SearchPanel flotante en la esquina superior derecha */}
      <div className="floating-search-panel">
        <SearchPanel
          searchText={searchText}
          setSearchText={setSearchText}
          highlightId={internalHighlightId}
          setHighlightId={handleSetHighlightId}
          status=""
          selectedNode={null}
          handleResetView={handleResetView}
        />
      </div>
    </div>
  );
}

export default memo(RealWorldGraph3D);