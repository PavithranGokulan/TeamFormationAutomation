import React from "react";

export function Select({ options, value, onChange, placeholder = "Select an option", className = "" }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`w-full bg-white border-2 border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
