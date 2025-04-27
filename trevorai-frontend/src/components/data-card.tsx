import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";
import { IconType } from "react-icons";
import { Card, CardContent,CardDescription,CardHeader,CardTitle } from "@/components/ui/card";
import { CountUp } from "@/components/count-up";
import { Skeleton } from "@/components/ui/skeleton";

// Update box variant for investment portfolio style
const boxVariant = cva("rounded-md p-3",{
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

const iconVariant = cva("size-6",{
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

interface DataCardProps extends BoxVariants,IconVariants{
    icon: IconType;
    title:string;
    value?: number;
    dateRange?: string;
    percentageChange? : number; // Actually a daily $ change for investments
};

export const DataCard = ({
    icon: Icon,
    title,
    value= 0,
    variant,
    dateRange,
    percentageChange = 0,
}:DataCardProps) => {
    const prefix = percentageChange > 0 ? "+" : "";
    
    return (
        <Card className="border bg-card overflow-hidden shadow-sm">
            <div className="px-6 pt-6 pb-0">
                <CardTitle className="text-lg font-bold mb-1">
                    {title}
                </CardTitle>
                {dateRange && (
                    <CardDescription className="text-xs mb-3">
                        {dateRange}
                    </CardDescription>
                )}
            </div>
            <CardContent className="px-6 pt-3 pb-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="font-bold text-3xl mb-1">
                            <CountUp preserveValue start={0} end={value} decimals={2} decimalPlaces={2} formattingFn={formatCurrency}/>
                        </h1>
                        <p className={cn(
                            "text-sm", 
                            percentageChange > 0 && "text-emerald-500",
                            percentageChange < 0 && "text-rose-500",
                            percentageChange === 0 && "text-muted-foreground",
                        )}>
                            {prefix}{formatCurrency(Math.abs(percentageChange))} Today
                        </p>
                    </div>
                    <div className={cn(boxVariant({variant}))}>
                        <Icon className={cn(iconVariant({variant}))}/>
                    </div>
                </div>
            </CardContent>
        </Card>
      );
};

export const DataCardLoading = ()=> {
    return(
        <Card className="border-none drop-shadow-sm h-[192px]">
            <CardHeader className="flex flex-row items-center justify-between gap-x-4">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-24"/>
                    <Skeleton className="h-4 w-40"/>
                </div>
                <Skeleton className="size-12"/>
            </CardHeader>
            <CardContent>
            <Skeleton className="shrink-0 h-10 w-24 mb-2"/>
            <Skeleton className="shrink-0 h-4 w-40"/>
            </CardContent>
        </Card>
    )
}