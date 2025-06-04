// src/assets/components/SplashScreen.jsx
import React, { useEffect } from 'react';

const SplashScreen = ({ onAnimationEnd }) => {
  useEffect(() => {
    // This timeout should match the duration of your splash screen animation
    // or how long you want the splash screen to be visible.
    const timer = setTimeout(() => {
      onAnimationEnd(); // Call the function passed from App.jsx
    }, 3000); // Display for 3 seconds (adjust as needed for animation)

    return () => clearTimeout(timer); // Clean up the timer
  }, [onAnimationEnd]);

  return (
    <div className="splash-screen-container">
      <h1 className="splash-title">Numa</h1>
      <p className="splash-tagline">Your AI Therapist</p>
    </div>
  );
};

export default SplashScreen;