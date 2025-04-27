"use client";

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface Transaction {
  id: string;
  stock_symbol: string;
  stock_name: string;
  type: 'buy' | 'sell';
  shares: number;
  price_per_share: number;
  date: string; // API will return as string
  initiator: 'user' | 'agent';
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  useEffect(() => {
    async function fetchTransactions() {
      const res = await fetch("http://127.0.0.1:8080/api/transactions/CX734"); // <-- Use appropriate user id
      const data = await res.json();
      setTransactions(data);
    }
    fetchTransactions();
  }, []);

  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const monthYear = format(new Date(transaction.date), 'MMMM yyyy');
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const sortedMonthKeys = Object.keys(groupedTransactions).sort((monthA, monthB) => {
    const [monthStrA, yearStrA] = monthA.split(' ');
    const [monthStrB, yearStrB] = monthB.split(' ');
    const monthIndexA = new Date(`${monthStrA} 1, ${yearStrA}`).getMonth();
    const monthIndexB = new Date(`${monthStrB} 1, ${yearStrB}`).getMonth();
    const yearA = parseInt(yearStrA);
    const yearB = parseInt(yearStrB);
    return new Date(yearB, monthIndexB).getTime() - new Date(yearA, monthIndexA).getTime();
  });

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 pt-6">
      <h1 className="text-2xl font-semibold mb-6">Transaction History</h1>
      
      <div className="bg-card rounded-lg shadow-sm border">
        {sortedMonthKeys.map((monthYear) => (
          <div key={monthYear}>
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
                        {tx.type === 'buy' ? 'Bought' : 'Sold'} {tx.stock_symbol}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {tx.shares} shares {tx.initiator === 'agent' && '(by Agent)'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${tx.type === 'buy' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {tx.type === 'buy' ? '+' : '-'}${(tx.shares * tx.price_per_share).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(tx.date), 'MMM dd, yyyy')}
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
