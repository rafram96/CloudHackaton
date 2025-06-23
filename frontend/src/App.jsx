import React, { useState, useEffect, useRef, useMemo } from 'react';
import './styles.css';
import mermaid from 'mermaid';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// URLs de Auth y Generate definidas en .env
const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'https://<tu-auth-endpoint>.amazonaws.com/dev';
const GENERATE_URL = import.meta.env.VITE_GENERATE_URL || 'https://<tu-generate-endpoint>.amazonaws.com/dev';

// Componente SignIn - fuera del componente principal para evitar re-renders
const SignIn = ({ 
  activeTheme, 
  themes, 
  currentTheme, 
  changeTheme, 
  handleLogin, 
  tenantId,
  setTenantId,
  userId, 
  setUserId, 
  password, 
  setPassword, 
  authError, 
  setIsRegistering 
}) => (
  <div className="auth-form">
    <div className="auth-header">
      <h2>{activeTheme.name} ACCESO AL SISTEMA</h2>
      <p>Identifícate para acceder</p>
    </div>
    <form onSubmit={handleLogin}>
      <div className="input-group">
        <label>🏷️ Tenant</label>
        <input
          type="text"
          placeholder="ID del Tenant"
          value={tenantId}
          onChange={e => setTenantId(e.target.value)}
          required
        />
      </div>
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

// Componente SignUp - fuera del componente principal para evitar re-renders
const SignUp = ({ 
  activeTheme, 
  themes, 
  currentTheme, 
  changeTheme, 
  handleRegister, 
  tenantId,
  setTenantId,
  userId, 
  setUserId, 
  password, 
  setPassword, 
  authError, 
  setIsRegistering 
}) => (
  <div className="auth-form">
    <div className="auth-header">
      <h2>{activeTheme.name} REGISTRO</h2>
      <p>Únete al equipo</p>
    </div>
    <form onSubmit={handleRegister}>
      <div className="input-group">
        <label>🏷️ Tenant</label>
        <input
          type="text"
          placeholder="ID del Tenant"
          value={tenantId}
          onChange={e => setTenantId(e.target.value)}
          required
        />
      </div>
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

export default function App() {
  // Estado multitenancy
  const [tenantId, setTenantId] = useState(
    localStorage.getItem('tenantId') || ''
  );
  // Estado de historial de diagramas procesados
  const [history, setHistory] = useState([]);

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
  const [successMessage, setSuccessMessage] = useState('');
  const [graphType, setGraphType] = useState('flowchart');
  const [saveFormat, setSaveFormat] = useState('svg');
  const [isDragOver, setIsDragOver] = useState(false);
  const [showDropModal, setShowDropModal] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Batman siempre en modo oscuro
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('selectedTheme') || 'batman';
  });

  // Estado para modal de historial
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [modalImgUrl, setModalImgUrl] = useState('');

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
      },
      stateDiagram: {
        "states": [
          {
            "id": "idle",
            "label": "🦇 En la Cueva",
            "type": "state"
          },
          {
            "id": "alert",
            "label": "🚨 Alerta Activada",
            "type": "state"
          },
          {
            "id": "investigating",
            "label": "🔍 Investigando",
            "type": "state"
          },
          {
            "id": "combat",
            "label": "⚔️ En Combate",
            "type": "state"
          },
          {
            "id": "victory",
            "label": "🏆 Misión Completada",
            "type": "state"
          }
        ],
        "transitions": [
          {"from": "idle", "to": "alert", "text": "Bat-Signal"},
          {"from": "alert", "to": "investigating", "text": "analizar amenaza"},
          {"from": "investigating", "to": "combat", "text": "encontrar criminal"},
          {"from": "combat", "to": "victory", "text": "derrotar enemigo"},
          {"from": "victory", "to": "idle", "text": "regresar a casa"},
          {"from": "investigating", "to": "idle", "text": "falsa alarma"},
          {"from": "combat", "to": "alert", "text": "escape del criminal"}
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
  
  // Referencias para Mermaid
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
        body: JSON.stringify({
          tenant_id: tenantId,
          user_id: userId,
          password
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      setToken(data.token);
      // cargar historial tras login
      fetchHistory(data.token);
    } catch (err) {
      setAuthError(err.message);
    }
  }

  // Función para registro con tenantId
  async function handleRegister(e) {
    e.preventDefault();
    setAuthError('');
    setRegisterMessage('');
    try {
      const res = await fetch(`${AUTH_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenantId,
          user_id: userId,
          password
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Register failed');
      setRegisterMessage(data.message || 'Héroe registrado en la Liga');
      setIsRegistering(false);
    } catch (err) {
      setAuthError(err.message);
    }
  }  // Funciones de diagrama con mejor diagnóstico
  async function handlePreview() {
    setError('');
    setSuccessMessage('');
    setDiagram('');
    setIsLoading(true);
    
    console.log('=== INICIANDO PREVIEW ===');
    console.log('Tipo de entrada:', inputType);
    console.log('Tipo de diagrama:', graphType);
    console.log('Código:', code);
    
    try {
      // Validar que tenemos token
      if (!token || token.trim() === '') {
        throw new Error('No hay token de autenticación. Inicia sesión nuevamente.');
      }

      // Validar JSON antes de enviar (solo para tipo JSON)
      if (inputType === 'json') {
        try {
          const parsedCode = JSON.parse(code);
          console.log('JSON parseado correctamente:', parsedCode);
        } catch (parseError) {
          console.error('Error parseando JSON:', parseError);
          throw new Error(`El código no es un JSON válido: ${parseError.message}`);
        }
      }

      console.log('Enviando request al backend...');
      const requestBody = { 
        code, 
        type: inputType, 
        format: 'svg', 
        diagram: graphType 
      };
      console.log('Request body:', requestBody);

      const res = await fetch(`${GENERATE_URL}/generate/preview`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.trim()}`,
          'X-Tenant-Id': tenantId
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);
      
      if (!res.ok) {
        throw new Error(data.error || `Error ${res.status}: ${res.statusText}`);
      }
      
      console.log('Diagrama recibido del backend:', data.diagram);
      setDiagram(data.diagram);
    } catch (err) {
      console.error('=== ERROR EN PREVIEW ===');
      console.error('Error completo:', err);
      setError(`❌ ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }async function handleSaveFromPreview() {
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
          'Authorization': `Bearer ${token.trim()}`,
          'X-Tenant-Id': tenantId
        },
        body: JSON.stringify({
          tenant_id: tenantId,
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
  }  // Función para exportar SVG a PDF (método más simple y confiable)
  async function exportSvgToPDF() {
    console.log('Iniciando exportación PDF...');
    
    if (!svgRef.current) {
      setError('No hay diagrama para exportar');
      return;
    }

    setIsLoading(true);
    try {
      const svgElement = svgRef.current.querySelector('svg');
      
      if (!svgElement) {
        setError('No se encontró elemento SVG para exportar');
        setIsLoading(false);
        return;
      }

      // Crear PDF simple con información del diagrama
      const pdf = new jsPDF();
      
      // Agregar encabezado
      pdf.setFontSize(20);
      pdf.setTextColor(40, 40, 40);
      const title = `🦇 Diagrama ${graphType.charAt(0).toUpperCase() + graphType.slice(1)}`;
      pdf.text(title, 20, 30);
      
      // Agregar información
      pdf.setFontSize(12);
      pdf.setTextColor(80, 80, 80);
      pdf.text(`Generado: ${new Date().toLocaleString()}`, 20, 50);
      pdf.text(`Tipo: ${inputType.toUpperCase()}`, 20, 65);
      pdf.text(`Formato: ${saveFormat.toUpperCase()}`, 20, 80);
      
      // Línea separadora
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, 90, 190, 90);
      
      // Agregar código fuente
      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);
      pdf.text('Código fuente del diagrama:', 20, 110);
      
      // Procesar código línea por línea
      const codeLines = code.split('\n');
      let yPos = 125;
      pdf.setFontSize(9);
      pdf.setTextColor(40, 40, 40);
      
      codeLines.forEach((line, index) => {
        if (yPos > 280) { // Nueva página si es necesario
          pdf.addPage();
          yPos = 30;
        }
        // Limitar longitud de línea para que quepa en la página
        const maxLineLength = 85;
        if (line.length > maxLineLength) {
          const wrappedLines = [];
          for (let i = 0; i < line.length; i += maxLineLength) {
            wrappedLines.push(line.substring(i, i + maxLineLength));
          }
          wrappedLines.forEach((wrappedLine, wrapIndex) => {
            pdf.text(wrappedLine, 20, yPos);
            yPos += 12;
          });
        } else {
          pdf.text(line || ' ', 20, yPos);
          yPos += 12;
        }
      });
      
      // Nota sobre visualización
      pdf.addPage();
      pdf.setFontSize(14);
      pdf.setTextColor(40, 40, 40);
      pdf.text('📊 Sobre la Visualización', 20, 30);
      
      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);
      const noteText = [
        'Este PDF contiene el código fuente del diagrama.',
        'Para ver la representación visual completa:',
        '',
        '1. Use la función "Exportar SVG" en la aplicación',
        '2. O acceda a la URL guardada en el servidor',
        '',
        'El diagrama fue generado usando Mermaid.js',
        'y se muestra en tiempo real en la interfaz web.'
      ];
      
      let noteY = 50;
      noteText.forEach(line => {
        pdf.text(line, 20, noteY);
        noteY += 15;
      });      const fileName = `diagrama_${graphType}_${Date.now()}.pdf`;
      pdf.save(fileName);
      
      setError(''); // Limpiar errores
      setSuccessMessage('✅ PDF exportado exitosamente con código fuente');
      console.log('PDF exportado exitosamente');
        } catch (err) {
      console.error('Error en exportación PDF:', err);
      setSuccessMessage(''); // Limpiar mensajes de éxito
      setError(`⚠️ Error exportando PDF: ${err.message}. Usa 'Exportar SVG' como alternativa.`);
    } finally {
      setIsLoading(false);
    }
  }

  // Función alternativa para exportar SVG directo
  function exportSvgDirect() {
    if (!svgRef.current) {
      setSuccessMessage('');
      setError('No hay diagrama para exportar');
      return;
    }

    try {
      const svgElement = svgRef.current.querySelector('svg');
      if (!svgElement) {
        setSuccessMessage('');
        setError('No se encontró elemento SVG');
        return;
      }

      // Obtener el SVG como string
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      
      // Crear URL para descarga
      const url = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `diagrama_${graphType}_${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setError(''); // Limpiar errores
      setSuccessMessage('✅ SVG exportado exitosamente');
    } catch (err) {
      setSuccessMessage(''); // Limpiar mensajes de éxito
      setError(`Error exportando SVG: ${err.message}`);
    }
  }

  // Función para toggle del modo oscuro
  function toggleDarkMode() {
    setIsDarkMode(!isDarkMode);
  }  // Integrar mermaid with mejor manejo de errores
  useEffect(() => {
    if (diagram && svgRef.current) {
      console.log('Iniciando renderización de Mermaid...');
      console.log('Diagrama recibido:', diagram);
      console.log('Tipo de diagrama:', graphType);
      
      mermaid.initialize({ 
        startOnLoad: false,
        theme: isDarkMode ? 'dark' : 'default',
        securityLevel: 'loose',
        fontFamily: 'Arial, sans-serif'
      });
      
      // Limpiar contenido previo
      svgRef.current.innerHTML = '';
      
      mermaid.render(mermaidId, diagram)
        .then(({ svg }) => { 
          console.log('Mermaid renderizado exitosamente');
          svgRef.current.innerHTML = svg; 
          setError(''); // Limpiar errores previos
        })
        .catch(err => {
          console.error('Mermaid render error:', err);
          console.error('Diagrama que causó el error:', diagram);
          
          // Mostrar error más detallado
          let errorMessage = 'Error renderizando diagrama';
          if (err.message) {
            errorMessage += `: ${err.message}`;
          }
          
          // Agregar sugerencias según el tipo de error
          if (err.message && err.message.includes('Parse error')) {
            errorMessage += '. Verifica la sintaxis del código JSON.';
          } else if (err.message && err.message.includes('syntax')) {
            errorMessage += '. Error de sintaxis en el diagrama generado.';
          }
          
          setError(errorMessage);
          
          // Mostrar información de diagnóstico en el contenedor
          svgRef.current.innerHTML = `
            <div style="
              padding: 20px; 
              background: rgba(255, 0, 0, 0.1); 
              border: 2px dashed #ff6b6b; 
              border-radius: 8px; 
              color: #fff; 
              text-align: center;
              font-family: Arial, sans-serif;
            ">
              <h3>❌ Error de Renderización</h3>
              <p><strong>Tipo:</strong> ${graphType}</p>
              <p><strong>Error:</strong> ${err.message || 'Error desconocido'}</p>
              <p><strong>Sugerencia:</strong> Verifica que el código JSON sea válido y compatible con el tipo de diagrama seleccionado.</p>
              <details style="margin-top: 15px; text-align: left;">
                <summary style="cursor: pointer; color: #ffeb3b;">Ver código generado</summary>
                <pre style="
                  background: rgba(0,0,0,0.3); 
                  padding: 10px; 
                  border-radius: 4px; 
                  overflow: auto; 
                  max-height: 200px;
                  font-size: 12px;
                ">${diagram}</pre>
              </details>
            </div>
          `;
        });
    }
  }, [diagram, mermaidId, isDarkMode, graphType]);

  // Cerrar modal con tecla Escape
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && showDropModal) {
        closeFileUploadModal();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);  }, [showDropModal]);

  // Efecto para aplicar modo oscuro y clase de app
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

  // Almacenar tenantId localmente
  useEffect(() => {
    localStorage.setItem('tenantId', tenantId);
  }, [tenantId]);
  // Función para recuperar historial
  async function fetchHistory(token) {
    console.log('[fetchHistory] token:', token, 'tenantId:', tenantId);
    try {
      const res = await fetch(`${GENERATE_URL}/generate/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token || ''}`,
          'X-Tenant-Id': tenantId
        }
      });
      if (res.ok) {
        const arr = await res.json();
        console.log('[fetchHistory] data:', arr);
        // Validar que arr es un array
        if (Array.isArray(arr)) {
          setHistory(arr);
        } else {
          console.warn('[fetchHistory] Response is not an array:', arr);
          setHistory([]);
        }
      } else {
        console.error('[fetchHistory] HTTP error:', res.status, res.statusText);
        const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }));
        setError(`Error cargando historial: ${errorData.error || res.statusText}`);
      }
    } catch (err) {
      console.error('[fetchHistory] error:', err);
      setError(`Error de conexión al cargar historial: ${err.message}`);
    }
  }  // Cargar código desde S3
  async function handleLoadFromHistory(item) {
    if (!item.source_code_s3key) {
      setError('❌ No hay código fuente guardado para este diagrama');
      console.warn('No hay código guardado para este item:', item);
      return;
    }
    
    setIsLoading(true);
    try {
      // Construir URL del código fuente
      const bucketUrl = `https://diagramas-hackacloud-dev.s3.amazonaws.com/${item.source_code_s3key}`;
      console.log('Cargando código desde:', bucketUrl);
      
      const res = await fetch(bucketUrl);
      if (!res.ok) {
        throw new Error(`Error HTTP ${res.status}: ${res.statusText}`);
      }
      
      const text = await res.text();
      setCode(text);
      setSuccessMessage('✅ Código cargado desde el historial');
      console.log('Código cargado desde historial:', text.substring(0, 100) + '...');
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error cargando código de historial:', err);
      setError(`❌ No se pudo cargar el código: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  // Ver imagen en modal
  function handleViewHistory(item) {
    setModalImgUrl(item.s3_url);
    setShowHistoryModal(true);
  }

  function closeHistoryModal() {
    setShowHistoryModal(false);
    setModalImgUrl('');
  }

  if (!token) {
    return (
      <div className={`auth-container theme-${currentTheme}`}>
        <div className="auth-background">
          <div className="theme-symbol">{activeTheme.name.split(' ')[0]}</div>
        </div>
        <div className="auth-content">
          {isRegistering ? 
            <SignUp 
              activeTheme={activeTheme}
              themes={themes}
              currentTheme={currentTheme}
              changeTheme={changeTheme}
              tenantId={tenantId}
              setTenantId={setTenantId}
              handleRegister={handleRegister}
              userId={userId}
              setUserId={setUserId}
              password={password}
              setPassword={setPassword}
              authError={authError}
              setIsRegistering={setIsRegistering}
            /> : 
            <SignIn 
              activeTheme={activeTheme}
              themes={themes}
              currentTheme={currentTheme}
              changeTheme={changeTheme}
              tenantId={tenantId}
              setTenantId={setTenantId}
              handleLogin={handleLogin}
              userId={userId}
              setUserId={setUserId}
              password={password}
              setPassword={setPassword}
              authError={authError}
              setIsRegistering={setIsRegistering}
            />
          }
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
          </div>          <div 
            className={`textarea-container ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <textarea
              className="code-textarea"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={getPlaceholder()}
              rows={20}
              spellCheck={false}
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
            </button>            {successMessage && <div className="success-message">{successMessage}</div>}
            {error && (
              <div className={error.startsWith('✅') ? 'success-message' : 'error-message'}>
                {error.startsWith('✅') ? '' : '⚠️ '}{error}
              </div>
            )}
          </div>
        </div>        {/* Panel de preview con temática Batman */}
        {diagram && (
          <div className="preview-panel">
            <div className="preview-header">
              <h3>👁️ VISUALIZACIÓN DEL DIAGRAMA</h3>
              <div className="preview-actions">
                <button 
                  onClick={exportSvgToPDF} 
                  className="btn-secondary"
                  disabled={isLoading}
                  title="Exportar como archivo PDF"
                >
                  📄 PDF
                </button>
                <button 
                  onClick={exportSvgDirect} 
                  className="btn-secondary"
                  disabled={isLoading}
                  title="Exportar como archivo SVG"
                >
                  🎨 SVG
                </button>
                <button 
                  onClick={handleSaveFromPreview} 
                  className="btn-primary"
                  disabled={isLoading}
                  title="Guardar en el servidor"
                >
                  {isLoading ? '⏳ Guardando...' : '💾 GUARDAR'}
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

      {/* Panel de historial de diagramas procesados */}
      {token && (
        <div className="history-panel">
          <p className="history-note">⚠️ Solo se guardarán en el historial los diagramas sobre los que presiones "Guardar".</p>
          <h3>📜 Historial de diagramas</h3>
          <button onClick={() => fetchHistory(token)} className="btn-secondary">
            🔄 Actualizar Historial
          </button>
          
          {history.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem', 
              color: 'var(--text-color)', 
              opacity: '0.7' 
            }}>
              📭 No hay diagramas guardados aún.<br/>
              <small>Genera y guarda tu primer diagrama para verlo aquí.</small>
            </div>
          ) : (
            <ul>
              {history.map(item => (
                <li key={item.diagram_id}>
                  <div className="history-item-info">
                    <strong>
                      {item.createdAt ? 
                        new Date(item.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 
                        'Fecha no disponible'
                    }</strong>
                    <span> – {item.diagram_type || 'Tipo no disponible'}</span>
                    {!item.source_code_s3key && (
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: 'orange', 
                        marginTop: '0.25rem' 
                      }}>
                        ⚠️ Sin código fuente
                      </div>
                    )}
                  </div>
                  <div className="history-item-actions">
                    <button 
                      onClick={() => handleLoadFromHistory(item)} 
                      className="btn-secondary"
                      disabled={!item.source_code_s3key || isLoading}
                      title={!item.source_code_s3key ? 'No hay código fuente disponible' : 'Cargar código en el editor'}
                    >
                      🔄 Cargar
                    </button>
                    <button 
                      onClick={() => handleViewHistory(item)} 
                      className="btn-primary"
                      title="Ver imagen del diagrama"
                    >
                      👁️ Ver
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Modal para visualizar historial */}
      {showHistoryModal && (
        <div className="modal-overlay" onClick={closeHistoryModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>👁️ Vista de Historial</h3>
              <button className="modal-close" onClick={closeHistoryModal}>✕</button>
            </div>
            <div className="modal-body">
              <img src={modalImgUrl} alt="Historial Diagrama" className="history-img" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
