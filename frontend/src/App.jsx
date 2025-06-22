import React, { useState, useEffect, useRef, useMemo } from 'react';
import './styles.css';
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
  const [inputType, setInputType] = useState('json');
  const [diagram, setDiagram] = useState('');
  const [diagramUrl, setDiagramUrl] = useState('');
  const [error, setError] = useState('');
  const [graphType, setGraphType] = useState('flowchart');
  const [saveFormat, setSaveFormat] = useState('svg');
  const [isDragOver, setIsDragOver] = useState(false);
  const [showDropModal, setShowDropModal] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Batman siempre en modo oscuro
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('selectedTheme') || 'batman';
  });

  // Ejemplos predefinidos por tipo de entrada
  const examples = {
    json: {
      flowchart: {
        "nodes": [
          {"id": "A", "label": "🦇 Vigilancia"},
          {"id": "B", "label": "🔍 Investigación"},
          {"id": "C", "label": "⚔️ Combate"},
          {"id": "D", "label": "🏆 Justicia"}
        ],
        "edges": [
          {"from": "A", "to": "B"},
          {"from": "B", "to": "C", "label": "evidencia"},
          {"from": "C", "to": "D", "label": "victoria"}
        ]
      },
      sequenceDiagram: {
        "participants": ["Batman", "Gordon", "Batcomputer", "Criminal"],
        "messages": [
          {"from": "Gordon", "to": "Batman", "text": "Signal activated"},
          {"from": "Batman", "to": "Batcomputer", "text": "Analyze threat"},
          {"from": "Batcomputer", "to": "Batman", "text": "Location found"},
          {"from": "Batman", "to": "Criminal", "text": "Justice served"}
        ]
      },
      classDiagram: {
        "classes": [
          {
            "name": "Hero",
            "attributes": ["name: string", "city: string", "suit: string"],
            "methods": ["fight()", "protect()", "investigate()"]
          },
          {
            "name": "Batman",
            "attributes": ["gadgets: array", "cave: location"],
            "methods": ["glide()", "stealth()", "analyze()"],
            "extends": "Hero"
          }
        ]
      }
    },
    aws: {
      flowchart: {
        "components": [
          {"id": "user", "type": "user", "label": "🦇 Ciudadano"},
          {"id": "cloudfront", "type": "cloudfront", "label": "Bat-Signal"},
          {"id": "lambda", "type": "lambda", "label": "Bat-Computer"},
          {"id": "dynamodb", "type": "dynamodb", "label": "Bat-Cave DB"}
        ],
        "connections": [
          {"from": "user", "to": "cloudfront", "label": "emergency"},
          {"from": "cloudfront", "to": "lambda", "label": "process"},
          {"from": "lambda", "to": "dynamodb", "label": "store"}
        ]
      }
    },
    er: {
      flowchart: {
        "entities": [
          {
            "name": "Hero",
            "attributes": ["id (PK)", "name", "city", "power_level"],
            "type": "entity"
          },
          {
            "name": "Mission",
            "attributes": ["id (PK)", "title", "danger_level", "hero_id (FK)"],
            "type": "entity"
          }
        ],
        "relationships": [
          {"from": "Hero", "to": "Mission", "type": "1:N", "label": "undertakes"}
        ]
      }
    }
  };
  // Temas disponibles
  const themes = {
    batman: {
      name: '🦇 Batman',
      title: '🦇 BAT-DIAGRAM GENERATOR',
      logoutText: '🚪 Salir de la Cueva',
      userIcon: '👤',
      colors: {
        primary: '#FFD700',
        secondary: '#2C2C2C',
        background: '#0A0A0A',
        text: '#E5E5E5'
      }
    },
    robin: {
      name: '🐦 Robin',
      title: '🐦 ROBIN-DIAGRAM ANALYZER',
      logoutText: '🏃 Volver a la Base',
      userIcon: '🦸‍♂️',
      colors: {
        primary: '#FF4500',
        secondary: '#228B22',
        background: '#0F2A0F',
        text: '#FFFFFF'
      }
    },
    joker: {
      name: '🃏 Joker',
      title: '🃏 CHAOS-DIAGRAM CREATOR',
      logoutText: '😈 Salir Riéndose',
      userIcon: '🎭',
      colors: {
        primary: '#800080',
        secondary: '#32CD32',
        background: '#1A0A1A',
        text: '#FFFFFF'
      }
    },
    catwoman: {
      name: '🐱 Catwoman',
      title: '🐱 FELINE-DIAGRAM DESIGNER',
      logoutText: '🌙 Escapar Sigilosamente',
      userIcon: '👩‍🦱',
      colors: {
        primary: '#C0C0C0',
        secondary: '#000000',
        background: '#1C1C1C',
        text: '#E0E0E0'
      }
    },
    superman: {
      name: '🦸 Superman',
      title: '🦸 SUPER-DIAGRAM FORGE',
      logoutText: '🚀 Volar a Metrópolis',
      userIcon: '🔥',
      colors: {
        primary: '#DC143C',
        secondary: '#0066CC',
        background: '#001122',
        text: '#FFFFFF'
      }
    }
  };

  const activeTheme = themes[currentTheme];

  // Referencia y ID único para render Mermaid
  const svgRef = useRef(null);
  const mermaidId = useMemo(() => `mmd-${Math.random().toString(36).substr(2,9)}`, []);

  // Función para cambiar tema
  function changeTheme(newTheme) {
    setCurrentTheme(newTheme);
    localStorage.setItem('selectedTheme', newTheme);
  }  // Funciones de autenticación
  async function handleLogin(e) {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch(`${AUTH_URL}/auth/login`, {
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
      const res = await fetch(`${AUTH_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Register failed');
      setRegisterMessage(data.message || 'Héroe registrado en la Liga');
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
      // Validar que tenemos token
      if (!token || token.trim() === '') {
        throw new Error('No hay token de autenticación. Inicia sesión nuevamente.');
      }

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
          'Authorization': `Bearer ${token.trim()}`
        },
        body: JSON.stringify({ code, type: inputType, format: 'svg', diagram: graphType })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Error ${res.status}: ${res.statusText}`);
      setDiagram(data.diagram);
    } catch (err) {
      setError(err.message);
      console.error('Preview error:', err);
    } finally {
      setIsLoading(false);
    }
  }  async function handleSaveFromPreview() {
    if (!svgRef.current || !diagram) {
      setError('No hay preview para guardar');
      return;
    }

    // Validar token antes de proceder
    if (!token || token.trim() === '') {
      setError('No hay token de autenticación. Inicia sesión nuevamente.');
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

      let imageBase64;
      let format = saveFormat;

      if (format === 'svg') {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        imageBase64 = btoa(unescape(encodeURIComponent(svgData)));
      } else {
        const canvas = await html2canvas(svgElement, {
          backgroundColor: '#0a0a0a',
          scale: 2
        });
        const dataURL = canvas.toDataURL('image/png');
        imageBase64 = dataURL.split(',')[1];
        format = 'png';
      }

      const res = await fetch(`${GENERATE_URL}/generate/save-frontend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.trim()}`
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
      if (!res.ok) throw new Error(data.error || `Error ${res.status}: ${res.statusText}`);
      
      setDiagramUrl(data.url);
      alert(`🦇 Diagrama guardado en la Bat-Cueva. URL: ${data.url}`);
    } catch (err) {
      setError(`Error guardando desde preview: ${err.message}`);
      console.error('Save error:', err);
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
  }, [inputType]);  // Componente SignIn integrado
  const SignIn = () => (
    <div className="auth-form">
      <div className="auth-header">
        <h2>{activeTheme.name} ACCESO AL SISTEMA</h2>
        <p>Identifícate para acceder</p>
      </div>
      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label>{activeTheme.userIcon} Identificación</label>
          <input
            type="text"
            placeholder={`Usuario ${activeTheme.name}`}
            value={userId}
            onChange={e => setUserId(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label>🔒 Clave de Acceso</label>
          <input
            type="password"
            placeholder="Contraseña secreta"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {authError && <div className="error-message">❌ {authError}</div>}
        <button type="submit" className="btn-primary">
          🚀 ACCEDER AL SISTEMA
        </button>
        <p className="switch-text">
          ¿No tienes acceso?{' '}
          <button type="button" className="link-btn" onClick={() => setIsRegistering(true)}>
            Solicita autorización
          </button>
        </p>
      </form>
      
      {/* Selector de tema en login */}
      <div className="theme-selector">
        <label>🎨 Elige tu tema:</label>
        <div className="theme-options">
          {Object.entries(themes).map(([key, theme]) => (
            <button
              key={key}
              type="button"
              className={`theme-btn ${currentTheme === key ? 'active' : ''}`}
              onClick={() => changeTheme(key)}
            >
              {theme.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
  // Componente SignUp integrado
  const SignUp = () => (
    <div className="auth-form">
      <div className="auth-header">
        <h2>{activeTheme.name} REGISTRO</h2>
        <p>Únete al equipo</p>
      </div>
      <form onSubmit={handleRegister}>
        <div className="input-group">
          <label>{activeTheme.userIcon} Nombre del Héroe</label>
          <input
            type="text"
            placeholder="Tu nombre de héroe"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label>🔐 Código Secreto</label>
          <input
            type="password"
            placeholder="Contraseña ultra secreta"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {authError && <div className="error-message">❌ {authError}</div>}
        <button type="submit" className="btn-primary">
          ⚡ REGISTRAR HÉROE
        </button>
        <p className="switch-text">
          ¿Ya tienes acceso?{' '}
          <button type="button" className="link-btn" onClick={() => setIsRegistering(false)}>
            Iniciar sesión
          </button>
        </p>
      </form>

      {/* Selector de tema en registro también */}
      <div className="theme-selector">
        <label>🎨 Elige tu tema:</label>
        <div className="theme-options">
          {Object.entries(themes).map(([key, theme]) => (
            <button
              key={key}
              type="button"
              className={`theme-btn ${currentTheme === key ? 'active' : ''}`}
              onClick={() => changeTheme(key)}
            >
              {theme.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
  if (!token) {
    return (
      <div className={`auth-container theme-${currentTheme}`}>
        <div className="auth-background">
          <div className="theme-symbol">{activeTheme.name.split(' ')[0]}</div>
        </div>
        <div className="auth-content">
          {isRegistering ? <SignUp /> : <SignIn />}
          {registerMessage && (
            <div className="success-message">✅ {registerMessage}</div>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className={`app-container theme-${currentTheme}`}>
      {/* Header dinámico según tema */}
      <header className="main-header">
        <h1 className="main-title">{activeTheme.title}</h1>
        <div className="header-controls">
          {/* Selector de tema en el header */}
          <div className="theme-selector-mini">
            <select 
              value={currentTheme} 
              onChange={e => changeTheme(e.target.value)}
              className="theme-select"
            >
              {Object.entries(themes).map(([key, theme]) => (
                <option key={key} value={key}>{theme.name}</option>
              ))}
            </select>
          </div>
          <span className="user-info">{activeTheme.userIcon} {userId}</span>
          <button className="btn-logout" onClick={handleLogout}>
            {activeTheme.logoutText}
          </button>
        </div>
      </header>

      <div className="main-content">
        {/* Panel de configuración con temática Batman */}
        <div className="config-panel">
          <h3>⚙️ CONFIGURACIÓN DEL SISTEMA</h3>
          
          <div className="config-section">
            <label>📊 Tipo de Análisis:</label>
            <select 
              value={inputType} 
              onChange={e => setInputType(e.target.value)}
              className="select-input"
            >
              <option value="json">🔍 Análisis JSON</option>
              <option value="aws">☁️ Arquitectura AWS</option>
              <option value="er">🗃️ Base de Datos</option>
            </select>
          </div>

          {inputType === 'json' && (
            <div className="config-section">
              <label>📋 Tipo de Diagrama:</label>
              <select 
                value={graphType} 
                onChange={e => setGraphType(e.target.value)}
                className="select-input"
              >
                <option value="flowchart">🔄 Flujo de Procesos</option>
                <option value="sequenceDiagram">📱 Secuencia</option>
                <option value="classDiagram">🏗️ Clases</option>
                <option value="stateDiagram">🔄 Estados</option>
              </select>
            </div>
          )}

          <div className="config-section">
            <label>💾 Formato de Salida:</label>
            <select 
              value={saveFormat} 
              onChange={e => setSaveFormat(e.target.value)}
              className="select-input"
            >
              <option value="svg">🎨 SVG Vector</option>
              <option value="png">🖼️ PNG Imagen</option>
            </select>
          </div>
        </div>

        {/* Editor con temática Batman */}
        <div className="editor-panel">
          <div className="editor-header">
            <h3>� BAT-EDITOR</h3>
            <div className="editor-actions">
              <button onClick={loadExample} className="btn-secondary">
                💡 Cargar Ejemplo
              </button>
              <button onClick={handlePasteFromClipboard} className="btn-secondary">
                📋 Pegar Código
              </button>
              <button onClick={openFileUploadModal} className="btn-secondary">
                📁 Cargar Archivo
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
                  🦇 Suelta el archivo aquí
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
              {isLoading ? '⏳ Analizando...' : '� ANALIZAR CÓDIGO'}
            </button>
            {error && <div className="error-message">⚠️ {error}</div>}
          </div>
        </div>

        {/* Panel de preview con temática Batman */}
        {diagram && (
          <div className="preview-panel">
            <div className="preview-header">
              <h3>👁️ VISUALIZACIÓN</h3>
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
                  {isLoading ? '⏳ Guardando...' : '💾 GUARDAR EN BAT-CUEVA'}
                </button>
              </div>
            </div>
            
            <div className="mermaid-container">
              <div ref={svgRef} className="mermaid-diagram" />
            </div>

            {diagramUrl && (
              <div className="diagram-url">
                <strong>✅ Archivo guardado en la Bat-Cueva:</strong>
                <a href={diagramUrl} target="_blank" rel="noopener noreferrer">
                  🔗 {diagramUrl}
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal con temática Batman */}
      {showDropModal && (
        <div className="modal-overlay" onClick={closeFileUploadModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📁 CARGAR ARCHIVO AL SISTEMA</h3>
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
                  <div className="drop-icon">🦇</div>
                  <p>Arrastra tu archivo aquí o</p>
                  <input
                    type="file"
                    accept=".txt,.json"
                    onChange={e => handleFileUpload(e.target.files)}
                    style={{ display: 'none' }}
                    id="file-input"
                  />
                  <label htmlFor="file-input" className="btn-secondary">
                    📂 Seleccionar Archivo
                  </label>
                  <small>Solo archivos .txt y .json</small>
                </div>
              </div>
              {isLoadingFile && (
                <div className="loading-message">⏳ Procesando archivo...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
