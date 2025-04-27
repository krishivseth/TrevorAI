"use client";

import { useEffect, useMemo, useState } from 'react';
import { useUser } from '@/lib/user-context';
import { DataCard } from "@/components/data-card";
import { FaPiggyBank } from "react-icons/fa";
import { StockTreemap } from '@/components/stock-treemap';
import { StockDetailGraph } from '@/components/stock-detail-graph';
import { getStockQuote } from '@/lib/finnhub';

interface UserPortfolio {
  userid: string;
  user_name: string;
  bank_bal: number;
  portfolio: Record<string, number>;
}

interface StockData {
  name: string;
  value: number;
  change: number;
}

export default function PortfolioPage() {
  const { selectedUser } = useUser();
  const [userData, setUserData] = useState<UserPortfolio | null>(null);
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPortfolioData = async () => {
    setLoading(true);
    const res = await fetch(`http://127.0.0.1:8080/api/portfolio/${selectedUser.userid}`);
    const data = await res.json();
    setUserData(data);
    setLoading(false);
  };

  const fetchStockPrices = async (symbols: string[]) => {
    const prices: Record<string, number> = {};
    await Promise.all(
      symbols.map(async (symbol) => {
        const price = await getStockQuote(symbol);
        if (price !== null) {
          prices[symbol] = price;
        }
      })
    );
    return prices;
  };

  const refreshStockData = async () => {
    if (!userData) return;

    const symbols = Object.keys(userData.portfolio);

    const prices = await fetchStockPrices(symbols);

    const updatedStocks = symbols.map((symbol) => {
      const shares = userData.portfolio[symbol] ?? 0;
      const newPrice = prices[symbol] ?? 0;

      // 🛠 Assume previous price is $100 for now
      const previousPrice = 100;
      const changePercent = previousPrice > 0 ? ((newPrice - previousPrice) / previousPrice) * 100 : 0;

      return {
        name: symbol,
        value: shares * newPrice,
        change: changePercent,
      };
    });

    setStocks(updatedStocks);
  };

  useEffect(() => {
    fetchPortfolioData();
  }, [selectedUser]);

  useEffect(() => {
    if (!userData) return;

    refreshStockData();
    const interval = setInterval(refreshStockData, 30000);
    return () => clearInterval(interval);
  }, [userData]);

  const handleStockSelect = (stock: StockData) => {
    setSelectedStock(stock);
  };

  const netWorth = useMemo(() => {
    if (!userData) return 0;
    return userData.bank_bal + stocks.reduce((acc, stock) => acc + stock.value, 0);
  }, [userData, stocks]);

  const dummyDailyVariationValue = (Math.random() - 0.5) * 1000; // ❗ you can also link this to real portfolio variation later

  if (loading || !userData) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)] text-gray-400">
        Loading Portfolio...
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 pt-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <DataCard
          title="Net Worth"
          value={netWorth}
          percentageChange={dummyDailyVariationValue}
          icon={FaPiggyBank}
          variant="default"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <h3 className="text-lg font-semibold mb-4">Holdings Overview</h3>
            <div className="h-[400px]">
              <StockTreemap onStockClick={handleStockSelect} data={stocks} />
            </div>
          </div>

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
