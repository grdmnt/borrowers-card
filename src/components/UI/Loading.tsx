import React from 'react';
import styles from '@/styles/components/Loading.module.css';

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  text,
  fullScreen = false,
  className = ''
}) => {
  const containerClasses = [
    styles.container,
    fullScreen && styles.fullScreen,
    className
  ].filter(Boolean).join(' ');

  const loadingClasses = [
    styles.loading,
    styles[variant],
    styles[size]
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      <div className={loadingClasses}>
        {variant === 'spinner' && <div className={styles.spinner} />}
        {variant === 'dots' && (
          <div className={styles.dots}>
            <div className={styles.dot} />
            <div className={styles.dot} />
            <div className={styles.dot} />
          </div>
        )}
        {variant === 'pulse' && <div className={styles.pulse} />}
      </div>
      
      {text && (
        <div className={styles.text} aria-label={text}>
          {text}
        </div>
      )}
    </div>
  );
};

// Skeleton component for content loading
export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1em',
  variant = 'text',
  animation = 'pulse',
  className = ''
}) => {
  const skeletonClasses = [
    styles.skeleton,
    styles[variant],
    styles[animation],
    className
  ].filter(Boolean).join(' ');

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return <div className={skeletonClasses} style={style} aria-hidden="true" />;
};

export default Loading;
