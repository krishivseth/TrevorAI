"use client";

import React, { useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

interface StockData {
  name: string;
  value: number;
  change: number;
}

interface StockDetailGraphProps {
    stock: StockData;
}

// Generate dummy stock history data
const generateDummyStockHistory = (currentValue: number) => {
    const data = [];
    const days = 30; 
    let value = currentValue * (Math.random() * 0.2 + 0.9); 

    for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        value *= (1 + (Math.random() - 0.48) * 0.05); 
        data.push({
            date: date.toISOString().split('T')[0],
            value: Math.max(0, value), 
        });
    }
    return data; 
};

// Dynamically import AreaVariant
const AreaVariant = dynamic(() => import('@/components/area-variant').then(mod => mod.AreaVariant), {
    ssr: false,
    loading: () => <p className="text-gray-500 text-center pt-5">Loading chart...</p>
});

export const StockDetailGraph = ({ stock }: StockDetailGraphProps) => {
    // Use useMemo to ensure data is generated only once and remains consistent
    const stockHistoryData = useMemo(() => generateDummyStockHistory(stock.value), [stock.value]);
    
    const initialValue = stockHistoryData[0].value;
    const currentValue = stockHistoryData[stockHistoryData.length - 1].value;
    const totalChange = currentValue - initialValue;
    const totalChangePercent = (totalChange / initialValue) * 100;

    // Determine color classes based on stock performance
    const dailyChangeColor = stock.change > 0 ? "text-emerald-600" : "text-rose-600";
    const thirtyDayChangeColor = totalChange > 0 ? "text-emerald-600" : "text-rose-600";
    const percentChangeColor = totalChangePercent > 0 ? "text-emerald-600" : "text-rose-600";
    
    return (
        <div className="w-full h-full flex flex-col bg-white text-gray-900">
            {/* Header section */}
            <div className="p-4 pb-2">
                <h3 className="text-lg font-bold mb-1">{stock.name}</h3>
                <p className="text-sm text-gray-600">
                    Current Value: {formatCurrency(stock.value)}
                </p>
                <p className={cn("text-sm font-medium", dailyChangeColor)}>
                    {stock.change > 0 ? '+' : ''}{stock.change}% Today
                </p>
            </div>
            
            {/* Chart section */}
            <div className="flex-1 p-1">
                <AreaVariant data={stockHistoryData} />
            </div>
            
            {/* Bottom metrics section - simplified */}
            <div className="border-t border-gray-200 p-3">
                <div className="flex justify-between">
                    <div>
                        <div className="text-gray-500 text-xs">30-Day Change</div>
                        <div className={cn("text-sm font-medium", thirtyDayChangeColor)}>
                            {totalChange >= 0 ? '+' : ''}{formatCurrency(Math.abs(totalChange))}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-gray-500 text-xs">Percent Change</div>
                        <div className={cn("text-sm font-medium", percentChangeColor)}>
                            {totalChangePercent >= 0 ? '+' : ''}{Math.abs(totalChangePercent).toFixed(2)}%
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};