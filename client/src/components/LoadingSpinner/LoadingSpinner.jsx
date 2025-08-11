import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({
  message = 'Se încarcă...',
  className = '',
  spinnerSize = '',
  spinnerColor = 'primary'
}) => {
  const spinnerClasses = [
    'spinner-border',
    `text-${spinnerColor}`,
    spinnerSize ? `spinner-border-${spinnerSize}` : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={`loading-spinner text-center py-4 ${className}`}>
      <div className={spinnerClasses} role="status">
        <span className="visually-hidden">Se încarcă...</span>
      </div>
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;