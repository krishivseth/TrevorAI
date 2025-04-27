import os
import logging
from openai import OpenAI
from dotenv import load_dotenv

class MarketResearch:
    def __init__(self):
        load_dotenv()
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables.")
        self.client = OpenAI(api_key=self.api_key)

    def search_and_respond(self, company_name: str, model: str = "gpt-4o") -> str:
        """
        Perform a search-enabled query using the OpenAI API.

        Args:
            query (str): The question or prompt to be sent.
            model (str): The model version to use.

        Returns:
            str: The AI's output text.
        """
        try:
            response = self.client.responses.create(
                model=model,
                tools=[{"type": "web_search_preview"}],
                input=  [{"role":"system","content":"You are a news curator. Your job is to constantly monitor current events across politics, technology, business, science, and culture. Summarize important developments clearly, stay unbiased, highlight emerging trends, and maintain up-to-date knowledge about what's happening around the world"},
                        {"role":"user","content":f"Research what's happening around {company_name} stocks and tell me the current stock price"}]
            )
            return response.output_text
        except Exception as e:
            logging.error(f"Error during OpenAI request: {e}")
            raise

def main():
    logging.basicConfig(level=logging.INFO)
    
    comp_name = "NVIDIA"
    
    ai_client = OpenAIClient()
    try:
        output = ai_client.search_and_respond(comp_name)
        logging.info("Response from AI:")
        print(output)
    except Exception as e:
        logging.error("Failed to get a response from OpenAI.")

if __name__ == "__main__":
    main()
