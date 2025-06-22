import React, { useState } from 'react';

export default function SignIn({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://osdrx4jjs2.execute-api.us-east-1.amazonaws.com/dev/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: email,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.token); // Guarda token
        alert('Sesión iniciada correctamente');
        if (onLoginSuccess) onLoginSuccess(); // Notifica al componente padre
      } else {
        alert(`Error: ${data.error}`);
      }

    } catch (error) {
      console.error('Error de conexión:', error);
      alert('Ocurrió un error al intentar iniciar sesión.');
    }
  };

  return (
    <form className="sign-in" onSubmit={handleLogin}>
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
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="container-input">
        <ion-icon name="lock-closed-outline"></ion-icon>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <a href="#">¿Olvidaste tu contraseña?</a>
      <button type="submit" className="button">INICIAR SESIÓN</button>
    </form>
  );
}

