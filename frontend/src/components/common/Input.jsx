import React, { useState } from 'react';
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
  showPasswordToggle = false,
  className = '',
  ...props
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const inputType = showPasswordToggle && type === 'password' && passwordVisible ? 'text' : type;

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={name} className="input-label">
          {label} {required && <span className="required-star">*</span>}
        </label>
      )}
      <div className="input-control">
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input-field ${showPasswordToggle ? 'input-with-toggle' : ''} ${error ? 'input-error' : ''}`}
          {...props}
        />
        {showPasswordToggle && type === 'password' && <button
          type="button"
          className="password-toggle"
          onClick={() => setPasswordVisible((visible) => !visible)}
          aria-label={passwordVisible ? 'Hide password' : 'Show password'}
          title={passwordVisible ? 'Hide password' : 'Show password'}
        >
          {passwordVisible ? '🙈' : '👁️'}
        </button>}
      </div>
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

export default Input;