import React, { useRef, useState } from 'react';
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
  const actionRef = useRef(false);
  const [actionBusy, setActionBusy] = useState(false);

  const handleClick = async (event) => {
    if (actionRef.current) return;
    actionRef.current = true;
    setActionBusy(true);
    try {
      await onClick?.(event);
    } finally {
      actionRef.current = false;
      setActionBusy(false);
    }
  };

  return (
    <button
      type={type}
      className={`btn btn-${variant} ${className}`}
      disabled={disabled || isLoading || actionBusy}
      onClick={handleClick}
      {...props}
    >
      {isLoading ? <span className="spinner"></span> : children}
    </button>
  );
};

export default Button;