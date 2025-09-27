import React, { forwardRef } from 'react';
import styles from '@/styles/components/FormControls.module.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'default',
  fullWidth = false,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const containerClasses = [
    styles.inputContainer,
    styles[variant],
    fullWidth && styles.fullWidth,
    error && styles.error,
    props.disabled && styles.disabled,
    className
  ].filter(Boolean).join(' ');

  const inputClasses = [
    styles.input,
    leftIcon && styles.hasLeftIcon,
    rightIcon && styles.hasRightIcon
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {props.required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      <div className={styles.inputWrapper}>
        {leftIcon && (
          <span className={styles.leftIcon} aria-hidden="true">
            {leftIcon}
          </span>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          {...props}
        />
        
        {rightIcon && (
          <span className={styles.rightIcon} aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </div>
      
      {(error || helperText) && (
        <div className={styles.helperText}>
          {error || helperText}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
