"use client"; // Required for using hooks like usePathname and useRouter

import React from 'react';
import { usePathname, useRouter } from 'next/navigation'; // Import necessary hooks

export function Header() {
  const pathname = usePathname(); // Get the current URL path
  const router = useRouter();   // Get the router instance for navigation

  // Determine the target path and button text based on the current page
  let targetPath: string;
  let buttonText: string;

  if (pathname === '/transactions') {
    targetPath = '/portfolio';
    buttonText = 'View Portfolio';
  } else {
    // Default to navigating to transactions if not on the transactions page
    targetPath = '/transactions';
    buttonText = 'View Transactions';
  }

  // Handle button click
  const handleNavigate = () => {
    router.push(targetPath);
  };

  return (
    <header className="bg-gradient-to-b from-blue-700 to-blue-500 px-4 py-6 lg:px-14">
      <div className="max-w-screen-2xl mx-auto">
        {/* Top bar with controls */}
        <div className="w-full flex items-center justify-between mb-8">
          <div>
            <span className="text-white text-2xl font-bold">TrevorAI</span>
          </div>
          <div className="flex items-center space-x-4">
            {/* Account Selector */}
            <div className="flex items-center space-x-2">
              <label htmlFor="account-select" className="text-sm font-medium text-blue-100">Accounts:</label>
              <select id="account-select" className="bg-blue-700 border border-blue-500 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-white text-white">
                <option>All accounts</option>
                {/* Add other accounts later */}
              </select>
            </div>
            {/* Updated Button with Dynamic Text */}
            <button
              onClick={handleNavigate} // Use the navigation handler
              className="bg-white text-blue-700 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100"
            >
              {buttonText} {/* Display the dynamic button text */}
            </button>
          </div>
        </div>
        {/* Welcome message below */}
        <div className="text-white pb-16">
          <h2 className="text-2xl lg:text-4xl font-medium">Welcome Back 👋</h2>
          <p className="text-sm lg:text-base text-blue-200">This is your financial overview report.</p>
        </div>
      </div>
    </header>
  );
}