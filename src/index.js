import React from 'react';
import ReactDOM from 'react-dom/client'; // Update the import statement
import './styles/style.css'; // Importing your custom styles
import App from './App'; // Importing the main App component

// Create a root element
const root = ReactDOM.createRoot(document.getElementById('root')); 

// Render your App component inside the root
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
