import React from 'react';

export default function SignUp() {
  return (
    <form className="sign-up">
      <h2>Registrarse</h2>

      <div className="social-network">
        <ion-icon name="logo-twitch"></ion-icon>
        <ion-icon name="logo-twitter"></ion-icon>
        <ion-icon name="logo-instagram"></ion-icon>
        <ion-icon name="logo-tiktok"></ion-icon>
      </div>

      <span>Use su correo electrónico para registrarse</span>

      <div className="container-input">
        <ion-icon name="mail-outline"></ion-icon>
        <input type="text" placeholder="Email" />
      </div>
      <div className="container-input">
        <ion-icon name="lock-closed-outline"></ion-icon>
        <input type="password" placeholder="Password" />
      </div>

      <button className="button">REGISTRARSE</button>
    </form>
  );
}
