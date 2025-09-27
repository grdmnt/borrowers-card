import React from 'react';
import styles from '@/styles/pages/Dashboard.module.css';

interface DashboardProps {
  user?: {
    name?: string;
    email: string;
  } | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const userName = user?.name || user?.email?.split('@')[0] || 'Guest';

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        {/* Header Section */}
        <div className={styles.header}>
          <h1 className={styles.title}>Library Dashboard</h1>
          <p className={styles.subtitle}>
            Track your borrowed and lent items with ease
          </p>
        </div>

        {/* Welcome Card */}
        <div className={styles.welcomeCard}>
          <div className={styles.welcomeContent}>
            <h2 className={styles.welcomeTitle}>
              Welcome back, {userName}!
            </h2>
            <p className={styles.welcomeText}>
              Your personal library card system is ready to help you keep track of all your borrowed and lent items. 
              Start by adding items or exploring your current collection.
            </p>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>0</span>
            <span className={styles.statLabel}>Borrowed Items</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>0</span>
            <span className={styles.statLabel}>Lent Items</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>0</span>
            <span className={styles.statLabel}>Overdue Items</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>0</span>
            <span className={styles.statLabel}>Groups</span>
          </div>
        </div>

        {/* Main Sections Grid */}
        <div className={styles.sectionsGrid}>
          {/* Borrowed Items Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Borrowed Items</h3>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.placeholderContent}>
                <div className={styles.placeholderIcon}>📖</div>
                <p className={styles.placeholderText}>
                  No borrowed items yet
                </p>
                <p className={styles.placeholderSubtext}>
                  Start tracking items you've borrowed from friends, family, or libraries
                </p>
                <div className={styles.quickActions}>
                  <button className={styles.actionButton}>
                    Add Borrowed Item
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Lent Items Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Lent Items</h3>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.placeholderContent}>
                <div className={styles.placeholderIcon}>📤</div>
                <p className={styles.placeholderText}>
                  No lent items yet
                </p>
                <p className={styles.placeholderSubtext}>
                  Keep track of items you've lent to others
                </p>
                <div className={styles.quickActions}>
                  <button className={styles.actionButton}>
                    Add Lent Item
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Quick Actions</h3>
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.quickActions}>
              <button className={styles.actionButton}>
                📚 Add Borrowed Item
              </button>
              <button className={styles.actionButton}>
                📤 Add Lent Item
              </button>
              <button className={styles.actionButton}>
                👥 Create Group
              </button>
              <button className={styles.actionButton}>
                📊 View Reports
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Recent Activity</h3>
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.placeholderContent}>
              <div className={styles.placeholderIcon}>📋</div>
              <p className={styles.placeholderText}>
                No recent activity
              </p>
              <p className={styles.placeholderSubtext}>
                Your recent borrowing and lending activity will appear here
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
