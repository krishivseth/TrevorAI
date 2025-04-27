export async function getStockHistoryAlphaVantage(symbol: string): Promise<{ date: string, value: number }[]> {
    const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${symbol}&apikey=${apiKey}`;
  
    console.log("Fetching Alpha Vantage:", url);
  
    try {
      const res = await fetch(url);
      const data = await res.json();
  
      if (data["Note"]) {
        console.error("Alpha Vantage Rate Limit Hit:", data["Note"]);
        return [];
      }
  
      if (data["Error Message"] || !data["Monthly Time Series"]) {
        console.error("Alpha Vantage error:", data);
        return [];
      }
  
      const timeSeries = data["Monthly Time Series"];
      const entries = Object.entries(timeSeries)
        .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime()); // sort ascending
  
      const candles = entries.map(([date, values]) => ({
        date, // Already YYYY-MM-DD
        value: parseFloat((values as any)["4. close"]), // Monthly closing price
      }));
  
      // You can decide how many months you want
      const recentCandles = candles.slice(-12); // Last 12 months (optional)
  
      return recentCandles;
    } catch (error) {
      console.error("Failed to fetch stock history from Alpha Vantage", error);
      return [];
    }
  }
  