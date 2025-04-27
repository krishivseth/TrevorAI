import os
import logging
import asyncio
from openai import AsyncOpenAI
from dotenv import load_dotenv

class MarketResearch:
    def __init__(self):
        load_dotenv()
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables.")
        self.client = AsyncOpenAI(api_key=self.api_key)

    async def deep_search(self, company_name: str, model: str = "gpt-4o") -> str:
        try:
            response = await self.client.responses.create(
                model=model,
                tools=[{"type": "web_search_preview"}],
                input=[
                    {"role": "system", "content": "You are a company news curator. Your job is to constantly monitor current events across politics, technology, business, science, and culture. Summarize important developments clearly, stay unbiased, highlight emerging trends, and maintain up-to-date knowledge about what's happening around the world"},
                    {"role": "user", "content": f"Research what's happening around {company_name} stocks and tell me the current stock price"}
                ]
            )
            return response.output_text
        except Exception as e:
            logging.error(f"Error during OpenAI request: {e}")
            raise

async def main():
    logging.basicConfig(level=logging.INFO)

    comp_name = "NVIDIA"

    ai_client = MarketResearch()
    try:
        output = await ai_client.deep_search(comp_name)
        logging.info("Response from AI:")
        print(output)
    except Exception as e:
        logging.error("Failed to get a response from OpenAI.")

if __name__ == "__main__":
    asyncio.run(main())
