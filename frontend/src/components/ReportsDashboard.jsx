import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as XLSX from 'xlsx';
import './ReportsDashboard.css';
import ReportDetailModal from './ReportDetailModal';

export default function ReportsDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredReports, setFilteredReports] = useState([]);
  const [filters, setFilters] = useState({
    networkType: '',
    propagationMethod: '',
    cluster: '',
    policy: '',
    dateFrom: '',
    dateTo: ''
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showExportMode, setShowExportMode] = useState(false);
  const [selectedReportsForExport, setSelectedReportsForExport] = useState(new Set());

  // Cargar datos de reportes desde MongoDB
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        
        // Primero probar conectividad con el backend
        const testResponse = await fetch('http://localhost:8000/api/test');
        if (!testResponse.ok) {
          throw new Error('No se puede conectar con el servidor backend. Verifique que esté ejecutándose en el puerto 8000.');
        }
        
        // Si la conexión es exitosa, obtener los reportes
        const response = await fetch('http://localhost:8000/api/reports');
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Endpoint de reportes no encontrado. Verifique que el servidor backend esté actualizado.');
          }
          throw new Error(`Error del servidor: ${response.status}`);
        }
        const data = await response.json();
        console.log('Datos recibidos del backend:', data);
        
        // Validar que los datos sean un array
        if (!Array.isArray(data)) {
          console.error('Los datos recibidos no son un array:', data);
          throw new Error('Formato de datos inválido del servidor');
        }
        
        console.log('Primer reporte:', data[0]);
        setReports(data);
        setFilteredReports(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let filtered = reports;

    // Mostrar todos los reportes por defecto (sin filtro restrictivo)

    if (filters.networkType) {
      filtered = filtered.filter(report => 
        report.networkType.toLowerCase().includes(filters.networkType.toLowerCase())
      );
    }

    if (filters.propagationMethod) {
      filtered = filtered.filter(report => {
        const reportMethod = report.propagationMethod ? report.propagationMethod.toLowerCase() : '';
        const filterMethod = filters.propagationMethod.toLowerCase();
        
        // Mapeo de variaciones del método RIP-DSN
        if (filterMethod === 'rip-dsn') {
          return reportMethod.includes('rip-dsn') || reportMethod.includes('rip-dns');
        }
        
        // Para métodos SIR y SIS, hacer comparación exacta o parcial
        if (filterMethod === 'sir') {
          return reportMethod.includes('sir');
        }
        if (filterMethod === 'sis') {
          return reportMethod.includes('sis');
        }
        
        // Para cualquier otro método, hacer comparación parcial
        return reportMethod.includes(filterMethod);
      });
    }

    if (filters.cluster) {
      filtered = filtered.filter(report => {
        const reportCluster = report.cluster_filtering || report.clusterFiltering || '';
        const filterCluster = filters.cluster.toLowerCase();
        
        // Mapeo de variaciones del filtro de cluster
        if (filterCluster === 'todos') {
          return reportCluster.toLowerCase().includes('todos') || reportCluster.toLowerCase().includes('all');
        }
        
        return reportCluster.toLowerCase().includes(filterCluster);
      });
    }

    if (filters.policy) {
      filtered = filtered.filter(report => {
        const reportPolicy = report.policy || '';
        return reportPolicy.toLowerCase().includes(filters.policy.toLowerCase());
      });
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(report => 
        new Date(report.createdAt) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(report => 
        new Date(report.createdAt) <= new Date(filters.dateTo)
      );
    }

    setFilteredReports(filtered);
  }, [reports, filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      networkType: '',
      propagationMethod: '',
      cluster: '',
      policy: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const handleViewDetail = (report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedReport(null);
  };

  const handleExportModeToggle = () => {
    setShowExportMode(!showExportMode);
    if (showExportMode) {
      setSelectedReportsForExport(new Set());
    }
  };

  const handleReportSelection = (reportId) => {
    const newSelection = new Set(selectedReportsForExport);
    if (newSelection.has(reportId)) {
      newSelection.delete(reportId);
    } else {
      newSelection.add(reportId);
    }
    setSelectedReportsForExport(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedReportsForExport.size === filteredReports.length) {
      setSelectedReportsForExport(new Set());
    } else {
      setSelectedReportsForExport(new Set(filteredReports.map(report => report._id || report.id)));
    }
  };

  // Función para extraer valores individuales de T Pico y New T
  const extractPeakTimeValues = (peakTime) => {
    console.log('Extrayendo valores de:', peakTime, 'Tipo:', typeof peakTime);
    
    if (!peakTime || peakTime === 'N/A') {
      console.log('Valor vacío o N/A, retornando objeto vacío');
      return {};
    }
    
    const values = {};
    
    if (typeof peakTime === 'object' && peakTime !== null) {
      console.log('Es un objeto, claves disponibles:', Object.keys(peakTime));
      
      // Buscar claves numéricas (1, 2, 3, etc.) o que empiecen con 't'
      const timeKeys = Object.keys(peakTime).filter(key => 
        /^\d+$/.test(key) || /^t\d+$/.test(key) || /^step\d+$/.test(key) || /^time\d+$/.test(key)
      ).sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ''));
        const numB = parseInt(b.replace(/\D/g, ''));
        return numA - numB;
      });
      
      console.log('Claves de tiempo encontradas:', timeKeys);
      
      timeKeys.forEach(key => {
        const value = peakTime[key];
        console.log(`Procesando ${key}:`, value);
        if (value !== null && value !== undefined) {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            // Convertir clave numérica a formato t0, t1, t2, etc.
            const numericKey = parseInt(key.replace(/\D/g, ''));
            const formattedKey = `t${numericKey}`;
            values[formattedKey] = Math.round(numValue).toString();
            console.log(`Valor numérico agregado: ${formattedKey} = ${Math.round(numValue)}`);
          }
        }
      });
    } else {
      console.log('Es un valor simple:', peakTime);
      // Si es un valor simple
      const numValue = parseFloat(peakTime);
      if (!isNaN(numValue) && isFinite(numValue)) {
        values['t0'] = Math.round(numValue).toString();
        console.log('Valor simple agregado: t0 =', Math.round(numValue));
      }
    }
    
    console.log('Valores finales extraídos:', values);
    return values;
  };

  const exportToExcel = () => {
    if (selectedReportsForExport.size === 0) {
      alert('Por favor selecciona al menos un reporte para exportar.');
      return;
    }

    const selectedReports = filteredReports.filter(report => 
      selectedReportsForExport.has(report._id || report.id)
    );

    // Encontrar el máximo número de valores en T Pico y New T para determinar columnas
    let maxPeakTimeColumns = 0;
    let maxNewTColumns = 0;
    
    console.log('Procesando', selectedReports.length, 'reportes para exportación');
    
    selectedReports.forEach((report, index) => {
      console.log(`\n--- Reporte ${index + 1} ---`);
      console.log('peakTime:', report.peakTime);
      console.log('new_t:', report.new_t);
      
      const peakTimeValues = extractPeakTimeValues(report.peakTime);
      const newTValues = extractPeakTimeValues(report.new_t);
      
      console.log('peakTimeValues extraídos:', peakTimeValues);
      console.log('newTValues extraídos:', newTValues);
      
      maxPeakTimeColumns = Math.max(maxPeakTimeColumns, Object.keys(peakTimeValues).length);
      maxNewTColumns = Math.max(maxNewTColumns, Object.keys(newTValues).length);
    });
    
    console.log('Máximo de columnas T Pico:', maxPeakTimeColumns);
    console.log('Máximo de columnas New T:', maxNewTColumns);

    // Preparar datos para Excel con columnas expandidas
    const excelData = selectedReports.map(report => {
      const peakTimeValues = extractPeakTimeValues(report.peakTime);
      const newTValues = extractPeakTimeValues(report.new_t);
      
      // Crear objeto base con columnas fijas (excluyendo Cluster, Alcance Final y Fecha)
      const row = {
        'Nombre': report.propagationName || 'Sin nombre',
        'Tipo de Red': report.networkType || 'N/A',
        'Método': report.propagationMethod || 'N/A',
        'Num. Nodos': report.totalNodes || report.total_nodes || 'N/A',
        'Política': typeof report.policy === 'object' ? JSON.stringify(report.policy) : (report.policy || 'N/A')
      };

      // Agregar columnas dinámicas para T Pico
      for (let i = 1; i <= maxPeakTimeColumns; i++) {
        const key = `t${i}`;
        row[`T Pico ${key}`] = peakTimeValues[key] || '';
      }

      // Agregar columnas dinámicas para New T
      for (let i = 1; i <= maxNewTColumns; i++) {
        const key = `t${i}`;
        row[`New T ${key}`] = newTValues[key] || '';
      }

      // Agregar T Máximo después de New T
      row['T Máximo'] = formatMaxPeakTime(report.maxPeakTime || report.t_max);

      return row;
    });

    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Ajustar ancho de columnas dinámicamente (sin Cluster, Alcance Final y Fecha)
    const colWidths = [
      { wch: 20 }, // Nombre
      { wch: 15 }, // Tipo de Red
      { wch: 12 }, // Método
      { wch: 12 }, // Num. Nodos
      { wch: 15 }  // Política
    ];

    // Agregar anchos para columnas de T Pico
    for (let i = 1; i <= maxPeakTimeColumns; i++) {
      colWidths.push({ wch: 10 });
    }

    // Agregar anchos para columnas de New T
    for (let i = 1; i <= maxNewTColumns; i++) {
      colWidths.push({ wch: 10 });
    }

    // Agregar ancho para T Máximo
    colWidths.push({ wch: 10 });

    ws['!cols'] = colWidths;

    // Agregar hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Reportes de Propagación');

    // Generar nombre de archivo con fecha
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
    const fileName = `reportes_propagacion_${timestamp}.xlsx`;

    // Descargar archivo
    XLSX.writeFile(wb, fileName);
  };

  // Funciones de color removidas - ahora usamos estilos sin colores de fondo

  const getPeakTimeClass = (peakTime) => {
    try {
      if (!peakTime || peakTime === 'N/A') return '';
      
      let hasMultipleSteps = false;
      
      // Verificar si tiene múltiples pasos (t0, t1, t2, etc.)
      if (typeof peakTime === 'object' && peakTime !== null) {
        const timeKeys = Object.keys(peakTime).filter(key => 
          /^t\d+$/.test(key) || /^step\d+$/.test(key) || /^time\d+$/.test(key)
        );
        
        hasMultipleSteps = timeKeys.length > 1;
      }
      
      // Solo añadir clase para múltiples pasos
      return hasMultipleSteps ? 'multiple-steps' : '';
    } catch (error) {
      return '';
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      
      // Si es un objeto, intentar extraer la fecha
      if (typeof dateString === 'object') {
        if (dateString.$date) {
          dateString = dateString.$date;
        } else if (dateString.timestamp) {
          dateString = dateString.timestamp;
        } else {
          return 'Fecha inválida';
        }
      }
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Fecha inválida';
    }
  };

  const formatPeakTime = (peakTime) => {
    try {
      if (!peakTime || peakTime === 'N/A') return 'N/A';
      
      console.log('T_pico recibido:', peakTime, 'Tipo:', typeof peakTime);
      
      // Si es un objeto/diccionario, mostrar todos los pasos
      if (typeof peakTime === 'object' && peakTime !== null) {
        const steps = [];
        
        // Buscar claves que empiecen con 't' seguido de números
        const timeKeys = Object.keys(peakTime).filter(key => 
          /^t\d+$/.test(key) || /^step\d+$/.test(key) || /^time\d+$/.test(key)
        ).sort((a, b) => {
          // Ordenar por número: t0, t1, t2, etc.
          const numA = parseInt(a.replace(/\D/g, ''));
          const numB = parseInt(b.replace(/\D/g, ''));
          return numA - numB;
        });
        
        if (timeKeys.length > 0) {
          // Mostrar todos los pasos encontrados
          timeKeys.forEach(key => {
            const value = peakTime[key];
            if (value !== null && value !== undefined) {
              const numValue = parseFloat(value);
              if (!isNaN(numValue)) {
                steps.push(`${key}=${numValue.toFixed(2)}`);
              }
            }
          });
          
          if (steps.length > 0) {
            return steps.join(', ');
          }
        }
        
        // Si no hay claves de tiempo, mostrar todas las propiedades numéricas
        const numericProps = Object.entries(peakTime)
          .filter(([key, value]) => {
            const numValue = parseFloat(value);
            return !isNaN(numValue) && isFinite(numValue);
          })
          .map(([key, value]) => `${key}=${parseFloat(value).toFixed(2)}`)
          .join(', ');
        
        if (numericProps) {
          return numericProps;
        }
        
        // Si no hay propiedades numéricas, mostrar el objeto como JSON
        return JSON.stringify(peakTime);
      }
      
      // Si es un valor simple, formatearlo
      const numValue = parseFloat(peakTime);
      if (isNaN(numValue) || !isFinite(numValue)) {
        return String(peakTime);
      }
      
      return numValue.toFixed(2);
    } catch (error) {
      console.error('Error formatting peak time:', error, peakTime);
      return 'N/A';
    }
  };

  const formatPeakTimeDetailed = (peakTime) => {
    try {
      if (!peakTime || peakTime === 'N/A') return 'N/A';
      
      // Si es un objeto/diccionario, mostrar todos los pasos de manera organizada
      if (typeof peakTime === 'object' && peakTime !== null) {
        const steps = [];
        
        // Buscar claves que empiecen con 't' seguido de números
        const timeKeys = Object.keys(peakTime).filter(key => 
          /^t\d+$/.test(key) || /^step\d+$/.test(key) || /^time\d+$/.test(key)
        ).sort((a, b) => {
          // Ordenar por número: t0, t1, t2, etc.
          const numA = parseInt(a.replace(/\D/g, ''));
          const numB = parseInt(b.replace(/\D/g, ''));
          return numA - numB;
        });
        
        if (timeKeys.length > 0) {
          // Mostrar todos los pasos encontrados, cada uno en su propia línea
          timeKeys.forEach(key => {
            const value = peakTime[key];
            if (value !== null && value !== undefined) {
              const numValue = parseFloat(value);
              if (!isNaN(numValue)) {
                steps.push(
                  <div key={key} style={{ marginBottom: '2px' }}>
                    {key} = {Math.round(numValue)}
                  </div>
                );
              }
            }
          });
          
          if (steps.length > 0) {
            return <div>{steps}</div>;
          }
        }
        
        // Si no hay claves de tiempo, mostrar todas las propiedades numéricas
        const numericProps = Object.entries(peakTime)
          .filter(([key, value]) => {
            const numValue = parseFloat(value);
            return !isNaN(numValue) && isFinite(numValue);
          })
          .map(([key, value], index) => (
            <div key={index} style={{ marginBottom: '2px' }}>
              {key} = {Math.round(parseFloat(value))}
            </div>
          ));
        
        if (numericProps.length > 0) {
          return <div>{numericProps}</div>;
        }
        
        // Si no hay propiedades numéricas, mostrar el objeto como JSON
        return <div style={{ fontSize: '0.7rem' }}>{JSON.stringify(peakTime)}</div>;
      }
      
      // Si es un valor simple, formatearlo
      const numValue = parseFloat(peakTime);
      if (isNaN(numValue) || !isFinite(numValue)) {
        return String(peakTime);
      }
      
      return <div>Valor = {Math.round(numValue)}</div>;
    } catch (error) {
      console.error('Error formatting peak time detailed:', error, peakTime);
      return 'N/A';
    }
  };

  const formatFinalReach = (finalReach) => {
    try {
      if (!finalReach || finalReach === 'N/A') return 'N/A';
      
      console.log('Alcance final recibido:', finalReach, 'Tipo:', typeof finalReach);
      
      // Si es un objeto/diccionario, intentar extraer el valor
      if (typeof finalReach === 'object' && finalReach !== null) {
        // Buscar en diferentes propiedades posibles
        const possibleKeys = ['value', 'alcance', 'alcance_final', 'reach', 'final_reach', 'total', 'count'];
        
        for (const key of possibleKeys) {
          if (finalReach[key] !== undefined && finalReach[key] !== null) {
            finalReach = finalReach[key];
            console.log(`Valor encontrado en ${key}:`, finalReach);
            break;
          }
        }
        
        // Si aún es un objeto, intentar el primer valor numérico
        if (typeof finalReach === 'object' && finalReach !== null) {
          const values = Object.values(finalReach);
          const numericValue = values.find(val => !isNaN(parseFloat(val)) && isFinite(val));
          if (numericValue !== undefined) {
            finalReach = numericValue;
            console.log('Valor numérico encontrado:', finalReach);
          } else {
            console.log('No se encontró valor numérico en el objeto:', finalReach);
            return 'N/A';
          }
        }
      }
      
      // Convertir a número
      const numValue = parseFloat(finalReach);
      if (isNaN(numValue) || !isFinite(numValue)) {
        console.log('Valor no es un número válido:', finalReach);
        return 'N/A';
      }
      
      console.log('Valor numérico final:', numValue);
      
      // Formatear según el valor con mejor presentación visual
      if (numValue < 0.01) {
        return `${(numValue * 100).toFixed(2)}%`;
      } else if (numValue < 0.1) {
        return `${(numValue * 100).toFixed(1)}%`;
      } else if (numValue < 1) {
        return `${(numValue * 100).toFixed(0)}%`;
      } else if (numValue < 100) {
        return `${numValue.toFixed(1)}`;
      } else {
        return `${Math.round(numValue)}`;
      }
    } catch (error) {
      console.error('Error formatting final reach:', error, finalReach);
      return 'N/A';
    }
  };

  const formatNewT = (newT) => {
    try {
      if (!newT || newT === 'N/A') return 'N/A';
      
      console.log('New T recibido:', newT, 'Tipo:', typeof newT);
      
      // Si es un objeto/diccionario, mostrar todos los pasos como t_pico
      if (typeof newT === 'object' && newT !== null) {
        const steps = [];
        
        // Buscar claves que empiecen con 't' seguido de números
        const timeKeys = Object.keys(newT).filter(key => 
          /^t\d+$/.test(key) || /^step\d+$/.test(key) || /^time\d+$/.test(key)
        ).sort((a, b) => {
          // Ordenar por número: t0, t1, t2, etc.
          const numA = parseInt(a.replace(/\D/g, ''));
          const numB = parseInt(b.replace(/\D/g, ''));
          return numA - numB;
        });
        
        if (timeKeys.length > 0) {
          // Mostrar todos los pasos encontrados, cada uno en su propia línea
          timeKeys.forEach(key => {
            const value = newT[key];
            if (value !== null && value !== undefined) {
              const numValue = parseFloat(value);
              if (!isNaN(numValue)) {
                steps.push(
                  <div key={key} style={{ marginBottom: '2px' }}>
                    {key} = {Math.round(numValue)}
                  </div>
                );
              }
            }
          });
          
          if (steps.length > 0) {
            return <div>{steps}</div>;
          }
        }
        
        // Si no hay claves de tiempo, mostrar todas las propiedades numéricas
        const numericProps = Object.entries(newT)
          .filter(([key, value]) => {
            const numValue = parseFloat(value);
            return !isNaN(numValue) && isFinite(numValue);
          })
          .map(([key, value], index) => (
            <div key={index} style={{ marginBottom: '2px' }}>
              {key} = {Math.round(parseFloat(value))}
            </div>
          ));
        
        if (numericProps.length > 0) {
          return <div>{numericProps}</div>;
        }
        
        // Si no hay propiedades numéricas, mostrar el objeto como JSON
        return <div style={{ fontSize: '0.7rem' }}>{JSON.stringify(newT)}</div>;
      }
      
      // Si es un valor simple, formatearlo
      const numValue = parseFloat(newT);
      if (isNaN(numValue) || !isFinite(numValue)) {
        return String(newT);
      }
      
      return <div>Valor = {Math.round(numValue)}</div>;
    } catch (error) {
      console.error('Error formatting new T:', error, newT);
      return 'N/A';
    }
  };

  const formatMaxPeakTime = (maxPeakTime) => {
    try {
      if (!maxPeakTime || maxPeakTime === 'N/A') return 'N/A';
      
      console.log('T_max recibido:', maxPeakTime, 'Tipo:', typeof maxPeakTime);
      
      // Si es un objeto/diccionario, intentar extraer el valor
      if (typeof maxPeakTime === 'object' && maxPeakTime !== null) {
        // Buscar en diferentes propiedades posibles
        const possibleKeys = ['value', 'max', 't_max', 'maxPeakTime', 'peak_max'];
        
        for (const key of possibleKeys) {
          if (maxPeakTime[key] !== undefined && maxPeakTime[key] !== null) {
            maxPeakTime = maxPeakTime[key];
            console.log(`Valor encontrado en ${key}:`, maxPeakTime);
            break;
          }
        }
        
        // Si aún es un objeto, intentar el primer valor numérico
        if (typeof maxPeakTime === 'object' && maxPeakTime !== null) {
          const values = Object.values(maxPeakTime);
          const numericValue = values.find(val => !isNaN(parseFloat(val)) && isFinite(val));
          if (numericValue !== undefined) {
            maxPeakTime = numericValue;
            console.log('Valor numérico encontrado:', maxPeakTime);
          } else {
            console.log('No se encontró valor numérico en el objeto:', maxPeakTime);
            return 'N/A';
          }
        }
      }
      
      // Convertir a número
      const numValue = parseFloat(maxPeakTime);
      if (isNaN(numValue) || !isFinite(numValue)) {
        console.log('Valor no es un número válido:', maxPeakTime);
        return 'N/A';
      }
      
      console.log('Valor numérico final t_max:', numValue);
      
      // Formatear como número entero
      return Math.round(numValue).toString();
    } catch (error) {
      console.error('Error formatting max peak time:', error, maxPeakTime);
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="reports-dashboard">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-dashboard">
          <div className="error-message">
            <p>Error al cargar los reportes: {error}</p>
            <button onClick={() => window.location.reload()} className="retry-button">
              Reintentar
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-dashboard">
      {/* Filtros */}
      <div className="reports-filters">
        <h3>Filtros</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Tipo de Red:</label>
            <select
              value={filters.networkType}
              onChange={(e) => handleFilterChange('networkType', e.target.value)}
            >
              <option value="">Todos</option>
              <option value="barabasi-albert">BA</option>
              <option value="holme-kim">HK</option>
              <option value="real-world">HR</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Método de Propagación:</label>
            <select
              value={filters.propagationMethod}
              onChange={(e) => handleFilterChange('propagationMethod', e.target.value)}
            >
              <option value="">Todos</option>
              <option value="sir">SIR</option>
              <option value="sis">SIS</option>
              <option value="rip-dsn">PRISUM-Model</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Cluster:</label>
            <select
              value={filters.cluster}
              onChange={(e) => handleFilterChange('cluster', e.target.value)}
            >
              <option value="">Todos</option>
              <option value="todos">Todos los Clusters</option>
              <option value="0">Cluster 0</option>
              <option value="1">Cluster 1</option>
              <option value="2">Cluster 2</option>
              <option value="3">Cluster 3</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Política:</label>
            <select
              value={filters.policy}
              onChange={(e) => handleFilterChange('policy', e.target.value)}
            >
              <option value="">Todas</option>
              <option value="P0_aleatorio">P0 - Aleatorio</option>
              <option value="P1_nodos_centrales">P1 - Nodos Centrales</option>
              <option value="P2_influencia">P2 - Influencia</option>
              <option value="P3_puentes">P3 - Puentes</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Fecha Desde:</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Fecha Hasta:</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <button onClick={clearFilters} className="clear-filters-button">
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas generales */}
      <div className="reports-stats">
        <div className="stat-card">
          <h3>Total de Propagaciones</h3>
          <span className="stat-number">{filteredReports.length}</span>
        </div>
        <div className="stat-card">
          <h3>Redes Albert-Barabási</h3>
          <span className="stat-number">
            {filteredReports.filter(r => r.networkType.toLowerCase().includes('barabasi')).length}
          </span>
        </div>
        <div className="stat-card">
          <h3>Redes Holme-Kim</h3>
          <span className="stat-number">
            {filteredReports.filter(r => r.networkType.toLowerCase().includes('holme')).length}
          </span>
        </div>
        <div className="stat-card">
          <h3>Redes HR</h3>
          <span className="stat-number">
            {filteredReports.filter(r => r.networkType.toLowerCase().includes('real')).length}
          </span>
        </div>
      </div>

      {/* Tabla de reportes o Informe detallado */}
      <div className={`reports-table-container ${showExportMode ? 'export-mode' : ''}`}>
        {!showDetailModal ? (
          <>
        <div className="table-header-section">
          <h3>Detalles de Propagaciones</h3>
          <div className="header-actions">
            {showExportMode && (
              <div className="export-info-inline">
                <span>
                  {selectedReportsForExport.size} de {filteredReports.length} seleccionados
                </span>
                <button 
                  className="export-xlsx-button-inline"
                  onClick={exportToExcel}
                  disabled={selectedReportsForExport.size === 0}
                >
                  Exportar a Archivo xlsx
                </button>
              </div>
            )}
            <button 
              className={`export-button ${showExportMode ? 'active' : ''}`}
              onClick={handleExportModeToggle}
            >
              {showExportMode ? 'Cancelar Exportación' : 'Exportar'}
            </button>
          </div>
        </div>
        {filteredReports.length === 0 ? (
          <div className="no-reports">
            <p>No se encontraron reportes con los filtros aplicados.</p>
          </div>
        ) : (
          <div className={`reports-table ${showExportMode ? 'export-mode' : ''}`}>
            <div className="table-header">
              {showExportMode && (
                <div className="table-cell checkbox-header">
                  <input
                    type="checkbox"
                    checked={selectedReportsForExport.size === filteredReports.length && filteredReports.length > 0}
                    onChange={handleSelectAll}
                    className="select-all-checkbox"
                  />
                  <span>Seleccionar Todo</span>
                </div>
              )}
              <div className="table-cell">Nombre</div>
              <div className="table-cell">Tipo de Red</div>
              <div className="table-cell">Método</div>
              <div className="table-cell">Num. Nodos</div>
              <div className="table-cell">Cluster</div>
              <div className="table-cell">Política</div>
              <div className="table-cell">Alcance Final</div>
              <div className="table-cell">T Pico</div>
              <div className="table-cell">New T</div>
              <div className="table-cell">T Máximo</div>
              <div className="table-cell">Fecha</div>
              {!showExportMode && <div className="table-cell">Ver Informe</div>}
            </div>
            {filteredReports.map((report, index) => (
              <div key={report._id || index} className="table-row">
                {showExportMode && (
                  <div className="table-cell checkbox-cell">
                    <input
                      type="checkbox"
                      checked={selectedReportsForExport.has(report._id || report.id)}
                      onChange={() => handleReportSelection(report._id || report.id)}
                      className="report-checkbox"
                    />
                  </div>
                )}
                <div className="table-cell" data-label="Nombre">
                  <div className="report-name">{report.propagationName || 'Sin nombre'}</div>
                </div>
                <div className="table-cell" data-label="Tipo de Red">
                      <span className="network-type-badge">
                    {report.networkType}
                  </span>
                </div>
                <div className="table-cell" data-label="Método">
                      <span className="propagation-method-badge">
                    {report.propagationMethod}
                  </span>
                </div>
                <div className="table-cell" data-label="Num. Nodos">
                  <span className="metric-value">
                    {report.totalNodes || report.total_nodes || 'N/A'}
                  </span>
                </div>
                <div className="table-cell" data-label="Cluster">
                  <span className="cluster-badge">
                    {report.cluster_filtering || report.clusterFiltering || 'N/A'}
                  </span>
                </div>
                <div className="table-cell" data-label="Política">
                  {typeof report.policy === 'object' ? JSON.stringify(report.policy) : (report.policy || 'N/A')}
                </div>
                <div className="table-cell" data-label="Alcance Final">
                  <span className="metric-value">
                    {formatFinalReach(report.finalReach)}
                  </span>
                </div>
                <div className="table-cell" data-label="T Pico">
                  <div className={`metric-value peak-time-metric ${getPeakTimeClass(report.peakTime)}`}>
                    {formatPeakTimeDetailed(report.peakTime)}
                  </div>
                </div>
                <div className="table-cell" data-label="New T">
                  <div className="metric-value peak-time-metric">
                    {formatNewT(report.new_t)}
                  </div>
                </div>
                <div className="table-cell" data-label="T Máximo">
                  <span className="metric-value">
                    {formatMaxPeakTime(report.maxPeakTime || report.t_max)}
                  </span>
                </div>
                <div className="table-cell" data-label="Fecha">
                  <span className="date-value">{formatDate(report.createdAt)}</span>
                </div>
                {!showExportMode && (
                  <div className="table-cell" data-label="Ver Informe">
                    <button 
                      className="view-detail-button"
                      onClick={() => handleViewDetail(report)}
                    >
                      Ver Informe Detallado
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
            )}
          </>
        ) : (
          <ReportDetailModal 
            report={selectedReport} 
            onClose={handleCloseDetail} 
          />
        )}
      </div>
    </div>
  );
}

ReportsDashboard.propTypes = {
  // No props needed for this component
};
