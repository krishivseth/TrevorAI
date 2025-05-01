Inspiration
Inspired by Trevor Lefkowitz from Ghosts US, TrevorAI is a wealth-management agent designed for everyday investors. Just like the financially savvy ghost Trevor, our AI assistant helps users make informed investment decisions without complex financial jargon. We noticed that many people find the stock market intimidating, and wealth-management services are often accessible only to high-net-worth individuals. TrevorAI bridges this gap by bringing personalized investment assistance to everyone.

What it does
TrevorAI is an AI-powered financial assistant that:

Analyzes the user’s portfolio and recommends optimal stocks to buy based on risk profile and goals
Monitors stock performance in real time and suggests strategic buy/sell timings
Executes trades automatically when authorized by the user
Provides a comprehensive dashboard visualizing portfolio performance, stock distributions, and trends
Maintains a detailed transaction history, distinguishing between AI-initiated and user-initiated trades
Enables natural phone conversations for stock management—no technical know-how required
How we built it
Our solution combines several technologies:

Frontend:
Framework: Next.js
Styling: Tailwind CSS
Visualization: Recharts, Nivo
Backend:
Server: Flask
Communication: WebSockets & RESTful APIs
AI Agent:
Architecture: Multi-agent system powered by Gemini 2.5 Flash
Features: Function calling for conversational finance tasks
Research Tools:
Custom integrations for stock research, web search, and market analysis
Financial Data:
APIs: Finnhub, AlphaVantage (real-time stock quotes)
Database:
Storage: Structured JSON for portfolios and transactions
Phone Integration:
Voice tech enabling hands-free interaction with TrevorAI
Challenges we ran into
Finnhub Module Integration: Adapting the CommonJS finnhub module to work with Next.js server components, handling client vs. server contexts
Real-time Data Rendering: Optimizing performance for complex visualizations with live updates
Natural Language Understanding: Building sophisticated tool-calling logic to parse varied user queries
Market Data Limits: Staying within free-tier API quotas while maintaining accurate portfolio valuations
Accomplishments that we’re proud of
Built an intuitive dashboard that makes complex financial data accessible
Implemented an AI agent capable of both advising on and executing trades
Created a responsive UI compatible across desktop and mobile
Enabled phone-call interactions to reach users who prefer voice over text
Distinguished AI-initiated vs. user-initiated trades for full transparency
What we learned
The power of clear, intuitive visualizations for complex datasets
Best practices for integrating AI agents into production apps
Techniques for handling and streaming real-time financial data
Designing cross-platform experiences that blend voice and visual interfaces
Security and responsibility considerations when automating financial transactions
What’s next for TrevorAI
Advanced Portfolio Analysis: More sophisticated optimization algorithms
Expanded Asset Classes: Support for ETFs, bonds, and cryptocurrencies
Personalized Learning: Adaptive recommendations based on user behavior
Notifications: Proactive alerts for market events impacting user holdings
Social Features: Opt-in sharing of portfolios and strategies
Brokerage Integration: Seamless connectivity with major trading platforms
Enhanced Research: Deeper trend forecasting and company analysis
