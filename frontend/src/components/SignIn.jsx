import React from 'react';

export default function SignIn({ onLoginSuccess }) {
  return (
    <form className="sign-in">
      <h2>Iniciar Sesión</h2>

      <div className="social-network">
        <ion-icon name="logo-twitch"></ion-icon>
        <ion-icon name="logo-twitter"></ion-icon>
        <ion-icon name="logo-instagram"></ion-icon>
        <ion-icon name="logo-tiktok"></ion-icon>
      </div>

      <span>Use su correo y contraseña</span>

      <div className="container-input">
        <ion-icon name="mail-outline"></ion-icon>
        <input type="text" placeholder="Email" />
      </div>
      <div className="container-input">
        <ion-icon name="lock-closed-outline"></ion-icon>
        <input type="password" placeholder="Password" />
      </div>

      <a href="#">¿Olvidaste tu contraseña?</a>
      <button className="button" onClick={onLoginSuccess}>INICIAR SESIÓN</button>
    </form>
  );
}
