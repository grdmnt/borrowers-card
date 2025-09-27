import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '@/styles/components/Header.module.css';

interface HeaderProps {
  user?: {
    name?: string;
    email: string;
  } | null;
  onSignOut?: () => void;
  showNavigation?: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, onSignOut, showNavigation = true }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo */}
        <Link to="/" className={styles.logo} onClick={closeMobileMenu}>
          <div className={styles.logoIcon}>
            📚
          </div>
          <div>
            <div className={styles.logoText}>Borrower's Card</div>
            <div className={styles.logoSubtext}>Library System</div>
          </div>
        </Link>

        {/* Navigation */}
        {showNavigation && (
          <nav className={styles.nav}>
            {/* Desktop Navigation */}
            <ul className={styles.navList}>
              <li className={styles.navItem}>
                <Link to="/dashboard" className={styles.navLink}>
                  Dashboard
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link to="/borrowed" className={styles.navLink}>
                  Borrowed
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link to="/lent" className={styles.navLink}>
                  Lent
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link to="/groups" className={styles.navLink}>
                  Groups
                </Link>
              </li>
            </ul>

            {/* User Section */}
            <div className={styles.userSection}>
              {user ? (
                <>
                  <div className={styles.userInfo}>
                    <div className={styles.userName}>
                      {user.name || user.email.split('@')[0]}
                    </div>
                    <div className={styles.userStatus}>Member</div>
                  </div>
                  <button
                    onClick={onSignOut}
                    className={styles.actionButton}
                    title="Sign Out"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className={styles.userInfo}>
                  <div className={styles.userStatus}>Guest</div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className={styles.menuButton}
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span>{isMobileMenuOpen ? '✕' : '☰'}</span>
            </button>
          </nav>
        )}

        {/* Mobile Menu */}
        {showNavigation && (
          <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.open : ''}`}>
            <ul className={styles.mobileNavList}>
              <li>
                <Link
                  to="/dashboard"
                  className={styles.mobileNavLink}
                  onClick={closeMobileMenu}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/borrowed"
                  className={styles.mobileNavLink}
                  onClick={closeMobileMenu}
                >
                  Borrowed Items
                </Link>
              </li>
              <li>
                <Link
                  to="/lent"
                  className={styles.mobileNavLink}
                  onClick={closeMobileMenu}
                >
                  Lent Items
                </Link>
              </li>
              <li>
                <Link
                  to="/groups"
                  className={styles.mobileNavLink}
                  onClick={closeMobileMenu}
                >
                  Groups
                </Link>
              </li>
              {user && (
                <li>
                  <button
                    onClick={() => {
                      onSignOut?.();
                      closeMobileMenu();
                    }}
                    className={styles.mobileNavLink}
                    style={{ 
                      width: '100%', 
                      textAlign: 'left', 
                      background: 'none', 
                      border: 'none',
                      color: 'inherit',
                      font: 'inherit'
                    }}
                  >
                    Sign Out
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
