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

// Vorifi-style colors
const stockStrokeColor = "#3b82f6"; // Blue
const stockGradientColor = "#3b82f6";
const tickColor = "#6b7280"; // Gray-500
const gridColor = "#e5e7eb"; // Gray-200

export const AreaVariant = ({ data = [] }: Props) => {
    return (
        <div style={{ width: '100%', height: '100%', backgroundColor: 'white' }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                    data={data}
                    margin={{ top: 10, right: 10, bottom: 20, left: 10 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
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
                        tickFormatter={(value) => format(new Date(value + 'T00:00:00'), "dd MMM")}
                        style={{ fontSize: "10px" }}
                        tickMargin={10}
                        tick={{ fill: tickColor }}
                        interval={'preserveStartEnd'}
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