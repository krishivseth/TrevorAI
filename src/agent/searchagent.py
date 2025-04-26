import os
import logging
from openai import OpenAI
from dotenv import load_dotenv

class OpenAIClient:
    def __init__(self):
        load_dotenv()
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables.")
        self.client = OpenAI(api_key=self.api_key)

    def search_and_respond(self, query: str, model: str = "gpt-4.1") -> str:
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
                input=query,
            )
            return response.output_text
        except Exception as e:
            logging.error(f"Error during OpenAI request: {e}")
            raise

def main():
    logging.basicConfig(level=logging.INFO)
    
    query = "Research NVIDIA stock and tell me if it is a good time to buy stocks or not"
    
    ai_client = OpenAIClient()
    try:
        output = ai_client.search_and_respond(query)
        logging.info("Response from AI:")
        print(output)
    except Exception as e:
        logging.error("Failed to get a response from OpenAI.")

if __name__ == "__main__":
    main()
