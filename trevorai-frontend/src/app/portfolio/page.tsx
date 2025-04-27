"use client"; 

import React, { useState } from 'react'; 
import { FaPiggyBank } from "react-icons/fa";
import { StockTreemap } from '@/components/stock-treemap'; 
import { StockDetailGraph } from '@/components/stock-detail-graph'; 
import { PortfolioPerformanceGraph } from '@/components/portfolio-performance-graph';
import { EnhancedDataCard } from '@/components/enhanced-data-card';

interface StockData {
  name: string;
  value: number;
  change: number;
}

// Dummy data for demonstration
const dummyNetWorthValue = 324018.50;
const dummyDailyVariationValue = 550.75;
const dummyMonthlyChange = 24389.23;
const dummyYearlyChange = 58323.33;

export default function PortfolioPage() {
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);

  const handleStockClick = (stock: StockData) => {
    // Simply set the selected stock - this won't affect portfolio performance graph
    setSelectedStock(stock);
  };

  return (
    <div className="w-full mx-auto pb-6 sm:pb-10 pt-4 sm:pt-6">
        {/* Net Worth and Portfolio Performance Cards - Always showing total portfolio performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6 lg:mb-8">
            <div className="lg:col-span-1 min-h-[250px] sm:min-h-[280px]">
                <EnhancedDataCard
                    title="Net Worth"
                    value={dummyNetWorthValue}
                    percentageChange={dummyDailyVariationValue}
                    monthlyChange={dummyMonthlyChange}
                    yearlyChange={dummyYearlyChange}
                    icon={FaPiggyBank}
                    variant="default"
                />
            </div>
            <div className="lg:col-span-2 min-h-[250px] sm:min-h-[280px]">
                <PortfolioPerformanceGraph />
            </div>
        </div>

        {/* Charts Section - White background container with shadow */}
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
                {/* Left: Treemap */}
                <div className="lg:col-span-3">
                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Holdings Overview</h3>
                    <div className="h-[300px] sm:h-[400px]">
                        <StockTreemap onStockClick={handleStockClick} />
                    </div>
                </div>
                
                {/* Right: Stock Details */}
                <div className="lg:col-span-2">
                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Stock Performance</h3>
                    <div className="h-[300px] sm:h-[400px] bg-white rounded-sm border border-gray-100">
                        {selectedStock ? (
                            <StockDetailGraph stock={selectedStock} />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm sm:text-base">
                                Click a stock in the treemap to see details.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}