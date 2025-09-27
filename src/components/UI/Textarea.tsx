import React, { forwardRef } from 'react';
import styles from '@/styles/components/FormControls.module.css';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled' | 'outlined';
  fullWidth?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  variant = 'default',
  fullWidth = false,
  resize = 'vertical',
  className = '',
  id,
  rows = 4,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  
  const containerClasses = [
    styles.inputContainer,
    styles[variant],
    fullWidth && styles.fullWidth,
    error && styles.error,
    props.disabled && styles.disabled,
    className
  ].filter(Boolean).join(' ');

  const textareaClasses = [
    styles.textarea,
    styles[`resize-${resize}`]
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={textareaId} className={styles.label}>
          {label}
          {props.required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      <div className={styles.inputWrapper}>
        <textarea
          ref={ref}
          id={textareaId}
          className={textareaClasses}
          rows={rows}
          {...props}
        />
      </div>
      
      {(error || helperText) && (
        <div className={styles.helperText}>
          {error || helperText}
        </div>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
