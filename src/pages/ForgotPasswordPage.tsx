import React from 'react';
import { useNavigate } from 'react-router-dom';
import ForgotPasswordForm from '@/components/Auth/ForgotPasswordForm';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Success is handled within the ForgotPasswordForm component
    // The form will show a success message and provide navigation options
  };

  const handleError = (errorMessage: string) => {
    console.error('Password reset error:', errorMessage);
    // Error handling is managed by the ForgotPasswordForm component
  };

  return (
    <ForgotPasswordForm 
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
};

export default ForgotPasswordPage;
