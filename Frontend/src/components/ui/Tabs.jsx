// src/components/ui/Tabs.jsx
import React, { useState } from 'react';

export function Tabs({ tabs }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <div className="flex space-x-4 border-b mb-4">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`pb-2 ${
              activeTab === index
                ? 'border-b-2 border-blue-600 font-semibold'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
}
