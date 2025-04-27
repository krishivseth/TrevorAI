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
    // Critical: -mt-24 pulls content up into the header's bottom padding
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
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
            <div style={{ display: 'table', width: '100%', tableLayout: 'fixed' }}>
                <div style={{ display: 'table-row' }}>
                    {/* Left: Treemap */}
                    <div style={{ display: 'table-cell', width: '60%', verticalAlign: 'top' }} className="pr-4">
                        <h3 className="text-lg font-semibold mb-4">Holdings Overview</h3>
                        <div className="h-[400px]">
                            <StockTreemap onStockClick={handleStockSelect} />
                        </div>
                    </div>
                    
                    {/* Right: Stock Details */}
                    <div style={{ display: 'table-cell', width: '40%', verticalAlign: 'top' }} className="pl-4">
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
    </div>
  );
}