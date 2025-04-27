"use client";

import React from 'react';
import { format } from 'date-fns'; // For date formatting
import { ArrowDownLeft, ArrowUpRight, Bot } from 'lucide-react'; // Icons

// Define the structure for a transaction
interface Transaction {
  id: string;
  stockSymbol: string;
  stockName: string; // e.g., Apple Inc.
  type: 'buy' | 'sell';
  amountUSD: number; // Amount in USD
  shares: number; // Number of shares involved
  date: Date;
  initiator: 'user' | 'agent';
}

// Dummy data for demonstration
const dummyTransactions: Transaction[] = [
  {
    id: '1',
    stockSymbol: 'AAPL',
    stockName: 'Apple Inc.',
    type: 'buy',
    amountUSD: 5000.00,
    shares: 25.5,
    date: new Date(2024, 10, 25), // Nov 25, 2024
    initiator: 'agent',
  },
  {
    id: '2',
    stockSymbol: 'GOOGL',
    stockName: 'Alphabet Inc.',
    type: 'sell',
    amountUSD: 3250.75,
    shares: 10.2,
    date: new Date(2024, 10, 19), // Nov 19, 2024
    initiator: 'user',
  },
  {
    id: '3',
    stockSymbol: 'MSFT',
    stockName: 'Microsoft Corp.',
    type: 'buy',
    amountUSD: 7800.00,
    shares: 15.0,
    date: new Date(2024, 8, 14), // Sep 14, 2024
    initiator: 'agent',
  },
  {
    id: '4',
    stockSymbol: 'TSLA',
    stockName: 'Tesla, Inc.',
    type: 'sell',
    amountUSD: 4100.20,
    shares: 20.1,
    date: new Date(2024, 8, 1), // Sep 1, 2024
    initiator: 'user',
  },
];

export default function TransactionsPage() {
  // Group transactions by month (optional but good for display)
  const groupedTransactions = dummyTransactions.reduce((acc, transaction) => {
    const monthYear = format(transaction.date, 'MMMM yyyy');
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  // Get sorted month keys
  const sortedMonthKeys = Object.keys(groupedTransactions).sort((monthA, monthB) => {
    const [monthStrA, yearStrA] = monthA.split(' ');
    const [monthStrB, yearStrB] = monthB.split(' ');
    const monthIndexA = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].indexOf(monthStrA);
    const monthIndexB = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].indexOf(monthStrB);
    const dateA = new Date(parseInt(yearStrA), monthIndexA);
    const dateB = new Date(parseInt(yearStrB), monthIndexB);
    return dateB.getTime() - dateA.getTime(); // Sort descending
  });

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <h1 className="text-2xl font-semibold mb-6">Transaction History</h1>
      
      {/* TODO: Add Filters and Search Bar here later */}
      <div className="mb-4 flex space-x-2"><!-- Placeholder for filters --></div>

      <div className="bg-card rounded-lg shadow-sm border"><!-- Removed padding here to allow full-width dividers */}
        {sortedMonthKeys.map((monthYear) => (
          <div key={monthYear} className="">
            <h2 className="text-lg font-medium p-4 text-muted-foreground">{monthYear}</h2>
            <ul className="divide-y divide-border">
              {groupedTransactions[monthYear].map((tx) => (
                <li key={tx.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${tx.type === 'buy' ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-rose-100 dark:bg-rose-900'}`}>
                      {tx.type === 'buy' ? 
                        <ArrowUpRight className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> : 
                        <ArrowDownLeft className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                      }
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">
                        {tx.type === 'buy' ? 'Bought' : 'Sold'} {tx.stockSymbol}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {tx.shares} shares {tx.initiator === 'agent' ? '(by Agent)' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${tx.type === 'buy' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {tx.type === 'buy' ? '+' : '-'}${tx.amountUSD.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(tx.date, 'MMM dd, yyyy')}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
} 