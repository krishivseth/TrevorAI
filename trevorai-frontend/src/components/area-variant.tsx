"use client";

import React, { useState, useEffect } from 'react';
import { Tooltip, XAxis, AreaChart, Area, CartesianGrid, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { CustomTooltip } from "@/components/custom-tooltip";

type DataPoint = {
    date: string;
    value: number;
};

type Props = {
    data?: DataPoint[];
};

// Colors
const stockStrokeColor = "#3b82f6"; // Blue
const stockGradientColor = "#3b82f6";
const tickColor = "#6b7280"; // Gray-500
const gridColor = "#e5e7eb"; // Gray-200

export const AreaVariant = ({ data = [] }: Props) => {
    const [windowWidth, setWindowWidth] = useState<number>(0);
    
    // Set window width on client side only
    useEffect(() => {
        setWindowWidth(window.innerWidth);
        
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    // Responsive settings based on window width
    const isSmallScreen = windowWidth > 0 && windowWidth < 500;
    const isMediumScreen = windowWidth >= 500 && windowWidth < 768;
    
    // Select dates to show as ticks (first, one in middle, and last)
    const getTickValues = () => {
        if (data.length < 2) return [];
        
        const firstDate = data[0].date;
        const lastDate = data[data.length - 1].date;
        const middleDate = data[Math.floor(data.length / 2)].date;
        
        if (isSmallScreen) {
            return [firstDate, lastDate];
        }
        
        const quarterIndex = Math.floor(data.length / 4);
        const threeQuarterIndex = Math.floor(data.length * 3 / 4);
        
        if (isMediumScreen) {
            return [firstDate, middleDate, lastDate];
        }
        
        return [
            firstDate, 
            data[quarterIndex].date,
            middleDate,
            data[threeQuarterIndex].date,
            lastDate
        ];
    };
    
    // Format dates based on screen size
    const formatDateTick = (value: string) => {
        try {
            return format(new Date(value + 'T00:00:00'), isSmallScreen ? "d MMM" : "d MMM");
        } catch (e) {
            return value;
        }
    };
    
    return (
        <div className="w-full h-full bg-white">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                    data={data}
                    margin={{ 
                        top: 10, 
                        right: isSmallScreen ? 5 : 10, 
                        bottom: 20, 
                        left: isSmallScreen ? 5 : 10 
                    }}
                >
                    <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke={gridColor} 
                        horizontal={true}
                        vertical={false}
                    />
                    <defs>
                        <linearGradient id="stockValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={stockGradientColor} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={stockGradientColor} stopOpacity={0.05} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        axisLine={false}
                        tickLine={false}
                        dataKey="date"
                        ticks={getTickValues()}
                        tickFormatter={formatDateTick}
                        style={{ fontSize: isSmallScreen ? "10px" : "12px" }}
                        tickMargin={8}
                        tick={{ fill: tickColor }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="value"
                        strokeWidth={2}
                        stroke={stockStrokeColor}
                        fill="url(#stockValue)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};