import React from 'react';
import { ClipLoader, PulseLoader, BeatLoader } from 'react-spinners';
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

  // Size mapping for react-spinners
  const getSpinnerSize = () => {
    switch (size) {
      case 'sm': return 20;
      case 'md': return 32;
      case 'lg': return 48;
      default: return 32;
    }
  };

  const spinnerSize = getSpinnerSize();
  const color = '#6D4C41'; // Library card brown color

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      <div className={styles.loading}>
        {variant === 'spinner' && (
          <ClipLoader
            color={color}
            size={spinnerSize}
            cssOverride={{
              borderWidth: '2px',
            }}
          />
        )}
        {variant === 'dots' && (
          <BeatLoader
            color={color}
            size={Math.max(6, spinnerSize / 4)}
            margin={2}
          />
        )}
        {variant === 'pulse' && (
          <PulseLoader
            color={color}
            size={Math.max(8, spinnerSize / 3)}
            margin={3}
          />
        )}
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
