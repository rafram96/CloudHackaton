import { useState } from 'react';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import WelcomePanel from './components/WelcomePanel';
import DiagramEditor  from './components/DiagramEditor';
import './index.css';

export default function App() {
  const [toggled, setToggled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

   // Si ya “inició sesión”, muestra la segunda vista
  if (isLoggedIn) {
    return <DiagramEditor />;
  }

    // Si no, sigue con tu login/signup actual
  return (
    <div className={`container ${toggled ? 'toggle' : ''}`}>
      <div className="container-form">
        <SignIn onLoginSuccess={() => setIsLoggedIn(true)} />
      </div>
      <div className="container-form">
        <SignUp />
      </div>
      <WelcomePanel
        onSignIn={()  => setToggled(false)}
        onSignUp={() => setToggled(true)}
      />
    </div>
  );
}


