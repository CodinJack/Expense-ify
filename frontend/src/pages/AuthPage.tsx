import { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';

interface AuthPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (email: string, password: string, confirmPassword: string) => Promise<void>;
  isLoading?: boolean;
}

export const AuthPage = ({ onLogin, onSignup, isLoading }: AuthPageProps) => {
  const [isLoginMode, setIsLoginMode] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {isLoginMode ? (
          <LoginForm
            onLogin={onLogin}
            onSwitchToSignup={() => setIsLoginMode(false)}
            isLoading={isLoading}
          />
        ) : (
          <SignupForm
            onSignup={onSignup}
            onSwitchToLogin={() => setIsLoginMode(true)}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};
