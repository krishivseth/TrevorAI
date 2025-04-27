import os
import logging
import asyncio
from openai import AsyncOpenAI
from dotenv import load_dotenv

class SearchAPI:
    def __init__(self):
        load_dotenv()
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables.")
        self.client = AsyncOpenAI(api_key=self.api_key)

    async def search(self, query: str, model: str = "gpt-4o") -> str:
        try:
            response = await self.client.responses.create(
                model=model,
                tools=[{"type": "web_search_preview"}],
                input=[
                    {"role": "system", "content": "You are a web search assistant."},
                    {"role": "user", "content": query}
                ]
            )
            return response.output_text
        except Exception as e:
            logging.error(f"Error during OpenAI request: {e}")
            raise

async def main():
    logging.basicConfig(level=logging.INFO)
    query = "NVDA stock price in strictly one word. Such as '$100'"
    client = SearchAPI()
    try:
        output = await client.search(query)
        logging.info("Response:")
        print(output)
    except Exception:
        logging.error("Search failed.")

if __name__ == "__main__":
    asyncio.run(main())
