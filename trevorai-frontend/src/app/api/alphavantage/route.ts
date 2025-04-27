// src/app/api/alphavantage/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol');
  
  const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;

  if (!symbol) {
    return NextResponse.json({ error: "Missing symbol" }, { status: 400 });
  }

  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&outputsize=compact&apikey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 });
  }
}
