import { useState } from 'react';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import WelcomePanel from './components/WelcomePanel';
import './index.css';

export default function App() {
  const [toggled, setToggled] = useState(false);

  return (
    <div className={`container ${toggled ? 'toggle' : ''}`}>
      <div className="container-form"><SignIn /></div>
      <div className="container-form"><SignUp /></div>
      <WelcomePanel
        toggled={toggled}
        onSignIn={() => setToggled(false)}
        onSignUp={() => setToggled(true)}
      />
    </div>
  );
}
