import React, { useState } from 'react';
import './DiagramEditor.css';

export default function DiagramEditor() {
  const [type, setType]           = useState('aws');
  const [code, setCode]           = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);

  const diagramTypes = [
    { value: 'aws',  label: 'Arquitectura AWS' },
    { value: 'er',   label: 'Diagrama E-R'     },
    { value: 'json', label: 'JSON → Gráfico'   },
  ];

  const handleFileUpload = e => {
    const file = e.target.files[0];
    if (!file) return;
    file.text().then(text => setCode(text));
  };

  const handleGenerate = () => {
    setPreviewVisible(true);
  };

  return (
    <div className="diagram-editor">
      {/* Título principal */}
      <div className="page-title">BATIFAMILIA</div>

      {/* Subtítulo / header */}
      <header className="editor-header">
        <h1>Editor de Diagramas</h1>
      </header>

      <div className="blocks-container">
        {/* IZQUIERDO */}
        <div className="block left-block">
          <div className="top-controls">
            <select value={type} onChange={e => setType(e.target.value)}>
              {diagramTypes.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
            <input type="file" accept=".txt" onChange={handleFileUpload} />
          </div>

          <div className="block-content">
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Escribe tu definición de diagrama…"
            />
          </div>

          <div className="buttons-container">
            <button className="button" onClick={handleGenerate}>
              Generar diagrama
            </button>
          </div>
        </div>

        {/* DERECHO */}
        <div className="block right-block">
          <div className="block-content">
            {previewVisible
              ? <div className="preview-box">AQUÍ IRÁ EL DIAGRAMA</div>
              : <div className="placeholder">Aquí aparecerá el diagrama</div>
            }
          </div>
          <div className="buttons-container">
            <button disabled>Descargar PNG</button>
            <button disabled>Descargar SVG</button>
            <button disabled>Descargar PDF</button>
          </div>
        </div>
      </div>
    </div>
  );
}
