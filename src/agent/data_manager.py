import os
import json
import re
import asyncio
import logging


class UserDataManager:
    def __init__(self, file_path="user_data.json"):
        self.file_path = file_path

    async def load_users(self):
        try:
            async with asyncio.to_thread(open, self.file_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            logging.error(f"Error loading users: {e}")
            return []

    async def save_users(self, users):
        try:
            async with asyncio.to_thread(open, self.file_path, 'w') as f:
                json.dump(users, f, indent=2)
        except Exception as e:
            logging.error(f"Error saving users: {e}")

    async def get_user_profile(self, userid: str) -> dict:
        users = await self.load_users()
        for user in users:
            if user.get("userid") == userid:
                return user
        return {"error": "User not found"}

    async def buy_stock(self, userid: str, stock_symbol: str, quantity: int, stock_price: float) -> dict:
        users = await self.load_users()
        for user in users:
            if user.get("userid") == userid:
                total_cost = stock_price * quantity
                if user.get("bank_bal", 0) < total_cost:
                    return {"error": "Insufficient balance."}
                user["bank_bal"] -= total_cost
                portfolio = user.setdefault("portfolio", {})
                portfolio[stock_symbol] = portfolio.get(stock_symbol, 0) + quantity
                await self.save_users(users)
                return {"message": "Stock purchased successfully."}
        return {"error": "User not found."}

    async def sell_stock(self, userid: str, stock_symbol: str, quantity: int, stock_price: float) -> dict:
        users = await self.load_users()
        for user in users:
            if user.get("userid") == userid:
                portfolio = user.get("portfolio", {})
                if portfolio.get(stock_symbol, 0) < quantity:
                    return {"error": "Not enough stock to sell."}
                portfolio[stock_symbol] -= quantity
                if portfolio[stock_symbol] == 0:
                    del portfolio[stock_symbol]
                user["bank_bal"] += stock_price * quantity
                await self.save_users(users)
                return {"message": "Stock sold successfully."}
        return {"error": "User not found."}