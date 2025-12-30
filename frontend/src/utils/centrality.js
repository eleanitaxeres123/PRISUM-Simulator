// src/utils/centrality.js
import Graph from 'graphology';
import { degree, betweenness, closeness, inDegree, outDegree, eigenvector, pagerank } from 'graphology-metrics/centrality/index.js';

export function calculateCentralityMetrics(nodes, links) {
  // Crear grafos dirigido y no dirigido
  const directedGraph = new Graph({ type: 'directed' });
  const undirectedGraph = new Graph({ type: 'undirected' });
  
  // Agregar nodos a ambos grafos
  nodes.forEach(node => {
    const nodeId = String(node.id);
    if (!directedGraph.hasNode(nodeId)) {
      directedGraph.addNode(nodeId, { ...node });
      undirectedGraph.addNode(nodeId, { ...node });
    }
  });
  
  // Agregar enlaces a ambos grafos
  // Manejar tanto el caso donde source/target son strings como objetos
  links.forEach(link => {
    const source = typeof link.source === 'object' ? String(link.source.id) : String(link.source);
    const target = typeof link.target === 'object' ? String(link.target.id) : String(link.target);
    
    if (directedGraph.hasNode(source) && directedGraph.hasNode(target)) {
      try {
        // Evitar agregar enlaces duplicados
        if (!directedGraph.hasEdge(source, target)) {
          directedGraph.addEdge(source, target);
        }
        if (!undirectedGraph.hasEdge(source, target)) {
          undirectedGraph.addEdge(source, target);
        }
      } catch (error) {
        console.warn(`Error al agregar enlace ${source} -> ${target}:`, error);
      }
    } else {
      console.warn(`Nodo no encontrado: source=${source}, target=${target}`);
    }
  });

  // Calcular métricas de centralidad usando graphology-metrics con parámetros precisos
  const degreeCentralityValues = degree(directedGraph);
  const inDegreeCentralityValues = inDegree(directedGraph);
  const outDegreeCentralityValues = outDegree(directedGraph);
  const betweennessCentralityValues = betweenness(directedGraph, { 
    normalized: true,
    nodeCentralityAttribute: 'betweennessCentrality'
  });
  const closenessCentralityValues = closeness(directedGraph, { 
    wassermanFaust: true,
    nodeCentralityAttribute: 'closenessCentrality'
  });
  const pagerankCentralityValues = pagerank(directedGraph, {
    nodeCentralityAttribute: 'pagerankCentrality'
  });
  
  // Eigenvector requiere grafo no dirigido
  const eigenvectorCentralityValues = eigenvector(undirectedGraph, {
    nodeCentralityAttribute: 'eigenvectorCentrality'
  });

  // Crear el mapa de nodos con las métricas calculadas
  const nodeMap = new Map();
  nodes.forEach(node => {
    const nodeId = String(node.id);
    const inDegree = directedGraph.inDegree(nodeId);
    const outDegree = directedGraph.outDegree(nodeId);
    const totalDegree = directedGraph.degree(nodeId);
    
    const nodeData = {
      ...node,
      inDegree,
      outDegree,
      degreeCentralityIn: inDegreeCentralityValues[nodeId] || 0,
      degreeCentralityOut: outDegreeCentralityValues[nodeId] || 0,
      degreeCentrality: degreeCentralityValues[nodeId] || 0,
      betweennessCentrality: betweennessCentralityValues[nodeId] || 0,
      closenessCentrality: closenessCentralityValues[nodeId] || 0,
      eigenvectorCentrality: eigenvectorCentralityValues[nodeId] || 0,
      pagerankCentrality: pagerankCentralityValues[nodeId] || 0
    };
    
    nodeMap.set(nodeId, nodeData);
  });

  return Array.from(nodeMap.values());
}