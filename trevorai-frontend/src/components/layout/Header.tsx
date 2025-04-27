import React from 'react';

export function Header() {
  return (
    <header className="bg-gradient-to-b from-blue-700 to-blue-500 px-4 py-6 lg:px-14">
      <div className="max-w-screen-2xl mx-auto">
        {/* Top bar with logo */}
        <div className="w-full flex items-center justify-between mb-8">
          <div>
            <span className="text-white text-2xl font-bold">TrevorAI</span>
          </div>
          {/* Right side intentionally left empty for clean design */}
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