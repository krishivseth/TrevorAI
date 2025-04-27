import aiofiles
import json
import re
import logging
import uuid
from datetime import datetime

class DBHandler:
    def __init__(self, research_client):
        self.research_client = research_client

    async def get_user_profile(self, userid: str) -> str:
        try:
            async with aiofiles.open("C:\\Users\\Administrator\\Downloads\\TrevorAI\\trevorai-backend\\data\\user_data.json", "r") as f:
                content = await f.read()
                users = json.loads(content)

            for user in users:
                if user.get("userid") == userid:
                    return json.dumps(user, indent=2)

            return json.dumps({"error": "User not found"}, indent=2)
        except Exception as e:
            logging.error(f"Error loading user profile: {e}")
            return json.dumps({"error": "Failed to load user data"}, indent=2)

    async def _log_transaction(self, userid: str, stock_symbol: str, transaction_type: str, shares: int, price_per_share: float):
        """Internal helper to log the transaction into C:\\Users\\Administrator\\Downloads\\TrevorAI\\trevorai-backend\\data\\user_transaction.json"""
        try:
            # Load existing transactions
            async with aiofiles.open("C:\\Users\\Administrator\\Downloads\\TrevorAI\\trevorai-backend\\data\\user_transaction.json", "r") as f:
                content = await f.read()
                transactions = json.loads(content)

            # Create a new transaction entry
            new_transaction = {
                "id": str(len(transactions) + 1),
                "userid": userid,
                "stock_symbol": stock_symbol,
                "stock_name": stock_symbol,  # Placeholder, since no name lookup is implemented
                "type": transaction_type,    # "buy" or "sell"
                "shares": shares,
                "price_per_share": price_per_share,
                "date": datetime.utcnow().strftime("%Y-%m-%d"),
                "initiator": "agent"
            }

            transactions.append(new_transaction)

            # Save back
            async with aiofiles.open("C:\\Users\\Administrator\\Downloads\\TrevorAI\\trevorai-backend\\data\\user_transaction.json", "w") as f:
                await f.write(json.dumps(transactions, indent=2))

        except Exception as e:
            logging.error(f"Error logging transaction: {e}")

    async def buy_stock_for_user(self, userid: str, stock_symbol: str, quantity: int) -> str:
        try:
            async with aiofiles.open("C:\\Users\\Administrator\\Downloads\\TrevorAI\\trevorai-backend\\data\\user_data.json", "r") as f:
                content = await f.read()
                users = json.loads(content)

            user_found = False
            for user in users:
                if user.get("userid") == userid:
                    user_found = True

                    stock_info = await self.research_client.search(f"{stock_symbol} stock price in strictly one word. Such as '$100'")
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

                    # Log transaction
                    await self._log_transaction(userid, stock_symbol, "buy", quantity, current_price)

                    break

            if not user_found:
                return json.dumps({"error": "User not found."}, indent=2)

            async with aiofiles.open("C:\\Users\\Administrator\\Downloads\\TrevorAI\\trevorai-backend\\data\\user_data.json", "w") as f:
                await f.write(json.dumps(users, indent=2))

            return json.dumps({"message": "Stock purchased successfully."}, indent=2)

        except Exception as e:
            logging.error(f"Error buying stock: {e}")
            return json.dumps({"error": "Failed to buy stock."}, indent=2)

    async def sell_stock_for_user(self, userid: str, stock_symbol: str, quantity: int) -> str:
        try:
            async with aiofiles.open("C:\\Users\\Administrator\\Downloads\\TrevorAI\\trevorai-backend\\data\\user_data.json", "r") as f:
                content = await f.read()
                users = json.loads(content)

            user_found = False
            for user in users:
                if user.get("userid") == userid:
                    user_found = True

                    stock_info = await self.research_client.search(f"{stock_symbol} stock price in strictly one word. Such as '$100'")
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

                    # Log transaction
                    await self._log_transaction(userid, stock_symbol, "sell", quantity, current_price)

                    break

            if not user_found:
                return json.dumps({"error": "User not found."}, indent=2)

            async with aiofiles.open("C:\\Users\\Administrator\\Downloads\\TrevorAI\\trevorai-backend\\data\\user_data.json", "w") as f:
                await f.write(json.dumps(users, indent=2))

            return json.dumps({"message": "Stock sold successfully."}, indent=2)

        except Exception as e:
            logging.error(f"Error selling stock: {e}")
            return json.dumps({"error": "Failed to sell stock."}, indent=2)
