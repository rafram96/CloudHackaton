import { useState, useEffect } from 'react';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import WelcomePanel from './components/WelcomePanel';
import DiagramEditor from './components/DiagramEditor';
import './index.css';

export default function App() {
  const [toggled, setToggled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  //  Validar token al cargar la app
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetch('https://osdrx4jjs2.execute-api.us-east-1.amazonaws.com/dev/auth/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.user_id) {
            setIsLoggedIn(true);
            console.log('Token válido. Sesión restaurada para:', data.user_id);
          } else {
            localStorage.removeItem('authToken');
            console.warn('Token expirado o inválido');
          }
        })
        .catch(err => {
          console.error('Error al verificar el token:', err);
          localStorage.removeItem('authToken');
        });
    }
  }, []);

  //  Si ya inició sesión, muestra la vista principal
  if (isLoggedIn) {
    return <DiagramEditor />;
  }

  // 👤 Vista de login/signup
  return (
    <div className={`container ${toggled ? 'toggle' : ''}`}>
      <div className="container-form">
        <SignIn onLoginSuccess={() => setIsLoggedIn(true)} />
      </div>
      <div className="container-form">
        <SignUp />
      </div>
      <WelcomePanel
        onSignIn={() => setToggled(false)}
        onSignUp={() => setToggled(true)}
      />
    </div>
  );
}



