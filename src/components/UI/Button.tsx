import React from 'react';
import styles from '@/styles/components/Button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  className = '',
  ...props
}) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    loading && styles.loading,
    className
  ].filter(Boolean).join(' ');

  const isDisabled = disabled || loading;

  return (
    <button
      className={buttonClasses}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <span className={styles.spinner} aria-hidden="true">
          <span className={styles.spinnerIcon}></span>
        </span>
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className={styles.iconLeft} aria-hidden="true">
          {icon}
        </span>
      )}
      
      {children && (
        <span className={styles.content}>
          {children}
        </span>
      )}
      
      {!loading && icon && iconPosition === 'right' && (
        <span className={styles.iconRight} aria-hidden="true">
          {icon}
        </span>
      )}
    </button>
  );
};

export default Button;
