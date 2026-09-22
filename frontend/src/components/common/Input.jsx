import React from 'react';
import './Input.css';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder = '',
  error = '',
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={name} className="input-label">
          {label} {required && <span className="required-star">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`input-field ${error ? 'input-error' : ''}`}
        {...props}
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

export default Input;