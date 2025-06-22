import React, { useState } from 'react';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault(); // Evita recargar la página

    try {
      const response = await fetch('https://osdrx4jjs2.execute-api.us-east-1.amazonaws.com/dev/auth/register', {
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
        alert('Usuario registrado con éxito');
        console.log(data);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Error de red o del servidor');
      console.error(error);
    }
  };

  return (
    <form className="sign-up" onSubmit={handleSignup}>
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
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="container-input">
        <ion-icon name="lock-closed-outline"></ion-icon>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="button">REGISTRARSE</button>
    </form>
  );
}

