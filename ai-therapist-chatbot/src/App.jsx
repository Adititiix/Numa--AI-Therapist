// src/App.jsx
import React, { useState, useEffect } from 'react';
import ChatWindow from './assets/components/ChatWindow';
import SplashScreen from './assets/components/SplashScreen'; // Import the new SplashScreen
import './App.css';

import { GoogleLogin } from '@react-oauth/google';

function App() {
  const [appState, setAppState] = useState('splash'); // New state: 'splash', 'login', 'chat'
  const [user, setUser] = useState(null);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // Effect to handle the transition from splash screen
  useEffect(() => {
    if (appState === 'splash') {
      // SplashScreen handles its own timer to call onAnimationEnd
      // We don't need a separate timer here if SplashScreen does its job
    } else if (appState === 'login') {
      // On login screen, check for stored user immediately
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setAppState('chat'); // If user is found, go directly to chat
        } catch (e) {
          console.error("Failed to parse stored user data:", e);
          localStorage.removeItem('user'); // Clear corrupted data
        }
      }
    }
  }, [appState]); // Run when appState changes

  // Callback from SplashScreen when its animation/timer ends
  const handleSplashEnd = () => {
    setAppState('login');
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoadingLogin(true);
    setLoginError(null);
    console.log('Google login success:', credentialResponse);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Backend response:', data);

      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        setAppState('chat'); // <-- Change state to 'chat' on successful login
      } else {
        setLoginError(data.message || 'Login failed on backend.');
      }
    } catch (error) {
      console.error('Error during backend token verification:', error);
      setLoginError(error.message || 'Could not connect to backend for login or token verification failed.');
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google login failed:', error);
    setLoginError('Google login failed. Please try again.');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setAppState('login'); // Go back to login screen on logout
  };

  return (
    <div className="App">
      {appState === 'splash' && (
        <SplashScreen onAnimationEnd={handleSplashEnd} />
      )}

      {appState === 'login' && (
        <div className="login-container">
          <h2>Welcome to AI Therapist Chatbot</h2>
          <p>Please sign in with your Google account to start chatting.</p>
          {loadingLogin && <p>Signing in...</p>}
          {loginError && <p className="error-message">{loginError}</p>}
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
          />
        </div>
      )}

      {appState === 'chat' && user && (
        <ChatWindow loggedInUser={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;