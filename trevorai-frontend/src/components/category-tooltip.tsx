import {format} from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

// Type definitions for type safety
interface TooltipPayloadItem {
    payload: {
        name: string;
    };
    value: number;
}

interface CategoryTooltipProps {
    active?: boolean;
    payload?: TooltipPayloadItem[];
}

// Security: Sanitize string to prevent XSS and validate it's a safe string
const sanitizeString = (input: unknown, maxLength: number = 100): string => {
    if (typeof input !== 'string') {
        return '';
    }
    // Remove any potentially dangerous characters (keep alphanumeric, spaces, and common punctuation)
    const sanitized = input
        .slice(0, maxLength)
        .replace(/[<>]/g, '') // Remove HTML brackets
        .trim();
    return sanitized || 'Unknown';
};

// Security: Validate and sanitize numeric values
const sanitizeNumber = (input: unknown): number => {
    if (typeof input !== 'number') {
        return 0;
    }
    // Check for valid numbers (not NaN, Infinity, or too large)
    if (!Number.isFinite(input)) {
        return 0;
    }
    // Cap at reasonable maximum to prevent display issues
    const MAX_SAFE_VALUE = 1e15; // 1 quadrillion
    if (Math.abs(input) > MAX_SAFE_VALUE) {
        return 0;
    }
    return input;
};

export const CategoryTooltip = ({ active, payload }: CategoryTooltipProps) => {
    // Security: Early return if not active or payload is invalid
    if (!active || !payload || !Array.isArray(payload) || payload.length === 0) {
        return null;
    }

    // Security: Validate payload structure before accessing nested properties
    const firstPayload = payload[0];
    if (!firstPayload || typeof firstPayload !== 'object') {
        return null;
    }

    // Security: Safe extraction with validation
    const rawName = firstPayload?.payload?.name;
    const rawValue = firstPayload?.value;

    // Security: Sanitize inputs
    const name = sanitizeString(rawName);
    const value = sanitizeNumber(rawValue);

    // Security: Validate we have meaningful data before rendering
    if (!name || value === undefined) {
        return null;
    }

    // Security: Calculate expense value safely (ensure it's a number)
    const expenseValue = -Math.abs(value); // Ensure negative for expenses display

    return (
        <div className="rounded-sm bg-white shadow-sm border overflow-hidden">
            <div className="text-sm p-2 px-3 bg-muted text-muted-foreground">
                {name}
            </div>
            <Separator/>
            <div className="p-2 px-3 space-y-1">
                <div className="flex items-center justify-between gap-x-4">
                    <div className="flex items-center gap-x-2">
                        <div className="size-1.5 bg-rose-500 rounded-full"/>
                        <p className="text-sm text-muted-foreground">
                            Expenses
                        </p>
                    </div>
                    <p className="text-sm text-right font-medium">
                        {formatCurrency(expenseValue)}
                    </p>
                </div>
            </div>
        </div>
    );
} 