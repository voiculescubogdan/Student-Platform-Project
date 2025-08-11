import React from 'react';
import './ActionButton.css';

const ActionButton = ({
  icon: Icon,
  text,
  count,
  active = false,
  onClick,
  stopPropagation = true,
  disabled = false,
  className = '',
}) => {
  const handleClick = (e) => {
    if (stopPropagation) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (onClick && !disabled) {
      onClick(e);
    }
  };

  return (
    <button
      className={`action-button ${active ? 'active' : ''} ${className}`}
      onClick={handleClick}
      disabled={disabled}
    >
      {Icon && <Icon className="action-icon" />}
      {count !== undefined && <span className="action-count">{count}</span>}
      {text && <span className="action-text">{text}</span>}
    </button>
  );
};

export default ActionButton;