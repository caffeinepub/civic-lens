import { useState, useEffect } from 'react';

const SESSION_KEY = 'civic_lens_password_verified';

export function usePasswordVerification() {
  const [isVerified, setIsVerified] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  });

  const markAsVerified = () => {
    sessionStorage.setItem(SESSION_KEY, 'true');
    setIsVerified(true);
  };

  const clearVerification = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsVerified(false);
  };

  // Listen for storage changes (e.g., from other tabs)
  useEffect(() => {
    const handleStorageChange = () => {
      setIsVerified(sessionStorage.getItem(SESSION_KEY) === 'true');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    isVerified,
    markAsVerified,
    clearVerification,
  };
}
