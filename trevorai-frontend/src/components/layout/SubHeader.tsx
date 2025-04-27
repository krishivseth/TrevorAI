import React from 'react';

export function SubHeader() {
  return (
    <div className="bg-blue-600 text-white p-3 flex items-center space-x-4">
      {/* Placeholder for Account Selector */}
      <div className="flex items-center space-x-2">
        <label htmlFor="account-select" className="text-sm font-medium">Accounts:</label>
        <select id="account-select" className="bg-blue-700 border border-blue-500 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-white">
          <option>All accounts</option>
          {/* Add other accounts later */}
        </select>
      </div>

      {/* Placeholder for Date Range Picker */}
      <div className="flex items-center space-x-2">
         <label htmlFor="date-select" className="text-sm font-medium">Date:</label>
        <input type="text" id="date-select" value="Aug 30-Sep 29, 2024" readOnly className="bg-blue-700 border border-blue-500 rounded px-2 py-1 text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-white" />
         {/* Implement actual date picker later */}
      </div>
    </div>
  );
} 