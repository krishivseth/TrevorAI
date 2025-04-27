"use client";

import React from 'react';
import { ResponsiveTreeMap } from '@nivo/treemap'; 
import { formatCurrency } from '@/lib/utils'; 

const getColor = (node: any) => {
    const stockData = node.data; 
    if (stockData.change > 0) {
        return 'hsl(142.1 76.2% 36.3%)'; 
    } else if (stockData.change < 0) {
        return 'hsl(346.8 77.2% 49.8%)'; 
    } else {
        return 'hsl(215.4 16.3% 46.9%)';
    }
};

const CustomTooltip = ({ node }: any) => (
    <div style={{ background: 'white', padding: '9px 12px', border: '1px solid #ccc', borderRadius: '3px', fontSize: '12px', boxShadow: '0 3px 5px rgba(0, 0, 0, 0.1)' }}>
        <strong>{node.id}</strong>: {formatCurrency(node.value)} ({node.data.change > 0 ? '+' : ''}{node.data.change}%)
    </div>
);

interface StockTreemapProps {
    onStockClick: (stockData: any) => void;
    data: { name: string; value: number; change: number }[];
}

export const StockTreemap = ({ onStockClick, data }: StockTreemapProps) => (
    <ResponsiveTreeMap
        data={{ name: "Portfolio", children: data }} // <-- FIXED: now comes from props
        identity="name"
        value="value"
        valueFormat={(value) => formatCurrency(value)}
        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        label={(node) => `${node.id} (${node.formattedValue})`}
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
