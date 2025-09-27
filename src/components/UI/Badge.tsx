import React from 'react';
import styles from '@/styles/components/Badge.module.css';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'rounded' | 'pill' | 'square';
  icon?: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  shape = 'rounded',
  icon,
  className = ''
}) => {
  const badgeClasses = [
    styles.badge,
    styles[variant],
    styles[size],
    styles[shape],
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={badgeClasses}>
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={styles.content}>
        {children}
      </span>
    </span>
  );
};

// Status Badge Component for common item statuses
export interface StatusBadgeProps {
  status: 'active' | 'returned' | 'overdue' | 'lost' | 'pending' | 'cancelled';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const statusConfig = {
    active: { variant: 'success' as const, icon: '●', label: 'Active' },
    returned: { variant: 'info' as const, icon: '✓', label: 'Returned' },
    overdue: { variant: 'error' as const, icon: '⚠', label: 'Overdue' },
    lost: { variant: 'error' as const, icon: '✗', label: 'Lost' },
    pending: { variant: 'warning' as const, icon: '⏳', label: 'Pending' },
    cancelled: { variant: 'secondary' as const, icon: '✗', label: 'Cancelled' }
  };

  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      icon={config.icon}
      className={className}
    >
      {config.label}
    </Badge>
  );
};

export default Badge;
