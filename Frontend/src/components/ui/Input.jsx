import React from 'react';
export function Input({ className = '', ...props }) {
  return (
    <input
      className={`border border-gray-300 px-3 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-400 ${className}`}
      {...props}
    />
  );
}
