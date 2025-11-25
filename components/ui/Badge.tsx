import React from 'react';

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'neutral' | 'error' }> = ({ children, variant = 'neutral' }) => {
  const styles = {
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200',
    error: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]}`}>
      {children}
    </span>
  );
};