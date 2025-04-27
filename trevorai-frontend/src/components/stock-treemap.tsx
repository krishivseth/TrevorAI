"use client"; 

import React from 'react';
import { ResponsiveTreeMap } from '@nivo/treemap'; 
import { formatCurrency } from '@/lib/utils'; 

// Keep existing dummy data and treemapData structure
const dummyStockData = [
    // ... (same dummy data as before) ...
    { name: 'AAPL', value: 15000, change: 1.15 },   
    { name: 'GOOGL', value: 12000, change: -1.15 }, 
    { name: 'AMZN', value: 18000, change: 3.46 },   
    { name: 'TSLA', value: 8000, change: 0.01 },    
    { name: 'MSFT', value: 22000, change: 1.14 },   
    { name: 'PYPL', value: 5000, change: 1.91 },    
    { name: 'NVDA', value: 16000, change: -0.5 },  
    { name: 'SPY', value: 30000, change: 0.8 },    
    { name: 'META', value: 9000, change: -2.1 },   
];
const treemapData = { name: "Portfolio", children: dummyStockData };

// Keep existing getColor function
const getColor = (node: any) => { // Use TreeMapNodeProps for better typing if needed
    const stockData = node.data; 
    if (stockData.change > 0) { return 'hsl(142.1 76.2% 36.3%)'; } 
    else if (stockData.change < 0) { return 'hsl(346.8 77.2% 49.8%)'; } 
    else { return 'hsl(215.4 16.3% 46.9%)'; }
};

// Keep existing CustomTooltip function
const CustomTooltip = ({ node }: any) => ( // Use TreeMapNodeProps for better typing if needed
    <div style={{ background: 'white', padding: '9px 12px', border: '1px solid #ccc', borderRadius: '3px', fontSize: '12px', boxShadow: '0 3px 5px rgba(0, 0, 0, 0.1)' }}>
        <strong>{node.id}</strong>: {formatCurrency(node.value)} ({node.data.change > 0 ? '+' : ''}{node.data.change}%)
    </div>
);

// Define props for the StockTreemap component, including the click handler
interface StockTreemapProps {
    // Define the function signature for the prop
    onStockClick: (stockData: any) => void; // Use a more specific type if available
}

// Accept onStockClick prop
export const StockTreemap = ({ onStockClick }: StockTreemapProps) => (
    <ResponsiveTreeMap
        data={treemapData}
        identity="name" 
        value="value"    
        valueFormat={(value) => formatCurrency(value)} 
        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        label={node => `${node.id} (${node.formattedValue})`} 
        labelSkipSize={24} 
        labelTextColor={{ from: 'color', modifiers: [['darker', 1.5]] }}
        colors={getColor} 
        nodeOpacity={0.9}
        borderWidth={1}
        borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
        parentLabelTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
        tooltip={CustomTooltip} 
        isInteractive={true}
        onClick={(node, event) => {
            onStockClick(node.data); 
        }}
    />
);