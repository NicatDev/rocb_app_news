import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './i18n';
// import 'antd/dist/reset.css'; // Not strictly needed for Antd v5 but good for resets if using
import './index.css'; // Default vite styles, maybe remove or clear


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
