const finnhub = require('finnhub');


const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY || ""; // safer to load from env

const finnhubClient = new finnhub.DefaultApi();

export async function getStockQuote(symbol: string): Promise<number | null> {
  return new Promise((resolve, reject) => {
    finnhubClient.quote(symbol, (error, data, _response) => {
      if (error) {
        console.error(`Error fetching stock price for ${symbol}`, error);
        resolve(null);
      } else {
        resolve(data.c ?? null); // c = current price
      }
    });
  });
}
