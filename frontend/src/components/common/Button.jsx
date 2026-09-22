import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'outline'
  type = 'button', 
  isLoading = false, 
  disabled = false, 
  onClick,
  className = '',
  ...props 
}) => {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? <span className="spinner"></span> : children}
    </button>
  );
};

export default Button;