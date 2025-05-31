
import { useState, useEffect } from 'react';

interface User {
  email: string;
  token: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('expense-ify-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('expense-ify-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // TODO: Replace with your actual API endpoint
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const userData = await response.json();
    const userWithToken = {
      email: userData.email,
      token: userData.token,
    };

    setUser(userWithToken);
    localStorage.setItem('expense-ify-user', JSON.stringify(userWithToken));
  };

  const signup = async (email: string, password: string, confirmPassword: string) => {
    // TODO: Replace with your actual API endpoint
    const response = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, confirmPassword }),
    });

    if (!response.ok) {
      throw new Error('Signup failed');
    }

    const userData = await response.json();
    const userWithToken = {
      email: userData.email,
      token: userData.token,
    };

    setUser(userWithToken);
    localStorage.setItem('expense-ify-user', JSON.stringify(userWithToken));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('expense-ify-user');
  };

  return {
    user,
    isLoading,
    login,
    signup,
    logout,
  };
};
