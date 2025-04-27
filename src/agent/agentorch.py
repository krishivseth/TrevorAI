import os
import json
import logging
from openai import OpenAI
from dotenv import load_dotenv
from marketresearch import MarketResearch

class AgentOrch:
    def __init__(self):
        load_dotenv()
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("API_KEY not found in environment variables.")
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/"
        self.client = OpenAI(api_key=self.api_key, base_url=self.base_url)
        self.research = MarketResearch()

        self.tools = [
            {
                "type": "function",
                "function": {
                    "name": "market_research",
                    "description": "Research a company's stock and provide the current stock price and news.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "company_name": {
                                "type": "string",
                                "description": "The name of the company (e.g., Tesla, Apple, Google)"
                            }
                        },
                        "required": ["company_name"],
                        "additionalProperties": False
                    }
                }
            }
        ]

    def chat(self, user_input: str, model: str = "gemini-2.5-pro-exp-03-25") -> str:
        try:
            # Send initial user input along with tool definitions
            response = self.client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a helpful stock research assistant."},
                    {"role": "user", "content": user_input}
                ],
                tools=self.tools,
                tool_choice="auto"
            )

            message = response.choices[0].message

            # Check if the model triggered a function call
            if message.tool_calls:
                tool_call = message.tool_calls[0]
                args = json.loads(tool_call.function.arguments)
                company_name = args.get("company_name")

                # Call your MarketResearch function
                result = self.research.search_and_respond(company_name=company_name)

                # Send the tool output back to model
                input_messages = [
                    {"role": "system", "content": "You are a helpful stock research assistant."},
                    {"role": "user", "content": user_input},
                    {
                        "role": "assistant",
                        "tool_calls": [
                            {
                                "id": tool_call.id,
                                "type": "function",
                                "function": {
                                    "name": tool_call.function.name,
                                    "arguments": tool_call.function.arguments
                                }
                            }
                        ]
                    },
                    {
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": result
                    }
                ]

                final_response = self.client.chat.completions.create(
                    model=model,
                    messages=input_messages,
                    tools=self.tools
                )

                return final_response.choices[0].message.content

            else:
                return "Model did not trigger any tool."

        except Exception as e:
            logging.error(f"Error during function calling: {e}")
            raise
