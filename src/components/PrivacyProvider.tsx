'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface PrivacyContextType {
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
  formatCurrency: (amount: number, customMask?: string) => string;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export const PrivacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem('frugalify_privacy_mode');
    if (saved === 'true') {
      setIsPrivacyMode(true);
    }
  }, []);

  const togglePrivacyMode = () => {
    setIsPrivacyMode(prev => {
      const next = !prev;
      localStorage.setItem('frugalify_privacy_mode', String(next));
      return next;
    });
  };

  const formatCurrency = (amount: number, customMask = 'Rp •••••••') => {
    if (isPrivacyMode) {
      return customMask;
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <PrivacyContext.Provider value={{ isPrivacyMode, togglePrivacyMode, formatCurrency }}>
      {children}
    </PrivacyContext.Provider>
  );
};

export const usePrivacy = () => {
  const context = useContext(PrivacyContext);
  if (!context) {
    // Return fallback for components rendered outside provider
    return {
      isPrivacyMode: false,
      togglePrivacyMode: () => {},
      formatCurrency: (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
    };
  }
  return context;
};
