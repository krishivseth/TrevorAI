import {format} from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface TooltipPayload {
    payload: {
        date: string;
        value: number;
    };
    value: number;
    name: string;
    color: string;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayload[];
}

export const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    const dataPoint = payload[0];
    const dateString = dataPoint.payload.date;
    const value = dataPoint.value;
    const dateFormatted = format(new Date(dateString + 'T00:00:00'), "MMM dd, yyyy");

    return (
        <div style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            overflow: 'hidden',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            fontSize: '12px',
            color: '#111827'
        }}> 
            <div style={{
                padding: '8px 12px',
                backgroundColor: '#f9fafb', 
                color: '#6b7280',
                fontWeight: 500
            }}> 
                {dateFormatted}
            </div>
            <div style={{ height: '1px', backgroundColor: '#e5e7eb' }} />
            <div style={{ padding: '8px 12px' }}>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    gap: '16px' 
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ 
                            width: '6px', 
                            height: '6px', 
                            borderRadius: '50%', 
                            backgroundColor: '#3b82f6' 
                        }} /> 
                        <p style={{ color: '#6b7280' }}>
                            Stock Value 
                        </p>
                    </div>
                    <p style={{ fontWeight: 500 }}>
                        {formatCurrency(value)}
                    </p>
                </div>
            </div>
        </div>
    );
};