// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // Keep this for basic global styles if it exists

// Import GoogleOAuthProvider
import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Wrap your App component with GoogleOAuthProvider */}
    <GoogleOAuthProvider clientId="263293889539-s3v3aah0tsdv6j8celhn3eh955i8dqlr.apps.googleusercontent.com"> {/* */}
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);