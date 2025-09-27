import React from 'react';
import styles from '@/styles/components/Card.module.css';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  clickable?: boolean;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  clickable = false,
  className = '',
  onClick,
  ...props
}) => {
  const cardClasses = [
    styles.card,
    styles[variant],
    styles[`padding-${padding}`],
    hover && styles.hover,
    clickable && styles.clickable,
    className
  ].filter(Boolean).join(' ');

  const CardComponent = clickable ? 'button' : 'div';

  return (
    <CardComponent
      className={cardClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

// Sub-components for structured content
export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`${styles.header} ${className}`}>
    {children}
  </div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <h3 className={`${styles.title} ${className}`}>
    {children}
  </h3>
);

export const CardSubtitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <p className={`${styles.subtitle} ${className}`}>
    {children}
  </p>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`${styles.content} ${className}`}>
    {children}
  </div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`${styles.footer} ${className}`}>
    {children}
  </div>
);

export const CardImage: React.FC<{ 
  src: string; 
  alt: string; 
  className?: string;
  aspectRatio?: '1:1' | '4:3' | '16:9' | 'auto';
}> = ({ 
  src, 
  alt, 
  className = '',
  aspectRatio = 'auto'
}) => (
  <div className={`${styles.imageContainer} ${styles[`aspect-${aspectRatio}`]} ${className}`}>
    <img 
      src={src} 
      alt={alt} 
      className={styles.image}
      loading="lazy"
    />
  </div>
);

export default Card;
