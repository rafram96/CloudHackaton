import React from 'react';

export default function WelcomePanel({ onSignIn, onSignUp }) {
  return (
    <div className="container-welcome">
      <div className="welcome welcome-sign-up">
        <h3>¡Bienvenido!</h3>
        <p>Ingrese sus datos personales para usar todas las funciones del sitio</p>
        <button className="button" onClick={onSignUp}>
          Registrarse
        </button>
      </div>

      <div className="welcome welcome-sign-in">
        <h3>¡Hola!</h3>
        <p>Registrese con sus datos personales para usar todas las funciones del sitio</p>
        <button className="button" onClick={onSignIn}>
          Iniciar Sesión
        </button>
      </div>
    </div>
  );
}
