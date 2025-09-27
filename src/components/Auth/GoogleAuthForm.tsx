import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';
import styles from '@/styles/components/AuthForm.module.css';

const UnifiedAuthForm: React.FC = () => {
  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <div className={styles.authIcon}>📚</div>
          <h1 className={styles.authTitle}>Access Your Library Card</h1>
          <p className={styles.authSubtitle}>
            Sign in or create your account with Google
          </p>
        </div>

        <div className={styles.authForm}>
          <Auth
            supabaseClient={supabase}
            view="sign_in"
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#6D4C41',
                    brandAccent: '#8D6E63',
                    brandButtonText: 'white',
                    defaultButtonBackground: '#ffffff',
                    defaultButtonBackgroundHover: '#f8f9fa',
                    defaultButtonBorder: '#dadce0',
                    defaultButtonText: '#333333',
                    dividerBackground: '#e0e0e0',
                    inputBackground: '#ffffff',
                    inputBorder: '#8D6E63',
                    inputBorderHover: '#6D4C41',
                    inputBorderFocus: '#6D4C41',
                    inputText: '#333333',
                    inputLabelText: '#6D4C41',
                    inputPlaceholder: '#999999',
                    messageText: '#333333',
                    messageTextDanger: '#d32f2f',
                    anchorTextColor: '#6D4C41',
                    anchorTextHoverColor: '#5D4037',
                  },
                  space: {
                    spaceSmall: '4px',
                    spaceMedium: '8px',
                    spaceLarge: '16px',
                    labelBottomMargin: '8px',
                    anchorBottomMargin: '4px',
                    emailInputSpacing: '4px',
                    socialAuthSpacing: '4px',
                    buttonPadding: '10px 15px',
                    inputPadding: '10px 15px',
                  },
                  fontSizes: {
                    baseBodySize: '14px',
                    baseInputSize: '14px',
                    baseLabelSize: '14px',
                    baseButtonSize: '14px',
                  },
                  fonts: {
                    bodyFontFamily: `'Crimson Text', serif`,
                    buttonFontFamily: `'Open Sans', sans-serif`,
                    inputFontFamily: `'Open Sans', sans-serif`,
                    labelFontFamily: `'Open Sans', sans-serif`,
                  },
                  borderWidths: {
                    buttonBorderWidth: '2px',
                    inputBorderWidth: '2px',
                  },
                  radii: {
                    borderRadiusButton: '8px',
                    buttonBorderRadius: '8px',
                    inputBorderRadius: '8px',
                  },
                },
              },
              style: {
                button: {
                  fontWeight: '600',
                  textTransform: 'none',
                  letterSpacing: '0.025em',
                  transition: 'all 0.2s ease',
                },
                anchor: {
                  fontWeight: '500',
                  textDecoration: 'none',
                },
                message: {
                  fontFamily: `'Open Sans', sans-serif`,
                  fontSize: '14px',
                },
                label: {
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em',
                  fontSize: '12px',
                },
                input: {
                  fontFamily: `'Open Sans', sans-serif`,
                },
              },
            }}
            providers={['google']}
            onlyThirdPartyProviders={true}
            redirectTo={`${window.location.origin}/dashboard`}
            showLinks={false}
            localization={{
              variables: {
                sign_in: {
                  social_provider_text: 'Continue with {{provider}}',
                },
                sign_up: {
                  social_provider_text: 'Continue with {{provider}}',
                },
              },
            }}
          />
        </div>

        <div className={styles.authFooter}>
          <p className={styles.authFooterText}>
            Secure authentication powered by Google
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnifiedAuthForm;
