import React from 'react';

export function Sidebar() {
  return (
    <aside className="w-64 p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md flex-shrink-0 h-screen">
      <h2 className="text-xl font-semibold mb-4">TrevorAI</h2>
      <nav>
        <ul>
          {/* Navigation links will go here */}
          <li className="mb-2"><a href="/portfolio" className="hover:text-blue-500">Portfolio</a></li>
          <li className="mb-2"><a href="/transactions" className="hover:text-blue-500">Transactions</a></li>
          {/* Add more links as needed */}
        </ul>
      </nav>
    </aside>
  );
} 