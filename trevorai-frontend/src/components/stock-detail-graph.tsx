"use client";

import React, { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import dynamic from 'next/dynamic'; 
// import { getStockHistoryAlphaVantage } from '@/lib/alphavantage'; // ✅ instead of finnhub


interface StockData {
  name: string;
  value: number;
  change: number;
}

interface StockDetailGraphProps {
  stock: StockData;
}

// Dynamically import AreaVariant
const AreaVariant = dynamic(() => import('@/components/area-variant').then(mod => mod.AreaVariant), {
  ssr: false,
  loading: () => <p style={{ color: '#6b7280', textAlign: 'center', paddingTop: '20px' }}>Loading chart...</p>
});

export const StockDetailGraph = ({ stock }: StockDetailGraphProps) => {
  const [historyData, setHistoryData] = useState<{date: string, value: number}[]>([]);
  
  useEffect(() => {
    async function fetchStockHistory() {
      const { getStockHistoryAlphaVantage } = await import('@/lib/alphavantage');
      const data = await getStockHistoryAlphaVantage(stock.name);
      setHistoryData(data);
    }
    fetchStockHistory();
  }, [stock.name]);
  

  if (historyData.length === 0) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">Loading stock history...</div>;
  }

  const initialValue = historyData[0].value;
  const currentValue = historyData[historyData.length - 1].value;
  const totalChange = currentValue - initialValue;
  const totalChangePercent = (totalChange / initialValue) * 100;

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: 'white',
      color: '#111827',
      padding: '16px'
    }}>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>{stock.name}</h3>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Current Value: {formatCurrency(stock.value)}</p>
        <p style={{ 
          color: stock.change > 0 ? '#10b981' : '#ef4444', 
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          {stock.change > 0 ? '+' : ''}{stock.change}% Today
        </p>
      </div>
      
      <div style={{ flex: 1, minHeight: '240px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}>
          <AreaVariant data={historyData} />
        </div>
      </div>
      
      <div style={{ 
        marginTop: '12px', 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '12px',
        borderTop: '1px solid #e5e7eb',
        paddingTop: '12px'
      }}>
        <div>
          <p style={{ color: '#6b7280', fontSize: '12px' }}>30-Day Change</p>
          <p style={{ 
            color: totalChange > 0 ? '#10b981' : '#ef4444',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            {totalChange > 0 ? '+' : ''}{formatCurrency(totalChange)}
          </p>
        </div>
        <div>
          <p style={{ color: '#6b7280', fontSize: '12px' }}>Percent Change</p>
          <p style={{ 
            color: totalChangePercent > 0 ? '#10b981' : '#ef4444',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            {totalChangePercent > 0 ? '+' : ''}{totalChangePercent.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
};
