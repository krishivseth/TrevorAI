"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { cn, formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CountUp } from "@/components/count-up";
import { IconType } from "react-icons";
import { Sparklines, SparklinesLine, SparklinesCurve, SparklinesSpots } from 'react-sparklines';
import { VariantProps, cva } from "class-variance-authority";

// Box variant for the icon
const boxVariant = cva("rounded-md p-1.5 xs:p-2 md:p-3",{
    variants:{
        variant:{
            default: "bg-blue-500/10 text-blue-500",
            success: "bg-emerald-500/10 text-emerald-500",
            danger: "bg-rose-500/10 text-rose-500",
            warning: "bg-yellow-500/10 text-yellow-500",
        }
    },
    defaultVariants: {
        variant: "default",
    }
});

const iconVariant = cva("size-4 xs:size-5 md:size-6",{
    variants:{
        variant:{
            default: "text-blue-500",
            success: "text-emerald-500",
            danger: "text-rose-500",
            warning: "text-yellow-500",
        }
    },
    defaultVariants: {
        variant: "default",
    }
});

type BoxVariants = VariantProps<typeof boxVariant>;
type IconVariants = VariantProps<typeof iconVariant>;

interface EnhancedDataCardProps extends BoxVariants, IconVariants {
    icon: IconType;
    title: string;
    value: number;
    percentageChange: number; // Daily change in $
    monthlyChange?: number; // Monthly change in $
    yearlyChange?: number; // Yearly change in $
}

// Generate some random historical data for the sparkline - but with a strong upward trend at the end
const generateHistoricalData = (currentValue: number) => {
    const data = [];
    const days = 14;
    let value = currentValue * 0.8; // Start 20% lower than current
    
    for (let i = 0; i < days - 3; i++) {
        value *= (1 + (Math.random() - 0.45) * 0.02); // Small daily variation
        data.push(value);
    }
    
    // Add a more pronounced upward trend in the last few days
    for (let i = 0; i < 3; i++) {
        value *= (1 + (Math.random() * 0.03)); // Stronger upward trend
        data.push(value);
    }
    
    // Make sure the last value is exactly the current value
    data[data.length - 1] = currentValue;
    return data;
};

// Format large numbers to more compact format based on screen size
const formatNumberForMobile = (value: number, innerWidth: number): string => {
    if (innerWidth < 350) {
        // For very small screens
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    }
    return formatCurrency(value);
};

export const EnhancedDataCard = ({
    icon: Icon,
    title,
    value,
    variant,
    percentageChange,
    monthlyChange = value * 0.05, // Default 5% monthly growth
    yearlyChange = value * 0.18,  // Default 18% yearly growth
}: EnhancedDataCardProps) => {
    const sparklineData = useMemo(() => generateHistoricalData(value), [value]);
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
    
    const prefix = percentageChange > 0 ? "+" : "";
    const monthlyPrefix = monthlyChange > 0 ? "+" : "";
    const yearlyPrefix = yearlyChange > 0 ? "+" : "";
    
    // Determine if trend is positive or negative for styling
    const dailyTrendColor = percentageChange > 0 ? "text-emerald-500" : "text-rose-500";
    const monthlyTrendColor = monthlyChange > 0 ? "text-emerald-500" : "text-rose-500";
    const yearlyTrendColor = yearlyChange > 0 ? "text-emerald-500" : "text-rose-500";
    const sparklineColor = percentageChange > 0 ? "#10b981" : "#ef4444";
    
    const isVerySmallScreen = windowWidth > 0 && windowWidth < 350;
    const isSmallScreen = windowWidth >= 350 && windowWidth < 640;
    
    return (
        <Card className="border bg-card overflow-hidden shadow-sm h-full flex flex-col">
            <CardHeader className="px-3 xs:px-4 sm:px-6 py-2 xs:py-3 sm:py-4">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-sm xs:text-base sm:text-lg font-bold">{title}</CardTitle>
                    <div className={cn(boxVariant({variant}))}>
                        <Icon className={cn(iconVariant({variant}))}/>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-3 xs:px-4 sm:px-6 pb-3 xs:pb-4 sm:pb-6 flex-1 flex flex-col">
                <div className="mb-2 xs:mb-3 sm:mb-4">
                    {windowWidth > 0 ? (
                        <h1 className="font-bold text-xl xs:text-2xl sm:text-3xl mb-0.5 xs:mb-1">
                            {isVerySmallScreen ? 
                                formatNumberForMobile(value, windowWidth) : 
                                <CountUp 
                                    preserveValue 
                                    start={0} 
                                    end={value} 
                                    decimals={2} 
                                    decimalPlaces={2} 
                                    formattingFn={formatCurrency}
                                />
                            }
                        </h1>
                    ) : (
                        <h1 className="font-bold text-xl xs:text-2xl sm:text-3xl mb-0.5 xs:mb-1">
                            <CountUp 
                                preserveValue 
                                start={0} 
                                end={value} 
                                decimals={2} 
                                decimalPlaces={2} 
                                formattingFn={formatCurrency}
                            />
                        </h1>
                    )}
                    <p className={cn("text-[10px] xs:text-xs sm:text-sm font-medium", dailyTrendColor)}>
                        {prefix}{isVerySmallScreen ? 
                            formatNumberForMobile(Math.abs(percentageChange), windowWidth) : 
                            formatCurrency(Math.abs(percentageChange))
                        } Today
                    </p>
                </div>
                
                {/* Mini chart showing recent trend - with improved responsiveness */}
                <div className="w-full mb-3 xs:mb-4 sm:mb-6 flex-1" style={{ minHeight: isVerySmallScreen ? '50px' : '70px' }}>
                    <Sparklines 
                        data={sparklineData} 
                        width={300} 
                        height={isVerySmallScreen ? 50 : 70} 
                        margin={isVerySmallScreen ? 2 : 5}
                        svgWidth="100%"
                        svgHeight="100%"
                        preserveAspectRatio="none" 
                        min={Math.min(...sparklineData) * 0.95}
                        max={Math.max(...sparklineData) * 1.05}
                    >
                        <SparklinesLine 
                            color={sparklineColor} 
                            style={{ 
                                fillOpacity: 0.2, 
                                fill: sparklineColor,
                                strokeWidth: isVerySmallScreen ? 1 : 2
                            }} 
                        />
                        <SparklinesSpots 
                            size={isVerySmallScreen ? 1 : 2} 
                            style={{ fill: sparklineColor }} 
                        />
                    </Sparklines>
                </div>
                
                {/* Additional statistics with fixed width for labels */}
                <div className="mt-auto pt-1">
                    <div className="flex mb-1.5 xs:mb-2">
                        <div className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground">Monthly Change</div>
                        <div className={cn("text-[10px] xs:text-xs sm:text-sm font-medium ml-auto", monthlyTrendColor)}>
                            {monthlyPrefix}
                            {isVerySmallScreen ? 
                                formatNumberForMobile(Math.abs(monthlyChange), windowWidth) : 
                                formatCurrency(Math.abs(monthlyChange))
                            }
                        </div>
                    </div>
                    <div className="flex">
                        <div className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground">YTD Change</div>
                        <div className={cn("text-[10px] xs:text-xs sm:text-sm font-medium ml-auto", yearlyTrendColor)}>
                            {yearlyPrefix}
                            {isVerySmallScreen ? 
                                formatNumberForMobile(Math.abs(yearlyChange), windowWidth) : 
                                formatCurrency(Math.abs(yearlyChange))
                            }
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}; 