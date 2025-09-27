import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authHelpers } from '@/lib/supabase';
import styles from '@/styles/components/AuthForm.module.css';

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSuccess, onError }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    
    // Clear error when user starts typing
    if (errors.email) {
      setErrors(prev => ({
        ...prev,
        email: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const { error } = await authHelpers.resetPassword(email);
      
      if (error) {
        const errorMessage = error.message || 'Failed to send reset email. Please try again.';
        setErrors({ submit: errorMessage });
        onError?.(errorMessage);
      } else {
        setSubmitted(true);
        onSuccess?.();
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setErrors({ submit: errorMessage });
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <div className={styles.authIcon}>📧</div>
            <h1 className={styles.authTitle}>Check Your Email</h1>
            <p className={styles.authSubtitle}>Password reset instructions sent</p>
          </div>

          <div className={styles.authForm}>
            <div className={styles.successMessage}>
              We've sent password reset instructions to <strong>{email}</strong>.
              Please check your email and follow the link to reset your password.
            </div>

            <div className={styles.formActions}>
              <Link to="/login" className={styles.submitButton} style={{ textDecoration: 'none' }}>
                Back to Sign In
              </Link>
            </div>
          </div>

          <div className={styles.authFooter}>
            <p className={styles.authFooterText}>
              Didn't receive the email?{' '}
              <button 
                onClick={() => setSubmitted(false)}
                className={styles.authLink}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Try again
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <div className={styles.authIcon}>🔑</div>
          <h1 className={styles.authTitle}>Reset Password</h1>
          <p className={styles.authSubtitle}>Enter your email to receive reset instructions</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          {errors.submit && (
            <div className={styles.errorMessage}>
              {errors.submit}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleInputChange}
              className={`${styles.formInput} ${errors.email ? styles.inputError : ''}`}
              placeholder="Enter your email"
              disabled={loading}
              autoComplete="email"
            />
            {errors.email && (
              <span className={styles.fieldError}>{errors.email}</span>
            )}
          </div>

          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? (
                <span className={styles.loadingSpinner}>
                  <span className={styles.spinner}></span>
                  Sending Instructions...
                </span>
              ) : (
                'Send Reset Instructions'
              )}
            </button>
          </div>

          <div className={styles.authLinks}>
            <Link to="/login" className={styles.authLink}>
              Back to Sign In
            </Link>
          </div>
        </form>

        <div className={styles.authFooter}>
          <p className={styles.authFooterText}>
            Remember your password?{' '}
            <Link to="/login" className={styles.authLink}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
