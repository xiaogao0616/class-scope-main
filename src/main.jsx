// src/main.jsx (UPDATED FOR CORRECT ROUTING)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import CourseDetail from './CourseDetail.jsx';
import './index.css'; 

const root = ReactDOM.createRoot(document.getElementById('root'));

// Simple Routing Logic based on URL (pathname is the key for Vite)
const renderApp = () => {
    // Check if a course is requested via query parameter
    if (window.location.search.includes('course=')) {
        return <CourseDetail />;
    }
    
    // Default to the main page (App)
    return <App />;
};


root.render(
  <React.StrictMode>
    {renderApp()}
  </React.StrictMode>
);