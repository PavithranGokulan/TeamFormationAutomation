// src/components/ui/Card.jsx
import React from "react";

export const Card = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`bg-white rounded-lg shadow p-4 ${className}`}
      {...props} // ✅ This forwards onClick, style, id, etc.
    >
      {children}
    </div>
  );
};

export const CardContent = ({ children, className = "" }) => {
  return <div className={className}>{children}</div>; // also pass className
};
