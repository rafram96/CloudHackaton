import React from 'react';

export default function TestApp() {
  return (
    <div style={{ padding: '20px', background: '#0a0a0a', color: '#fff', minHeight: '100vh' }}>
      <h1>🦇 Test App Funcionando</h1>
      <p>Si ves este mensaje, React está funcionando correctamente</p>
      <button onClick={() => alert('¡Botón funcionando!')}>
        Probar Interactividad
      </button>
    </div>
  );
}
