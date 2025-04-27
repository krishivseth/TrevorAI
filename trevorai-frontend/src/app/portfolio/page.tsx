"use client"; 

import React, { useState } from 'react'; 
import { DataCard } from "@/components/data-card";
import { FaPiggyBank } from "react-icons/fa";
import { StockTreemap } from '@/components/stock-treemap'; 
import { StockDetailGraph } from '@/components/stock-detail-graph'; 

interface StockData {
  name: string;
  value: number;
  change: number;
}

// Dummy data for demonstration
const dummyNetWorthValue = 324018.50;
const dummyDailyVariationValue = 550.75;

export default function PortfolioPage() {
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);

  const handleStockSelect = (stock: StockData) => {
    setSelectedStock(stock);
  };

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 pt-6">
        {/* Net Worth Card Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <DataCard
                title="Net Worth"
                value={dummyNetWorthValue}
                percentageChange={dummyDailyVariationValue}
                icon={FaPiggyBank}
                variant="default"
            />
        </div>

        {/* Charts Section - White background container with shadow */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left: Treemap */}
                <div className="lg:col-span-3">
                    <h3 className="text-lg font-semibold mb-4">Holdings Overview</h3>
                    <div className="h-[400px]">
                        <StockTreemap onStockClick={handleStockSelect} />
                    </div>
                </div>
                
                {/* Right: Stock Details */}
                <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Stock Performance</h3>
                    <div className="h-[400px]">
                        {selectedStock ? (
                            <StockDetailGraph stock={selectedStock} />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400">
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