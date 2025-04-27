"use client";

import React, { useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Generate dummy portfolio history data 
const generateDummyPortfolioHistory = () => {
    const data = [];
    const days = 30; 
    let value = 324018.50; // Start with current portfolio value
    const startValue = value * 0.95; // Start slightly lower

    for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // More stable progression than individual stocks
        if (i === days) {
            value = startValue; // Set starting value
        } else {
            value *= (1 + (Math.random() - 0.48) * 0.025); // Smaller daily variations
        }
        
        data.push({
            date: date.toISOString().split('T')[0],
            value: Math.round(value * 100) / 100,
        });
    }
    return data; 
};

// Dynamically import AreaVariant
const AreaVariant = dynamic(() => import('@/components/area-variant').then(mod => mod.AreaVariant), {
    ssr: false,
    loading: () => <p className="text-gray-500 text-center pt-5">Loading chart...</p>
});

export const PortfolioPerformanceGraph = () => {
    // Use useMemo to ensure data is generated only once and remains consistent
    const portfolioHistoryData = useMemo(() => generateDummyPortfolioHistory(), []);
    
    const initialValue = portfolioHistoryData[0].value;
    const currentValue = portfolioHistoryData[portfolioHistoryData.length - 1].value;
    const totalChange = currentValue - initialValue;
    const totalChangePercent = (totalChange / initialValue) * 100;

    return (
        <Card className="border shadow-sm bg-card h-full flex flex-col">
            <CardHeader className="px-4 sm:px-6 py-3 sm:py-4 pb-2">
                <div className="flex flex-col space-y-1">
                    <CardTitle className="text-base sm:text-lg font-bold">Portfolio Performance</CardTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground">Last 30 days</p>
                </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pt-0 pb-4 sm:pb-6 flex-1 flex flex-col">
                <div className="flex flex-col space-y-1 mb-2">
                    <div className="flex items-baseline space-x-1.5">
                        <h3 className="text-xs sm:text-sm text-muted-foreground">30-Day Change</h3>
                        <p className={`text-sm sm:text-base font-semibold ${totalChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {totalChange >= 0 ? '+' : ''}{formatCurrency(totalChange)} 
                            <span className="text-xs sm:text-sm ml-1">
                                ({totalChange >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}%)
                            </span>
                        </p>
                    </div>
                </div>
                <div className="w-full flex-1" style={{ minHeight: '200px' }}>
                    <AreaVariant data={portfolioHistoryData} />
                </div>
            </CardContent>
        </Card>
    );
}; 