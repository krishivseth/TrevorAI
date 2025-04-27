import React from 'react';
import { Header } from './Header';
import { SubHeader } from './SubHeader';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header />
      <SubHeader />
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
} 