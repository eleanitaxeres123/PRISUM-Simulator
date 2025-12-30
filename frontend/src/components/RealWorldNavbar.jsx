// src/components/RealWorldNavbar.jsx
import PropTypes from 'prop-types';
import './Navbar.css';

export default function RealWorldNavbar({ nodesCsvFile, setNodesCsvFile, linksCsvFile, setLinksCsvFile, networkList, selectedNet, setSelectedNet, viewMode, setCsvFile, xlsxFile, setXlsxFile }) {
  const getNavbarTitle = () => {
    switch (viewMode) {
      case 'real-world':
        return 'Análisis de Redes HR';
      case 'real-world-sir':
        return 'Modelo SIR en Redes HR';
      case 'real-world-sis':
        return 'Modelo SIS en Redes HR';
      case 'simulation':
        return 'Simulación de Redes';
      default:
        return 'Análisis de Redes';
    }
  };

  // Handle file changes and synchronize with csvFile
  const handleLinksCsvChange = (e) => {
    const file = e.target.files?.[0];
    setLinksCsvFile(file);
    setCsvFile(file); // Update csvFile in App.jsx
  };

  return (
    <div className="navbar">
      <div className="navbar-controls">
        {viewMode !== 'real-world-sir' && viewMode !== 'real-world-sis' && viewMode !== 'simulation' && (
          <>
            <div className="navbar-input-container">
              <label htmlFor="nodes-file" className="navbar-label">Suba el archivo de nodos</label>
              <input
                id="nodes-file"
                type="file"
                accept=".csv"
                onChange={e => setNodesCsvFile(e.target.files?.[0])}
                className="navbar-input"
              />
            </div>
            <div className="navbar-input-container">
              <label htmlFor="links-file" className="navbar-label">Suba el archivo de aristas</label>
              <input
                id="links-file"
                type="file"
                accept=".csv"
                onChange={handleLinksCsvChange}
                className="navbar-input"
              />
            </div>
          </>
        )}
        {viewMode === 'simulation' && selectedNet && (
          <div className="navbar-selected-network">
            <strong>Red Seleccionada: {selectedNet}</strong>
          </div>
        )}
        {viewMode === 'simulation' && xlsxFile !== undefined && setXlsxFile !== undefined && (
          <div className="navbar-input-container">
            <label htmlFor="xlsx-file" className="navbar-label">
              Suba el dataset de vectores {xlsxFile ? `(${xlsxFile.name})` : ''}
            </label>
            <input
              id="xlsx-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={e => setXlsxFile(e.target.files?.[0])}
              className="navbar-input"
            />
          </div>
        )}
        {viewMode !== 'real-world-sir' && viewMode !== 'real-world-sis' && viewMode !== 'simulation' && networkList.length > 0 && (
          <div className="navbar-select-container">
            <select
              value={selectedNet}
              onChange={e => setSelectedNet(e.target.value)}
              className="navbar-select"
            >
              <option value="">Selecciona red</option>
              {networkList.map(id => (
                <option key={id} value={id}>
                  Red: {id}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

RealWorldNavbar.propTypes = {
  nodesCsvFile: PropTypes.object,
  setNodesCsvFile: PropTypes.func.isRequired,
  linksCsvFile: PropTypes.object,
  setLinksCsvFile: PropTypes.func.isRequired,
  networkList: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedNet: PropTypes.string.isRequired,
  setSelectedNet: PropTypes.func.isRequired,
  viewMode: PropTypes.string.isRequired,
  setCsvFile: PropTypes.func.isRequired,
  xlsxFile: PropTypes.object,
  setXlsxFile: PropTypes.func,
};