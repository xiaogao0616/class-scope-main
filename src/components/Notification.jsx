// src/components/Notification.jsx
import React, { useEffect } from 'react';

const Notification = ({ message, type, clearNotification }) => {
    if (!message) return null;

    const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
    const bgColor = type === 'success' ? '#10b981' : '#3b82f6';
    
    // Auto-remove after 3 seconds, mimicking the original JS
    useEffect(() => {
        const timer = setTimeout(() => {
            clearNotification();
        }, 3000);
        return () => clearTimeout(timer); // Cleanup
    }, [clearNotification, message]);

    return (
        <div style={{
            position: 'fixed', top: '90px', right: '20px', background: bgColor,
            color: 'white', padding: '15px 20px', borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', zIndex: 10000,
            display: 'flex', alignItems: 'center', gap: '10px',
            // Note: CSS keyframes for 'slideIn' must be in your main CSS file
            animation: 'slideIn 0.3s ease' 
        }}>
            <i className={`fas ${iconClass}`}></i>
            <span>{message}</span>
        </div>
    );
};

export default Notification;