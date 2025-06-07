// src/components/ui/Checkbox.jsx
import React from 'react';

export function Checkbox({ className = '', ...props }) {
  return (
    <input
      type="checkbox"
      className={`h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  );
}
