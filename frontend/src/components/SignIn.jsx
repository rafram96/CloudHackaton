import React from 'react';

export default function SignIn({ onSubmit, onSwitch, error, userId, setUserId, password, setPassword }) {
  return (
    <form className="sign-in" onSubmit={onSubmit}>
      <h2>Iniciar Sesión</h2>

      <div className="social-network">
        <ion-icon name="logo-twitch"></ion-icon>
        <ion-icon name="logo-twitter"></ion-icon>
        <ion-icon name="logo-instagram"></ion-icon>
        <ion-icon name="logo-tiktok"></ion-icon>
      </div>

      <span>Use su usuario y contraseña</span>

      <div className="container-input">
        <ion-icon name="person-outline"></ion-icon>
        <input 
          type="text" 
          placeholder="Usuario" 
          value={userId}
          onChange={e => setUserId(e.target.value)}
          required
        />
      </div>
      <div className="container-input">
        <ion-icon name="lock-closed-outline"></ion-icon>
        <input 
          type="password" 
          placeholder="Contraseña" 
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>

      {error && <div className="error-message" style={{color: 'red', fontSize: '12px', marginBottom: '10px'}}>{error}</div>}
      
      <a href="#" onClick={e => { e.preventDefault(); onSwitch(); }}>¿No tienes cuenta? Regístrate</a>
      <button type="submit" className="button">INICIAR SESIÓN</button>
    </form>
  );
}
