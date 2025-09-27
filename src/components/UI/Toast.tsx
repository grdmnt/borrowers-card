import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from '@/styles/components/Toast.module.css';

export interface ToastProps {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type = 'info',
  duration = 5000,
  onClose,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Show toast
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto hide toast
    const hideTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const toastClasses = [
    styles.toast,
    styles[type],
    isVisible && styles.visible,
    isExiting && styles.exiting
  ].filter(Boolean).join(' ');

  const getIcon = () => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✗';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return 'ℹ';
    }
  };

  return (
    <div className={toastClasses} role="alert" aria-live="polite">
      <div className={styles.icon}>
        {getIcon()}
      </div>
      <div className={styles.message}>
        {message}
      </div>
      <button
        className={styles.closeButton}
        onClick={handleClose}
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
};

// Toast Container Component
export interface ToastContainerProps {
  toasts: ToastProps[];
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  position = 'top-right'
}) => {
  if (toasts.length === 0) return null;

  const containerClasses = [
    styles.container,
    styles[position]
  ].filter(Boolean).join(' ');

  return createPortal(
    <div className={containerClasses}>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} position={position} />
      ))}
    </div>,
    document.body
  );
};

export default Toast;
