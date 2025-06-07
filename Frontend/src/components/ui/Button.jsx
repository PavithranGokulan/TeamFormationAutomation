// src/components/ui/Button.jsx
import React from 'react';

export function Button({ children, className = '', ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded-md font-medium shadow-sm hover:opacity-90 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

