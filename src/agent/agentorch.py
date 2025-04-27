import os
import json
import logging
import re
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
            },
            {
                "type": "function",
                "function": {
                    "name": "get_user_profile",
                    "description": "Fetches the user's banking and portfolio details based on userid.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "userid": {
                                "type": "string",
                                "description": "The ID of the user to retrieve profile for."
                            }
                        },
                        "required": ["userid"],
                        "additionalProperties": False
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "buy_stock",
                    "description": "Buys stocks for a user by updating their portfolio based on current market price.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "userid": {"type": "string", "description": "The user's ID"},
                            "stock_symbol": {"type": "string", "description": "Ticker symbol of the stock (e.g., AAPL, TSLA)"},
                            "quantity": {"type": "integer", "description": "How many stocks to buy"}
                        },
                        "required": ["userid", "stock_symbol", "quantity"],
                        "additionalProperties": False
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "sell_stock",
                    "description": "Sells stocks for a user by updating their portfolio and bank balance based on current market price.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "userid": {"type": "string", "description": "The user's ID"},
                            "stock_symbol": {"type": "string", "description": "Ticker symbol of the stock (e.g., AAPL, TSLA)"},
                            "quantity": {"type": "integer", "description": "How many stocks to sell"}
                        },
                        "required": ["userid", "stock_symbol", "quantity"],
                        "additionalProperties": False
                    }
                }
            }
        ]

    def load_user_profile(self, userid: str) -> str:
        try:
            with open("user_data.json", "r") as f:
                users = json.load(f)
            for user in users:
                if user.get("userid") == userid:
                    return json.dumps(user, indent=2)
            return json.dumps({"error": "User not found"}, indent=2)
        except Exception as e:
            logging.error(f"Error loading user profile: {e}")
            return json.dumps({"error": "Failed to load user data"}, indent=2)

    def buy_stock_for_user(self, userid: str, stock_symbol: str, quantity: int) -> str:
        try:
            with open("user_data.json", "r") as f:
                users = json.load(f)

            user_found = False
            for user in users:
                if user.get("userid") == userid:
                    user_found = True

                    stock_info = self.research.search_and_respond(company_name=stock_symbol)
                    price_match = re.search(r"\$?(\d+\.?\d*)", stock_info)
                    if not price_match:
                        return json.dumps({"error": "Could not parse stock price."}, indent=2)

                    current_price = float(price_match.group(1))
                    total_cost = current_price * quantity

                    if user["bank_bal"] < total_cost:
                        return json.dumps({"error": "Insufficient balance."}, indent=2)

                    user["bank_bal"] -= total_cost

                    portfolio = user.get("portfolio", {})
                    portfolio[stock_symbol] = portfolio.get(stock_symbol, 0) + quantity
                    user["portfolio"] = portfolio

                    break

            if not user_found:
                return json.dumps({"error": "User not found."}, indent=2)

            with open("user_data.json", "w") as f:
                json.dump(users, f, indent=2)

            return json.dumps({"message": "Stock purchased successfully."}, indent=2)

        except Exception as e:
            logging.error(f"Error buying stock: {e}")
            return json.dumps({"error": "Failed to buy stock."}, indent=2)

    def sell_stock_for_user(self, userid: str, stock_symbol: str, quantity: int) -> str:
        try:
            with open("user_data.json", "r") as f:
                users = json.load(f)

            user_found = False
            for user in users:
                if user.get("userid") == userid:
                    user_found = True

                    stock_info = self.research.search_and_respond(company_name=stock_symbol)
                    price_match = re.search(r"\$?(\d+\.?\d*)", stock_info)
                    if not price_match:
                        return json.dumps({"error": "Could not parse stock price."}, indent=2)

                    current_price = float(price_match.group(1))
                    total_gain = current_price * quantity

                    portfolio = user.get("portfolio", {})

                    if portfolio.get(stock_symbol, 0) < quantity:
                        return json.dumps({"error": "Not enough stock to sell."}, indent=2)

                    portfolio[stock_symbol] -= quantity
                    if portfolio[stock_symbol] == 0:
                        del portfolio[stock_symbol]

                    user["portfolio"] = portfolio
                    user["bank_bal"] += total_gain

                    break

            if not user_found:
                return json.dumps({"error": "User not found."}, indent=2)

            with open("user_data.json", "w") as f:
                json.dump(users, f, indent=2)

            return json.dumps({"message": "Stock sold successfully."}, indent=2)

        except Exception as e:
            logging.error(f"Error selling stock: {e}")
            return json.dumps({"error": "Failed to sell stock."}, indent=2)

    def chat(self, user_input: str, model: str = "gemini-2.5-pro-exp-03-25") -> str:
        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a helpful stock research and banking assistant."},
                    {"role": "user", "content": user_input}
                ],
                tools=self.tools,
                tool_choice="auto"
            )

            message = response.choices[0].message

            if message.tool_calls:
                tool_call = message.tool_calls[0]
                function_name = tool_call.function.name
                args = json.loads(tool_call.function.arguments)

                if function_name == "market_research":
                    company_name = args.get("company_name")
                    result = self.research.search_and_respond(company_name=company_name)

                elif function_name == "get_user_profile":
                    userid = args.get("userid")
                    result = self.load_user_profile(userid=userid)

                elif function_name == "buy_stock":
                    userid = args.get("userid")
                    stock_symbol = args.get("stock_symbol")
                    quantity = args.get("quantity")
                    result = self.buy_stock_for_user(userid=userid, stock_symbol=stock_symbol, quantity=quantity)

                elif function_name == "sell_stock":
                    userid = args.get("userid")
                    stock_symbol = args.get("stock_symbol")
                    quantity = args.get("quantity")
                    result = self.sell_stock_for_user(userid=userid, stock_symbol=stock_symbol, quantity=quantity)

                else:
                    result = json.dumps({"error": "Unknown function call."}, indent=2)

                input_messages = [
                    {"role": "system", "content": "You are a helpful stock research and banking assistant."},
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