import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = createRoot(document.getElementById('root'));

root.render(
  <GoogleOAuthProvider clientId="359298869844-onj3paqgf3s3g3uf5r82c7dbl9p8f0ch.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);
