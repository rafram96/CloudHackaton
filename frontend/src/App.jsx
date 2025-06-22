import React, { useState, useEffect, useRef, useMemo } from 'react';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import WelcomePanel from './components/WelcomePanel';
import './index.css';
import './main.css';
import mermaid from 'mermaid';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// URLs de Auth y Generate definidas en .env
const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'https://<tu-auth-endpoint>.amazonaws.com/dev';
const GENERATE_URL = import.meta.env.VITE_GENERATE_URL || 'https://<tu-generate-endpoint>.amazonaws.com/dev';

export default function App() {
  // Estado de autenticación
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerMessage, setRegisterMessage] = useState('');
  const [authError, setAuthError] = useState('');

  // Editor y preview
  const [code, setCode] = useState('{}');
  const [inputType, setInputType] = useState('json'); // Tipo de entrada: json, aws, er
  const [diagram, setDiagram] = useState('');
  const [diagramUrl, setDiagramUrl] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState('');
  const [graphType, setGraphType] = useState('flowchart'); // Tipo de gráfico por defecto
  const [saveFormat, setSaveFormat] = useState('svg'); // Formato de guardado por defecto
  const [isDragOver, setIsDragOver] = useState(false);
  const [showDropModal, setShowDropModal] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Cargar preferencia guardada o usar preferencia del sistema
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return JSON.parse(saved);
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Ejemplos predefinidos por tipo de entrada
  const examples = {
    json: {
      flowchart: {
        "nodes": [
          {"id": "A", "label": "Inicio"},
          {"id": "B", "label": "Proceso"},
          {"id": "C", "label": "Decisión"},
          {"id": "D", "label": "Fin"}
        ],
        "edges": [
          {"from": "A", "to": "B"},
          {"from": "B", "to": "C", "label": "evaluar"},
          {"from": "C", "to": "D", "label": "sí"}
        ]
      },
      sequenceDiagram: {
        "participants": ["Usuario", "Frontend", "Backend", "DB"],
        "messages": [
          {"from": "Usuario", "to": "Frontend", "text": "login"},
          {"from": "Frontend", "to": "Backend", "text": "authenticate"},
          {"from": "Backend", "to": "DB", "text": "verify user"},
          {"from": "DB", "to": "Backend", "text": "user data"},
          {"from": "Backend", "to": "Frontend", "text": "token"}
        ]
      },
      classDiagram: {
        "classes": [
          {
            "name": "User",
            "attributes": ["id: string", "name: string", "email: string"],
            "methods": ["login()", "logout()", "updateProfile()"]
          },
          {
            "name": "Admin",
            "attributes": ["permissions: array"],
            "methods": ["manageUsers()", "viewLogs()"],
            "extends": "User"
          }
        ]
      },
      stateDiagram: {
        "states": ["Idle", "Loading", "Success", "Error"],
        "transitions": [
          {"from": "Idle", "to": "Loading", "text": "start"},
          {"from": "Loading", "to": "Success", "text": "complete"},
          {"from": "Loading", "to": "Error", "text": "fail"},
          {"from": "Success", "to": "Idle", "text": "reset"},
          {"from": "Error", "to": "Idle", "text": "retry"}
        ]
      }
    },
    aws: {
      flowchart: {
        "components": [
          {"id": "user", "type": "user", "label": "Cliente"},
          {"id": "cloudfront", "type": "cloudfront", "label": "CloudFront"},
          {"id": "s3", "type": "s3", "label": "S3 Bucket"},
          {"id": "lambda", "type": "lambda", "label": "Lambda Function"},
          {"id": "dynamodb", "type": "dynamodb", "label": "DynamoDB"}
        ],
        "connections": [
          {"from": "user", "to": "cloudfront", "label": "HTTPS"},
          {"from": "cloudfront", "to": "s3", "label": "static files"},
          {"from": "cloudfront", "to": "lambda", "label": "API calls"},
          {"from": "lambda", "to": "dynamodb", "label": "queries"}
        ]
      }
    },
    er: {
      flowchart: {
        "entities": [
          {
            "name": "Usuario",
            "attributes": ["id (PK)", "nombre", "email", "fecha_registro"],
            "type": "entity"
          },
          {
            "name": "Pedido",
            "attributes": ["id (PK)", "fecha", "total", "usuario_id (FK)"],
            "type": "entity"
          },
          {
            "name": "Producto",
            "attributes": ["id (PK)", "nombre", "precio", "stock"],
            "type": "entity"
          },
          {
            "name": "DetallePedido",
            "attributes": ["pedido_id (FK)", "producto_id (FK)", "cantidad", "precio_unitario"],
            "type": "relationship"
          }
        ],
        "relationships": [
          {"from": "Usuario", "to": "Pedido", "type": "1:N", "label": "realiza"},
          {"from": "Pedido", "to": "DetallePedido", "type": "1:N", "label": "contiene"},
          {"from": "Producto", "to": "DetallePedido", "type": "1:N", "label": "incluido_en"}
        ]
      }
    }
  };

  // Referencia y ID único para render Mermaid
  const svgRef = useRef(null);
  const mermaidId = useMemo(() => `mmd-${Math.random().toString(36).substr(2,9)}`, []);
  // Funciones de autenticación
  async function handleLogin(e) {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch(`${AUTH_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      setToken(data.token);
    } catch (err) {
      setAuthError(err.message);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setAuthError('');
    setRegisterMessage('');
    try {
      const res = await fetch(`${AUTH_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Register failed');
      setRegisterMessage(data.message || 'Usuario registrado');
      setIsRegistering(false);
    } catch (err) {
      setAuthError(err.message);
    }
  }
  // Funciones de diagrama
  async function handlePreview() {
    setError('');
    setDiagram('');
    setIsLoading(true);
    
    try {
      // Validar JSON antes de enviar (solo para tipo JSON)
      if (inputType === 'json') {
        try {
          JSON.parse(code);
        } catch (parseError) {
          throw new Error('El código no es un JSON válido. Verifica la sintaxis.');
        }
      }

      const res = await fetch(`${GENERATE_URL}/generate/preview`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code, type: inputType, format: 'svg', diagram: graphType })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDiagram(data.diagram);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }
  async function handleSaveFromPreview() {
    if (!svgRef.current || !diagram) {
      setError('No hay preview para guardar');
      return;
    }

    setIsLoading(true);
    try {
      // Capturar imagen desde el SVG renderizado
      const svgElement = svgRef.current.querySelector('svg');
      if (!svgElement) {
        setError('No se encontró elemento SVG');
        setIsLoading(false);
        return;
      }

      let imageBase64;
      let format = saveFormat;

      if (format === 'svg') {
        // Para SVG, obtener el código directo
        const svgData = new XMLSerializer().serializeToString(svgElement);
        imageBase64 = btoa(unescape(encodeURIComponent(svgData)));
      } else {
        // Para PNG, usar html2canvas
        const canvas = await html2canvas(svgElement, {
          backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
          scale: 2
        });
        const dataURL = canvas.toDataURL('image/png');
        imageBase64 = dataURL.split(',')[1]; // Remover el prefijo data:image/png;base64,
        format = 'png';
      }

      // Enviar al backend
      const res = await fetch(`${GENERATE_URL}/generate/save-frontend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          image_base64: imageBase64,
          type: inputType,
          format: format,
          diagram: graphType,
          code: code
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setDiagramUrl(data.url);
      alert(`Diagrama guardado desde preview. URL: ${data.url}`);
    } catch (err) {
      setError(`Error guardando desde preview: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }
  function handleLogout() {
    setToken('');
    setUserId('');
    setPassword('');
    setDiagram('');
    setDiagramUrl('');
    setError('');
    setRegisterMessage('');
    setAuthError('');
    setCode('{}');
    setInputType('json');
    setGraphType('flowchart');
    setSaveFormat('svg');
    setShowCode(false);
    setIsLoading(false);
  }

  function loadExample() {
    const example = examples[inputType]?.[graphType];
    if (example) {
      setCode(JSON.stringify(example, null, 2));
    }
  }

  async function handlePasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        setCode(text);
        setError('');
      } else {
        setError('El portapapeles está vacío');
      }
    } catch (err) {
      setError('No se pudo acceder al portapapeles. Asegúrate de dar permisos al navegador.');
    }
  }

  function openFileUploadModal() {
    setShowDropModal(true);
  }

  function closeFileUploadModal() {
    setShowDropModal(false);
    setIsDragOver(false);
  }
  async function handleFileUpload(files) {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.name.match(/\.(txt|json)$/i)) {
      setError('Solo se permiten archivos .txt o .json');
      return;
    }

    setIsLoadingFile(true);
    setError('');
    
    try {
      const text = await file.text();
      
      // Validar que el contenido sea JSON válido si es tipo JSON
      if (inputType === 'json') {
        try {
          JSON.parse(text);
        } catch (parseError) {
          throw new Error('El archivo no contiene JSON válido. Verifica la sintaxis.');
        }
      }
      
      setCode(text);
      closeFileUploadModal();
    } catch (err) {
      setError(`Error procesando el archivo: ${err.message}`);
    } finally {
      setIsLoadingFile(false);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragOver(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  }

  function getPlaceholder() {
    if (inputType === 'json') {
      return `Ingresa tu código JSON aquí...
Ejemplo:
{
  "nodes": [
    {"id": "A", "label": "Inicio"},
    {"id": "B", "label": "Proceso"}
  ],
  "edges": [
    {"from": "A", "to": "B"}
  ]
}`;
    } else if (inputType === 'aws') {
      return `Ingresa tu definición AWS aquí...
Ejemplo:
{
  "components": [
    {"id": "user", "type": "user", "label": "Cliente"},
    {"id": "lambda", "type": "lambda", "label": "Function"}
  ],
  "connections": [
    {"from": "user", "to": "lambda", "label": "request"}
  ]
}`;
    } else {
      return `Ingresa tu esquema ER aquí...
Ejemplo:
{
  "entities": [
    {"name": "User", "attributes": ["id", "name"], "type": "entity"}
  ],
  "relationships": [
    {"from": "User", "to": "Order", "type": "1:N"}
  ]
}`;
    }
  }
  // Función para exportar SVG a PDF
  async function exportSvgToPDF() {
    if (!svgRef.current) {
      setError('No hay diagrama para exportar');
      return;
    }

    setIsLoading(true);
    try {
      const svgElement = svgRef.current.querySelector('svg');
      if (!svgElement) {
        setError('No se encontró elemento SVG');
        setIsLoading(false);
        return;
      }

      // Crear canvas desde SVG
      const canvas = await html2canvas(svgElement, {
        backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
        scale: 2
      });

      // Crear PDF
      const pdf = new jsPDF();
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, imgWidth, imgHeight);
      
      const fileName = `diagrama_${graphType}_${Date.now()}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      setError(`Error exportando PDF: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  // Función para toggle del modo oscuro
  function toggleDarkMode() {
    setIsDarkMode(!isDarkMode);
  }

  // Integrar mermaid
  useEffect(() => {
    if (diagram && svgRef.current) {
      mermaid.initialize({ 
        startOnLoad: false,
        theme: isDarkMode ? 'dark' : 'default'
      });
      mermaid.render(mermaidId, diagram)
        .then(({ svg }) => { 
          svgRef.current.innerHTML = svg; 
        })
        .catch(err => {
          console.error('Mermaid render error:', err);
          setError('Error renderizando diagrama');
        });
    }
  }, [diagram, mermaidId, isDarkMode]);

  // Cerrar modal con tecla Escape
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && showDropModal) {
        closeFileUploadModal();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showDropModal]);  // Efecto para aplicar modo oscuro y clase de app
  useEffect(() => {
    if (token) {
      document.body.classList.add('app-mode');
      document.body.classList.toggle('dark-mode', isDarkMode);
    } else {
      document.body.classList.remove('app-mode');
      // Solo remover dark-mode si no está en app-mode para mantener preferencia en auth
      if (isDarkMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode, token]);
  // Efecto para reinicializar cuando cambie el tipo de entrada
  useEffect(() => {
    // Resetear el tipo de diagrama para JSON
    if (inputType === 'json') {
      setGraphType('flowchart');
    } else {
      setGraphType('flowchart'); // AWS y ER siempre usan flowchart
    }
    
    // Cargar ejemplo del nuevo tipo automáticamente
    const example = examples[inputType]?.[inputType === 'json' ? 'flowchart' : 'flowchart'];
    if (example) {
      setCode(JSON.stringify(example, null, 2));
    } else {
      setCode('{}');
    }
    
    setDiagram('');
    setError('');
  }, [inputType]);

  if (!token) {
    return (
      <div className="container">
        {isRegistering ? (
          <SignUp 
            onSubmit={handleRegister} 
            onSwitch={() => setIsRegistering(false)} 
            error={authError}
            userId={userId}
            setUserId={setUserId}
            password={password}
            setPassword={setPassword}
          />
        ) : (
          <SignIn 
            onSubmit={handleLogin} 
            onSwitch={() => setIsRegistering(true)} 
            error={authError}
            userId={userId}
            setUserId={setUserId}
            password={password}
            setPassword={setPassword}
          />
        )}
        <WelcomePanel
          toggled={isRegistering}
          onSignIn={() => setIsRegistering(false)}
          onSignUp={() => setIsRegistering(true)}
        />
        {registerMessage && (
          <div className="register-success">{registerMessage}</div>
        )}
      </div>
    );
  }

  return (
    <div className={`app-container ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* Header con logout y modo oscuro */}
      <header className="main-header">
        <h1 className="main-title">🎨 Editor de Diagramas</h1>
        <div className="header-controls">
          <button className="btn-dark-mode" onClick={toggleDarkMode}>
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <button className="btn-logout" onClick={handleLogout}>🚪 Cerrar Sesión</button>
        </div>
      </header>

      <div className="main-content">
        {/* Panel de configuración */}
        <div className="config-panel">
          <div className="config-section">
            <label>Tipo de entrada:</label>
            <select 
              value={inputType} 
              onChange={e => setInputType(e.target.value)}
              className="select-input"
            >
              <option value="json">JSON</option>
              <option value="aws">AWS Architecture</option>
              <option value="er">Entity Relationship</option>
            </select>
          </div>

          {/* Solo mostrar selector de diagrama para JSON */}
          {inputType === 'json' && (
            <div className="config-section">
              <label>Tipo de diagrama:</label>
              <select 
                value={graphType} 
                onChange={e => setGraphType(e.target.value)}
                className="select-input"
              >
                <option value="flowchart">Flowchart</option>
                <option value="sequenceDiagram">Sequence</option>
                <option value="classDiagram">Class</option>
                <option value="stateDiagram">State</option>
              </select>
            </div>
          )}

          <div className="config-section">
            <label>Formato de guardado:</label>
            <select 
              value={saveFormat} 
              onChange={e => setSaveFormat(e.target.value)}
              className="select-input"
            >
              <option value="svg">SVG</option>
              <option value="png">PNG</option>
            </select>
          </div>
        </div>

        {/* Editor de código */}
        <div className="editor-panel">
          <div className="editor-header">
            <h3>📝 Editor de Código</h3>
            <div className="editor-actions">
              <button onClick={loadExample} className="btn-secondary">
                💡 Ejemplo
              </button>
              <button onClick={handlePasteFromClipboard} className="btn-secondary">
                📋 Pegar
              </button>
              <button onClick={openFileUploadModal} className="btn-secondary">
                📁 Cargar archivo
              </button>
            </div>
          </div>
          
          <div 
            className={`textarea-container ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <textarea
              className="code-input"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder={getPlaceholder()}
              disabled={isLoading}
            />
            {isDragOver && (
              <div className="drag-overlay">
                <div className="drag-message">
                  📂 Suelta tu archivo aquí
                </div>
              </div>
            )}
          </div>

          <div className="editor-footer">
            <button 
              onClick={handlePreview} 
              className="btn-primary"
              disabled={isLoading || !code.trim()}
            >
              {isLoading ? '⏳ Generando...' : '👀 Vista Previa'}
            </button>
            {error && <div className="error-message">❌ {error}</div>}
          </div>
        </div>

        {/* Panel de preview */}
        {diagram && (
          <div className="preview-panel">
            <div className="preview-header">
              <h3>🎯 Vista Previa</h3>
              <div className="preview-actions">
                <button 
                  onClick={exportSvgToPDF} 
                  className="btn-secondary"
                  disabled={isLoading}
                >
                  📄 Exportar PDF
                </button>
                <button 
                  onClick={handleSaveFromPreview} 
                  className="btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? '⏳ Guardando...' : '💾 Guardar'}
                </button>
              </div>
            </div>
            
            <div className="mermaid-container">
              <div ref={svgRef} className="mermaid-diagram" />
            </div>

            {diagramUrl && (
              <div className="diagram-url">
                <strong>✅ Diagrama guardado:</strong>
                <a href={diagramUrl} target="_blank" rel="noopener noreferrer">
                  {diagramUrl}
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal para drag & drop */}
      {showDropModal && (
        <div className="modal-overlay" onClick={closeFileUploadModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📁 Cargar archivo</h3>
              <button className="modal-close" onClick={closeFileUploadModal}>✕</button>
            </div>
            <div className="modal-body">
              <div 
                className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="drop-message">
                  <div className="drop-icon">📂</div>
                  <p>Arrastra tu archivo aquí o</p>
                  <input
                    type="file"
                    accept=".txt,.json"
                    onChange={e => handleFileUpload(e.target.files)}
                    style={{ display: 'none' }}
                    id="file-input"
                  />
                  <label htmlFor="file-input" className="btn-secondary">
                    Seleccionar archivo
                  </label>
                  <small>Solo archivos .txt y .json</small>
                </div>
              </div>
              {isLoadingFile && (
                <div className="loading-message">⏳ Cargando archivo...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
